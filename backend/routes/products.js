const express = require('express');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().required(),
  category_id: Joi.number().integer().required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  image_url: Joi.string().uri().optional().allow(''),
  is_featured: Joi.boolean().optional()
});

// @route   GET /api/products
// @desc    Get all products with pagination and filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      min_price,
      max_price,
      is_featured,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
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
    if (is_featured !== undefined) {
      query += ` AND p.is_featured = ?`;
      params.push(is_featured === 'true' ? 1 : 0);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'price', 'name'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortColumn} ${sortDir}`;

    // Apply pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const products = db.prepare(query).all(...params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    
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
    if (is_featured !== undefined) {
      countQuery += ` AND p.is_featured = ?`;
      countParams.push(is_featured === 'true' ? 1 : 0);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: products,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product with related products
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get average rating and review count
    const stats = db.prepare(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE product_id = ?
    `).get(id);

    product.average_rating = stats.average_rating || 0;
    product.review_count = stats.review_count || 0;
    product.total_reviews = stats.review_count || 0;

    // Get related products (same category, different product)
    const priceMin = product.price * 0.7;
    const priceMax = product.price * 1.3;

    const relatedProducts = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as average_rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? 
        AND p.id != ? 
        AND p.price BETWEEN ? AND ?
        AND p.stock_quantity > 0
      ORDER BY RANDOM()
      LIMIT 4
    `).all(product.category_id, id, priceMin, priceMax);

    res.json({
      success: true,
      data: {
        ...product,
        related_products: relatedProducts
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(value.category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Generate slug from name
    const slug = value.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create product
    const insert = db.prepare(`
      INSERT INTO products (name, slug, description, price, category_id, stock_quantity, image_url, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      value.name,
      slug,
      value.description || '',
      value.price,
      value.category_id,
      value.stock_quantity,
      value.image_url || '',
      value.is_featured ? 1 : 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if product exists
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Generate slug from name
    const slug = value.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Update product
    const update = db.prepare(`
      UPDATE products 
      SET name = ?, slug = ?, description = ?, price = ?, category_id = ?, 
          stock_quantity = ?, image_url = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(
      value.name,
      slug,
      value.description || '',
      value.price,
      value.category_id,
      value.stock_quantity,
      value.image_url || '',
      value.is_featured ? 1 : 0,
      id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Delete product
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
