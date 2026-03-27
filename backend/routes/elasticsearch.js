const express = require('express');
const router = express.Router();
const elasticsearchService = require('../services/elasticsearch');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Admin auth middleware
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

/**
 * @route   GET /api/elasticsearch/search
 * @desc    Search products using ElasticSearch
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'relevance',
      fuzzy = 'true'
    } = req.query;

    // Log search analytics
    if (q && q.trim()) {
      try {
        db.prepare(`
          INSERT INTO search_analytics (search_query, results_count, user_id)
          VALUES (?, 0, ?)
        `).run(q.trim(), req.user?.id || null);
      } catch (error) {
        console.error('Failed to log search:', error.message);
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sortBy,
      fuzzy: fuzzy === 'true'
    };

    const results = await elasticsearchService.searchProducts(q, options);

    // Update results count in analytics
    if (q && q.trim()) {
      try {
        db.prepare(`
          UPDATE search_analytics 
          SET results_count = ?
          WHERE search_query = ? AND created_at = (
            SELECT MAX(created_at) FROM search_analytics WHERE search_query = ?
          )
        `).run(results.total, q.trim(), q.trim());
      } catch (error) {
        console.error('Failed to update search count:', error.message);
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/elasticsearch/autocomplete
 * @desc    Get autocomplete suggestions
 * @access  Public
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await elasticsearchService.autoComplete(q, parseInt(limit));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Autocomplete failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/elasticsearch/suggestions
 * @desc    Get popular search suggestions
 * @access  Public
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const suggestions = await elasticsearchService.getSearchSuggestions(parseInt(limit));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/elasticsearch/index/:productId
 * @desc    Index a single product (Admin only)
 * @access  Private/Admin
 */
router.post('/index/:productId', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const success = await elasticsearchService.indexProduct(productId);

    if (success) {
      res.json({
        success: true,
        message: 'Product indexed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to index product'
      });
    }
  } catch (error) {
    console.error('Index error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to index product',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/elasticsearch/index-all
 * @desc    Index all products (Admin only)
 * @access  Private/Admin
 */
router.post('/index-all', authenticateToken, adminAuth, async (req, res) => {
  try {
    const result = await elasticsearchService.indexAllProducts();

    res.json({
      success: result.success,
      message: result.success 
        ? `Successfully indexed ${result.count} products`
        : 'Failed to index products',
      count: result.count
    });
  } catch (error) {
    console.error('Index all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to index products',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/elasticsearch/index/:productId
 * @desc    Delete product from index (Admin only)
 * @access  Private/Admin
 */
router.delete('/index/:productId', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const success = await elasticsearchService.deleteProduct(productId);

    if (success) {
      res.json({
        success: true,
        message: 'Product removed from index'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to remove product from index'
      });
    }
  } catch (error) {
    console.error('Delete index error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from index',
      error: error.message
    });
  }
});

module.exports = router;
