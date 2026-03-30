const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/database');

const router = express.Router();

/**
 * @route   POST /api/payment/bank-transfer/simulate
 * @desc    Simulate bank transfer payment (Demo only)
 * @access  Private
 */
router.post('/bank-transfer/simulate', authenticateToken, async (req, res) => {
  try {
    const { orderId, success = true } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Verify order belongs to user
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
      .get(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    if (success) {
      // Simulate successful payment
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'paid',
            payment_method = 'bank_transfer',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);

      res.json({
        success: true,
        message: 'Payment completed successfully (Demo)',
        data: { 
          orderId, 
          status: 'paid',
          transactionRef: `DEMO_${orderId}_${Date.now()}`
        }
      });
    } else {
      // Simulate failed payment
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);

      res.json({
        success: false,
        message: 'Payment failed (Demo)',
        data: { orderId, status: 'failed' }
      });
    }

  } catch (error) {
    console.error('Simulate payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate payment'
    });
  }
});

/**
 * @route   GET /api/payment/transaction/:orderId
 * @desc    Get payment transaction details
 * @access  Private
 */
router.get('/transaction/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order belongs to user (or user is admin)
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          total_amount: order.total_amount,
          payment_status: order.payment_status,
          payment_method: order.payment_method
        }
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction details'
    });
  }
});

module.exports = router;
