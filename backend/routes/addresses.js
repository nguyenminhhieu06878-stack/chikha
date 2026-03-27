const express = require('express');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Validation schema
const addressSchema = Joi.object({
  full_name: Joi.string().min(2).required(),
  phone: Joi.string().required(),
  address_line_1: Joi.string().required(),
  address_line_2: Joi.string().allow('').optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postal_code: Joi.string().required(),
  country: Joi.string().default('Vietnam'),
  is_default: Joi.boolean().optional()
});

// @route   GET /api/addresses
// @desc    Get user's addresses
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = db.prepare(`
      SELECT * FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `).all(userId);

    res.json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/addresses/:id
// @desc    Get single address
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(id, userId);

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/addresses
// @desc    Create new address
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const userId = req.user.id;

    // If this is set as default, unset other defaults
    if (value.is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    // If this is the first address, make it default
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?').get(userId);
    if (existingCount.count === 0) {
      value.is_default = true;
    }

    const insert = db.prepare(`
      INSERT INTO addresses (
        user_id, full_name, phone, address_line_1, address_line_2,
        city, state, postal_code, country, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      userId,
      value.full_name,
      value.phone,
      value.address_line_1,
      value.address_line_2 || '',
      value.city,
      value.state,
      value.postal_code,
      value.country || 'Vietnam',
      value.is_default ? 1 : 0
    );

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully'
    });

  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if address exists and belongs to user
    const existing = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // If this is set as default, unset other defaults
    if (value.is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?').run(userId, id);
    }

    const update = db.prepare(`
      UPDATE addresses SET
        full_name = ?,
        phone = ?,
        address_line_1 = ?,
        address_line_2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        country = ?,
        is_default = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(
      value.full_name,
      value.phone,
      value.address_line_1,
      value.address_line_2 || '',
      value.city,
      value.state,
      value.postal_code,
      value.country || 'Vietnam',
      value.is_default ? 1 : 0,
      id
    );

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);

    res.json({
      success: true,
      data: address,
      message: 'Address updated successfully'
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    db.prepare('DELETE FROM addresses WHERE id = ?').run(id);

    // If deleted address was default, set another as default
    if (address.is_default) {
      const firstAddress = db.prepare('SELECT id FROM addresses WHERE user_id = ? LIMIT 1').get(userId);
      if (firstAddress) {
        db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').run(firstAddress.id);
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/addresses/:id/default
// @desc    Set address as default
// @access  Private
router.put('/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Unset all defaults
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    
    // Set this as default
    db.prepare('UPDATE addresses SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Default address updated'
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
