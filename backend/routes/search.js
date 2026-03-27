const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

// @route   GET /api/search/suggest
// @desc    Get search suggestions (auto-complete)
// @access  Public
router.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = `${q}%`; // Prefix match for auto-complete

    // Get product name suggestions
    const suggestions = db.prepare(`
      SELECT DISTINCT name, slug, id
      FROM products
      WHERE name LIKE ? COLLATE NOCASE
      ORDER BY name
      LIMIT 10
    `).all(searchTerm);

    // Get category suggestions
    const categorySuggestions = db.prepare(`
      SELECT DISTINCT name, slug
      FROM categories
      WHERE name LIKE ? COLLATE NOCASE
      LIMIT 5
    `).all(searchTerm);

    res.json({
      success: true,
      data: {
        products: suggestions,
        categories: categorySuggestions
      }
    });

  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/search
// @desc    Search products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, category, min_price, max_price, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;

    // Build query
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.name LIKE ? OR p.description LIKE ?)
    `;
    const params = [searchTerm, searchTerm];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    if (min_price) {
      query += ` AND p.price >= ?`;
      params.push(min_price);
    }
    if (max_price) {
      query += ` AND p.price <= ?`;
      params.push(max_price);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const products = db.prepare(query).all(...params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.name LIKE ? OR p.description LIKE ?)
    `;
    const countParams = [searchTerm, searchTerm];

    if (category) {
      countQuery += ` AND c.slug = ?`;
      countParams.push(category);
    }
    if (min_price) {
      countQuery += ` AND p.price >= ?`;
      countParams.push(min_price);
    }
    if (max_price) {
      countQuery += ` AND p.price <= ?`;
      countParams.push(max_price);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    // Log search analytics
    db.prepare('INSERT INTO search_analytics (query, results_count) VALUES (?, ?)').run(q, total);

    res.json({
      success: true,
      data: products,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      },
      query: q
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
