const express = require('express');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Validation schema
const createOrderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required()
  })).min(1).required(),
  shipping_address: Joi.string().required(),
  shipping_city: Joi.string().required(),
  shipping_phone: Joi.string().required()
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, parseInt(limit), offset);

    // Get order items for each order
    orders.forEach(order => {
      order.order_items = db.prepare(`
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
    });

    const { total } = db.prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?').get(userId);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get order items
    order.order_items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image_url, p.category_id,
             c.name as category_name
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { items, shipping_address, shipping_city, shipping_phone } = value;
    const userId = req.user.id;

    // Calculate total
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Create order
    const insertOrder = db.prepare(`
      INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_phone, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `);
    const orderResult = insertOrder.run(userId, totalAmount, shipping_address, shipping_city, shipping_phone);
    const orderId = orderResult.lastInsertRowid;

    // Create order items
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    
    items.forEach(item => {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      
      // Update product stock
      db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(item.quantity, item.product_id);
    });

    // Clear user's cart
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    // Get created order with items
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    order.order_items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
