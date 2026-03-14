const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Initialize Supabase clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Validation schema
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  slug: Joi.string().min(2).max(255).required(),
  parent_id: Joi.string().uuid().optional().allow(null)
});

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select(`
        *,
        parent:parent_id(name),
        children:categories!parent_id(id, name, slug)
      `)
      .order('name');

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

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

// @route   GET /api/categories/:id
// @desc    Get single category with products
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select(`
        *,
        parent:parent_id(name),
        children:categories!parent_id(id, name, slug),
        products(id, name, price, discount_price, images, average_rating, total_reviews)
      `)
      .eq('id', id)
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if parent category exists (if provided)
    if (value.parent_id) {
      const { data: parent } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', value.parent_id)
        .single();

      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'Parent category not found'
        });
      }
    }

    // Create category
    const { data: category, error: createError } = await supabaseAdmin
      .from('categories')
      .insert(value)
      .select()
      .single();

    if (createError) {
      return res.status(400).json({
        success: false,
        error: createError.message
      });
    }

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Prevent setting parent to self
    if (value.parent_id === id) {
      return res.status(400).json({
        success: false,
        error: 'Category cannot be its own parent'
      });
    }

    // Update category
    const { data: category, error: updateError } = await supabaseAdmin
      .from('categories')
      .update(value)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found or update failed'
      });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (products && products.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing products'
      });
    }

    // Check if category has children
    const { data: children } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('parent_id', id)
      .limit(1);

    if (children && children.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with subcategories'
      });
    }

    // Delete category
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;