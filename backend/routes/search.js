const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { client: esClient } = require('../config/elasticsearch');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize Supabase clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// @route   GET /api/search
// @desc    Search products using ElasticSearch
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      q = '',
      category,
      min_price,
      max_price,
      min_rating,
      sort_by = 'relevance',
      page = 1,
      limit = 12
    } = req.query;

    const from = (page - 1) * limit;

    // Build ElasticSearch query
    const searchBody = {
      from,
      size: parseInt(limit),
      query: {
        bool: {
          must: [],
          filter: []
        }
      },
      sort: [],
      highlight: {
        fields: {
          name: {},
          description: {}
        }
      }
    };

    // Add text search
    if (q.trim()) {
      searchBody.query.bool.must.push({
        multi_match: {
          query: q,
          fields: ['name^3', 'description^1'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    } else {
      searchBody.query.bool.must.push({
        match_all: {}
      });
    }

    // Add filters
    if (category) {
      searchBody.query.bool.filter.push({
        term: { category_name: category }
      });
    }

    if (min_price || max_price) {
      const priceRange = {};
      if (min_price) priceRange.gte = parseFloat(min_price);
      if (max_price) priceRange.lte = parseFloat(max_price);
      
      searchBody.query.bool.filter.push({
        range: { price: priceRange }
      });
    }

    if (min_rating) {
      searchBody.query.bool.filter.push({
        range: { average_rating: { gte: parseFloat(min_rating) } }
      });
    }

    // Add sorting
    switch (sort_by) {
      case 'price_asc':
        searchBody.sort.push({ price: { order: 'asc' } });
        break;
      case 'price_desc':
        searchBody.sort.push({ price: { order: 'desc' } });
        break;
      case 'rating':
        searchBody.sort.push({ average_rating: { order: 'desc' } });
        break;
      case 'newest':
        searchBody.sort.push({ created_at: { order: 'desc' } });
        break;
      default: // relevance
        if (q.trim()) {
          searchBody.sort.push('_score');
        } else {
          searchBody.sort.push({ created_at: { order: 'desc' } });
        }
    }

    // Execute search
    const response = await esClient.search({
      index: 'products',
      body: searchBody
    });

    const products = response.body.hits.hits.map(hit => ({
      ...hit._source,
      _score: hit._score,
      highlight: hit.highlight
    }));

    const total = response.body.hits.total.value;

    res.json({
      success: true,
      data: products,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      },
      search_info: {
        query: q,
        took: response.body.took,
        total_hits: total
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    
    // Fallback to database search if ElasticSearch fails
    try {
      let query = supabaseAdmin
        .from('products')
        .select(`
          *,
          categories(name, slug)
        `);

      if (q.trim()) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data: products } = await query.limit(parseInt(limit));

      res.json({
        success: true,
        data: products || [],
        fallback: true,
        message: 'Search completed using database fallback'
      });

    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError);
      res.status(500).json({
        success: false,
        error: 'Search service unavailable'
      });
    }
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions/autocomplete
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '' } = req.query;

    if (!q.trim()) {
      return res.json({
        success: true,
        data: []
      });
    }

    const response = await esClient.search({
      index: 'products',
      body: {
        suggest: {
          product_suggest: {
            prefix: q,
            completion: {
              field: 'name.suggest',
              size: 10
            }
          }
        },
        _source: false
      }
    });

    const suggestions = response.body.suggest.product_suggest[0].options.map(
      option => option.text
    );

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({
      success: true,
      data: []
    });
  }
});

// @route   GET /api/search/popular
// @desc    Get popular search terms
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    // This would typically come from search analytics
    // For now, return some static popular terms
    const popularTerms = [
      'iPhone',
      'MacBook',
      'Nike',
      'Samsung',
      'Laptop',
      'Smartphone',
      'Headphones',
      'Watch'
    ];

    res.json({
      success: true,
      data: popularTerms
    });

  } catch (error) {
    console.error('Popular terms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;