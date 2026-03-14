const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { client: esClient } = require('../config/elasticsearch');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Initialize Supabase clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().required(),
  discount_price: Joi.number().positive().optional(),
  category_id: Joi.string().uuid().required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).optional()
});

// Helper function to sync product to ElasticSearch
const syncProductToES = async (product, categoryName) => {
  try {
    await esClient.index({
      index: 'products',
      id: product.id,
      body: {
        ...product,
        category_name: categoryName,
        suggest: {
          input: [product.name, categoryName],
          weight: product.average_rating * 10 + product.total_reviews
        }
      }
    });
  } catch (error) {
    console.error('ElasticSearch sync error:', error);
  }
};

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
      min_rating,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories!inner(name, slug)
      `);

    // Apply filters
    if (category) {
      query = query.eq('categories.slug', category);
    }
    if (min_price) {
      query = query.gte('price', min_price);
    }
    if (max_price) {
      query = query.lte('price', max_price);
    }
    if (min_rating) {
      query = query.gte('average_rating', min_rating);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: products,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit)
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
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(name, slug)
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Log user activity for recommendations
    if (req.user) {
      await supabaseAdmin
        .from('user_activity')
        .insert({
          user_id: req.user.id,
          product_id: id,
          action_type: 'view'
        });
    }

    res.json({
      success: true,
      data: product
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
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('name')
      .eq('id', value.category_id)
      .single();

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Create product
    const { data: product, error: createError } = await supabaseAdmin
      .from('products')
      .insert(value)
      .select()
      .single();

    if (createError) {
      return res.status(400).json({
        success: false,
        error: createError.message
      });
    }

    // Sync to ElasticSearch
    await syncProductToES(product, category.name);

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

    // Update product
    const { data: product, error: updateError } = await supabaseAdmin
      .from('products')
      .update(value)
      .eq('id', id)
      .select(`
        *,
        categories(name)
      `)
      .single();

    if (updateError || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or update failed'
      });
    }

    // Sync to ElasticSearch
    await syncProductToES(product, product.categories.name);

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

    // Delete product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Remove from ElasticSearch
    try {
      await esClient.delete({
        index: 'products',
        id: id
      });
    } catch (esError) {
      console.error('ElasticSearch delete error:', esError);
    }

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