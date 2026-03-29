const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `).all();

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get single category by slug with products
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.slug = ?
      GROUP BY c.id
    `).get(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get products in this category
    const products = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as average_rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `).all(category.id);

    res.json({
      success: true,
      data: {
        ...category,
        products
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
