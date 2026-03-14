const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { client: esClient } = require('../config/elasticsearch');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize Supabase clients
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Auto-complete suggestions with fuzzy matching
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchBody = {
      suggest: {
        product_suggest: {
          prefix: q,
          completion: {
            field: 'suggest',
            size: 10,
            skip_duplicates: true
          }
        },
        category_suggest: {
          prefix: q,
          completion: {
            field: 'category_suggest',
            size: 5
          }
        }
      },
      _source: false
    };

    const response = await esClient.search({
      index: 'products',
      body: searchBody
    });

    const productSuggestions = response.body.suggest.product_suggest[0].options.map(option => ({
      text: option.text,
      type: 'product',
      score: option._score
    }));

    const categorySuggestions = response.body.suggest.category_suggest[0].options.map(option => ({
      text: option.text,
      type: 'category',
      score: option._score
    }));

    const allSuggestions = [...productSuggestions, ...categorySuggestions]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({ success: true, data: allSuggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    
    // Fallback to database search
    try {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('name')
        .ilike('name', `%${q}%`)
        .limit(5);

      const suggestions = products?.map(p => ({
        text: p.name,
        type: 'product',
        score: 1
      })) || [];

      res.json({ success: true, data: suggestions, fallback: true });
    } catch (fallbackError) {
      res.json({ success: true, data: [] });
    }
  }
});

// Advanced search with multiple features
router.get('/advanced', optionalAuth, async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      min_price = 0,
      max_price = 999999999,
      min_rating = 0,
      sort_by = 'relevance',
      page = 1,
      limit = 20,
      in_stock_only = 'false',
      has_discount = 'false'
    } = req.query;

    const from = (page - 1) * limit;

    // Build advanced search query
    const must = [];
    const filter = [];
    const should = [];

    // Text search with fuzzy matching and boosting
    if (q.trim()) {
      must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: q,
                fields: ['name^5', 'description^2', 'category_name^3'],
                type: 'best_fields',
                fuzziness: 'AUTO',
                minimum_should_match: '75%'
              }
            },
            {
              match_phrase_prefix: {
                name: {
                  query: q,
                  boost: 3
                }
              }
            },
            {
              wildcard: {
                name: {
                  value: `*${q.toLowerCase()}*`,
                  boost: 2
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      });

      // Boost popular products in search results
      should.push({
        function_score: {
          query: { match_all: {} },
          functions: [
            {
              field_value_factor: {
                field: 'total_reviews',
                factor: 0.1,
                modifier: 'log1p',
                missing: 0
              }
            },
            {
              field_value_factor: {
                field: 'average_rating',
                factor: 0.2,
                modifier: 'sqrt',
                missing: 0
              }
            }
          ],
          score_mode: 'sum',
          boost_mode: 'multiply'
        }
      });
    } else {
      must.push({ match_all: {} });
    }

    // Filters
    if (category) {
      filter.push({ term: { 'category_slug.keyword': category } });
    }

    filter.push({
      range: {
        price: {
          gte: parseFloat(min_price),
          lte: parseFloat(max_price)
        }
      }
    });

    if (min_rating > 0) {
      filter.push({
        range: {
          average_rating: { gte: parseFloat(min_rating) }
        }
      });
    }

    if (in_stock_only === 'true') {
      filter.push({ term: { in_stock: true } });
    }

    if (has_discount === 'true') {
      filter.push({ range: { discount_percentage: { gt: 0 } } });
    }

    // Sort options
    let sort = [];
    switch (sort_by) {
      case 'price_asc':
        sort = [{ price: { order: 'asc' } }];
        break;
      case 'price_desc':
        sort = [{ price: { order: 'desc' } }];
        break;
      case 'rating':
        sort = [
          { average_rating: { order: 'desc' } },
          { total_reviews: { order: 'desc' } }
        ];
        break;
      case 'popularity':
        sort = [
          { total_reviews: { order: 'desc' } },
          { average_rating: { order: 'desc' } }
        ];
        break;
      case 'newest':
        sort = [{ created_at: { order: 'desc' } }];
        break;
      case 'discount':
        sort = [{ discount_percentage: { order: 'desc' } }];
        break;
      default: // relevance
        sort = q.trim() ? ['_score'] : [{ created_at: { order: 'desc' } }];
    }

    const searchBody = {
      query: {
        bool: {
          must,
          filter,
          should
        }
      },
      sort,
      from,
      size: parseInt(limit),
      highlight: {
        fields: {
          name: {
            pre_tags: ['<mark class="highlight">'],
            post_tags: ['</mark>']
          },
          description: {
            pre_tags: ['<mark class="highlight">'],
            post_tags: ['</mark>'],
            fragment_size: 150,
            number_of_fragments: 2
          }
        }
      },
      aggs: {
        categories: {
          terms: {
            field: 'category_slug.keyword',
            size: 20
          }
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { key: 'under_100k', to: 100000 },
              { key: '100k_500k', from: 100000, to: 500000 },
              { key: '500k_1m', from: 500000, to: 1000000 },
              { key: 'over_1m', from: 1000000 }
            ]
          }
        },
        rating_ranges: {
          range: {
            field: 'average_rating',
            ranges: [
              { key: '4_plus', from: 4 },
              { key: '3_plus', from: 3, to: 4 },
              { key: '2_plus', from: 2, to: 3 },
              { key: 'under_2', to: 2 }
            ]
          }
        },
        availability: {
          terms: {
            field: 'in_stock',
            size: 2
          }
        }
      }
    };

    const response = await esClient.search({
      index: 'products',
      body: searchBody
    });

    const hits = response.body.hits;
    const products = hits.hits.map(hit => ({
      ...hit._source,
      _score: hit._score,
      highlight: hit.highlight
    }));

    // Log search analytics
    if (q.trim()) {
      await logSearchQuery(q.trim(), hits.total.value, req.user?.id);
    }

    res.json({
      success: true,
      data: {
        products,
        total: hits.total.value,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(hits.total.value / limit),
        aggregations: response.body.aggregations,
        took: response.body.took
      }
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    
    // Fallback to basic database search
    try {
      let query = supabaseAdmin
        .from('products')
        .select(`
          *,
          categories (name, slug)
        `)
        .eq('is_active', true);

      if (q.trim()) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      if (category) {
        query = query.eq('categories.slug', category);
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: {
          products: data || [],
          total: data?.length || 0,
          page: parseInt(page),
          limit: parseInt(limit),
          fallback: true
        }
      });
    } catch (dbError) {
      res.status(500).json({ error: 'Search service unavailable' });
    }
  }
});

// Search analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter = new Date();
    switch (period) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    const { data: analytics, error } = await supabaseAdmin
      .from('search_analytics')
      .select('*')
      .gte('last_searched', dateFilter.toISOString())
      .order('search_count', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Group by query and sum counts
    const grouped = analytics?.reduce((acc, item) => {
      if (acc[item.query]) {
        acc[item.query].count += item.search_count;
        acc[item.query].results += item.result_count;
      } else {
        acc[item.query] = {
          query: item.query,
          count: item.search_count,
          results: item.result_count,
          last_searched: item.last_searched
        };
      }
      return acc;
    }, {}) || {};

    const topQueries = Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.json({ success: true, data: topQueries });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Popular searches
router.get('/popular', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('search_analytics')
      .select('query, search_count')
      .order('search_count', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.json({ success: true, data: [] });
  }
});

// Trending searches (searches with recent spike)
router.get('/trending', async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data: recent, error: recentError } = await supabaseAdmin
      .from('search_analytics')
      .select('query, search_count')
      .gte('last_searched', last24h.toISOString());

    const { data: weekly, error: weeklyError } = await supabaseAdmin
      .from('search_analytics')
      .select('query, search_count')
      .gte('last_searched', last7d.toISOString());

    if (recentError || weeklyError) throw recentError || weeklyError;

    // Calculate trending score (recent searches vs weekly average)
    const recentMap = new Map();
    recent?.forEach(item => {
      recentMap.set(item.query, (recentMap.get(item.query) || 0) + item.search_count);
    });

    const weeklyMap = new Map();
    weekly?.forEach(item => {
      weeklyMap.set(item.query, (weeklyMap.get(item.query) || 0) + item.search_count);
    });

    const trending = [];
    recentMap.forEach((recentCount, query) => {
      const weeklyCount = weeklyMap.get(query) || 0;
      const weeklyAvg = weeklyCount / 7;
      const trendScore = weeklyAvg > 0 ? recentCount / weeklyAvg : recentCount;
      
      if (trendScore > 1.5 && recentCount >= 2) { // Trending threshold
        trending.push({
          query,
          recent_count: recentCount,
          trend_score: trendScore
        });
      }
    });

    trending.sort((a, b) => b.trend_score - a.trend_score);

    res.json({ success: true, data: trending.slice(0, 10) });
  } catch (error) {
    console.error('Trending searches error:', error);
    res.json({ success: true, data: [] });
  }
});

// Helper function to log search queries
async function logSearchQuery(query, resultCount, userId = null) {
  try {
    const { data: existing } = await supabaseAdmin
      .from('search_analytics')
      .select('*')
      .eq('query', query.toLowerCase())
      .single();

    if (existing) {
      await supabaseAdmin
        .from('search_analytics')
        .update({
          search_count: existing.search_count + 1,
          result_count: resultCount,
          last_searched: new Date().toISOString(),
          last_user_id: userId
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('search_analytics')
        .insert({
          query: query.toLowerCase(),
          search_count: 1,
          result_count: resultCount,
          last_searched: new Date().toISOString(),
          last_user_id: userId
        });
    }
  } catch (error) {
    console.error('Failed to log search:', error);
  }
}

module.exports = router;