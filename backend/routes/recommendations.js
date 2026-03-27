const express = require('express');
const router = express.Router();
const db = require('../config/database').db;

router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const priceMin = product.price * 0.7;
    const priceMax = product.price * 1.3;

    const similarProducts = db.prepare(`
      SELECT * FROM products 
      WHERE category_id = ? 
        AND id != ? 
        AND price BETWEEN ? AND ?
        AND stock_quantity > 0
      ORDER BY RANDOM()
      LIMIT ?
    `).all(product.category_id, productId, priceMin, priceMax, limit);

    res.json(similarProducts);
  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({ error: 'Failed to fetch similar products' });
  }
});

router.get('/personalized', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recommendations = db.prepare(`
      SELECT p.*, COUNT(r.id) as review_count, COALESCE(AVG(r.rating), 0) as avg_rating
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.stock_quantity > 0
      GROUP BY p.id
      ORDER BY review_count DESC, avg_rating DESC
      LIMIT ?
    `).all(limit);

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    // Real-time trending: Only count last 24 hours
    // Score = (orders * 10) + (views * 0.1) + (avg_rating * 2) + (reviews * 1)
    const trendingProducts = db.prepare(`
      SELECT 
        p.*,
        COUNT(DISTINCT oi.order_id) as order_count,
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT pv.id) as view_count,
        (
          (COUNT(DISTINCT oi.order_id) * 10) + 
          (COUNT(DISTINCT pv.id) * 0.1) + 
          (COALESCE(AVG(r.rating), 0) * 2) + 
          (COUNT(DISTINCT r.id) * 1)
        ) as trending_score
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.created_at >= datetime('now', '-1 day')
      LEFT JOIN reviews r ON p.id = r.product_id
      LEFT JOIN product_views pv ON p.id = pv.product_id
        AND pv.viewed_at >= datetime('now', '-1 day')
      WHERE p.stock_quantity > 0
      GROUP BY p.id
      ORDER BY 
        trending_score DESC,
        order_count DESC,
        view_count DESC
      LIMIT ?
    `).all(limit);

    res.json({
      success: true,
      data: trendingProducts,
      algorithm: 'Real-time trending (last 24 hours): (orders×10) + (views×0.1) + (rating×2) + (reviews×1)'
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch trending products' 
    });
  }
});

// Track product view
router.post('/track-view', async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user?.id || null;
    
    if (!product_id) {
      return res.status(400).json({
        success: false,
        error: 'product_id is required'
      });
    }

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    db.prepare('INSERT INTO product_views (product_id, user_id) VALUES (?, ?)').run(product_id, user_id);

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track view'
    });
  }
});

module.exports = router;
