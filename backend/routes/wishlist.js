const express = require('express');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlistItems = db.prepare(`
      SELECT 
        w.id,
        w.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.image_url,
        p.stock_quantity,
        c.name as category_name
      FROM wishlist w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(userId);

    res.json({
      success: true,
      data: wishlistItems
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if already in wishlist
    const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(userId, product_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const insert = db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)');
    const result = insert.run(userId, product_id);

    const wishlistItem = db.prepare(`
      SELECT 
        w.id,
        w.created_at,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url
      FROM wishlist w
      INNER JOIN products p ON w.product_id = p.id
      WHERE w.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: wishlistItem,
      message: 'Added to wishlist'
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/wishlist/:id
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user
    const item = db.prepare('SELECT id FROM wishlist WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist item not found'
      });
    }

    db.prepare('DELETE FROM wishlist WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/wishlist/product/:productId
// @desc    Remove product from wishlist by product ID
// @access  Private
router.delete('/product/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const item = db.prepare('SELECT id FROM wishlist WHERE product_id = ? AND user_id = ?').get(productId, userId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Product not in wishlist'
      });
    }

    db.prepare('DELETE FROM wishlist WHERE product_id = ? AND user_id = ?').run(productId, userId);

    res.json({
      success: true,
      message: 'Removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const item = db.prepare('SELECT id FROM wishlist WHERE product_id = ? AND user_id = ?').get(productId, userId);

    res.json({
      success: true,
      inWishlist: !!item
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
