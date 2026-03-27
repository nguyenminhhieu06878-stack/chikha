const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

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
 * @route   GET /api/coupons
 * @desc    Get all active coupons (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticateToken, adminAuth, (req, res) => {
  try {
    const coupons = db.prepare(`
      SELECT * FROM coupons
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
});

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon code
 * @access  Private
 */
router.post('/validate', authenticateToken, (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required'
      });
    }

    // Get coupon
    const coupon = db.prepare(`
      SELECT * FROM coupons
      WHERE code = ? AND is_active = 1
    `).get(code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check validity period
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom || now > validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired or not yet valid'
      });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Check minimum purchase amount
    if (orderAmount < coupon.min_purchase_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount is $${coupon.min_purchase_amount}`
      });
    }

    // Check if user already used this coupon
    const userUsage = db.prepare(`
      SELECT COUNT(*) as count
      FROM coupon_usage
      WHERE coupon_id = ? AND user_id = ?
    `).get(coupon.id, req.user.id);

    if (userUsage.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Round to 2 decimals
    discountAmount = Math.round(discountAmount * 100) / 100;

    res.json({
      success: true,
      data: {
        coupon_id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
        final_amount: orderAmount - discountAmount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon'
    });
  }
});

/**
 * @route   POST /api/coupons
 * @desc    Create new coupon (Admin only)
 * @access  Private/Admin
 */
router.post('/', authenticateToken, adminAuth, (req, res) => {
  try {
    const schema = Joi.object({
      code: Joi.string().required().uppercase(),
      description: Joi.string().required(),
      discount_type: Joi.string().valid('percentage', 'fixed').required(),
      discount_value: Joi.number().positive().required(),
      min_purchase_amount: Joi.number().min(0).default(0),
      max_discount_amount: Joi.number().positive().allow(null),
      usage_limit: Joi.number().integer().positive().allow(null),
      valid_from: Joi.date().required(),
      valid_until: Joi.date().greater(Joi.ref('valid_from')).required(),
      is_active: Joi.boolean().default(true)
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = db.prepare(`
      INSERT INTO coupons (
        code, description, discount_type, discount_value,
        min_purchase_amount, max_discount_amount, usage_limit,
        valid_from, valid_until, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      value.code,
      value.description,
      value.discount_type,
      value.discount_value,
      value.min_purchase_amount,
      value.max_discount_amount,
      value.usage_limit,
      value.valid_from,
      value.valid_until,
      value.is_active ? 1 : 0
    );

    const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
});

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update coupon (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', authenticateToken, adminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const schema = Joi.object({
      description: Joi.string(),
      discount_type: Joi.string().valid('percentage', 'fixed'),
      discount_value: Joi.number().positive(),
      min_purchase_amount: Joi.number().min(0),
      max_discount_amount: Joi.number().positive().allow(null),
      usage_limit: Joi.number().integer().positive().allow(null),
      valid_from: Joi.date(),
      valid_until: Joi.date(),
      is_active: Joi.boolean()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const updates = [];
    const values = [];

    Object.keys(value).forEach(key => {
      updates.push(`${key} = ?`);
      values.push(value[key]);
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`
      UPDATE coupons
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
});

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete coupon (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, adminAuth, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
});

/**
 * @route   GET /api/coupons/stats
 * @desc    Get coupon usage statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/stats', authenticateToken, adminAuth, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        c.id,
        c.code,
        c.description,
        c.discount_type,
        c.discount_value,
        c.usage_limit,
        c.used_count,
        COUNT(cu.id) as actual_usage,
        COALESCE(SUM(cu.discount_amount), 0) as total_discount_given
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      GROUP BY c.id
      ORDER BY actual_usage DESC
    `).all();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon statistics'
    });
  }
});

module.exports = router;
