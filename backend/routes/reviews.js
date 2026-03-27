const express = require('express');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadMultipleImages } = require('../services/imageUpload');
const Joi = require('joi');

const router = express.Router();

// Validation schema
const reviewSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(10).optional().allow('')
});

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = db.prepare(`
      SELECT r.*, u.full_name as user_name, u.email as user_email
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `).all(productId, parseInt(limit), offset);

    // Parse images JSON for each review
    const reviewsWithImages = reviews.map(review => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : []
    }));

    const { total } = db.prepare('SELECT COUNT(*) as total FROM reviews WHERE product_id = ?').get(productId);

    res.json({
      success: true,
      data: reviewsWithImages,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a review with optional images
// @access  Private
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    // Validate form data
    const { error, value } = reviewSchema.validate({
      product_id: parseInt(req.body.product_id),
      rating: parseInt(req.body.rating),
      comment: req.body.comment
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { product_id, rating, comment } = value;
    const userId = req.user.id;

    // Check if product exists
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existing = db.prepare('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?').get(product_id, userId);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product'
      });
    }

    // Upload images if provided
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        imageUrls = await uploadMultipleImages(req.files);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload images'
        });
      }
    }

    // Create review with images
    const insert = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment, images) VALUES (?, ?, ?, ?, ?)');
    const result = insert.run(product_id, userId, rating, comment || '', JSON.stringify(imageUrls));

    const review = db.prepare(`
      SELECT r.*, u.full_name as user_name
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    // Parse images
    review.images = review.images ? JSON.parse(review.images) : [];

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
