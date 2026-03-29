const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/database');
const ospayService = require('../services/ospay');

const router = express.Router();

/**
 * @route   POST /api/payment/ospay/create
 * @desc    Create OSPay payment URL
 * @access  Private
 */
router.post('/ospay/create', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, orderInfo, customerName, customerEmail, customerPhone } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and amount are required'
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

    // Create payment URL
    const paymentUrl = ospayService.createPaymentUrl({
      orderId,
      amount,
      orderInfo: orderInfo || `Payment for order #${orderId}`,
      customerName: customerName || order.shipping_address,
      customerEmail,
      customerPhone: customerPhone || order.shipping_phone
    });

    // Update order payment method
    db.prepare('UPDATE orders SET payment_method = ? WHERE id = ?')
      .run('ospay', orderId);

    res.json({
      success: true,
      data: {
        paymentUrl,
        orderId
      }
    });

  } catch (error) {
    console.error('OSPay create payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment'
    });
  }
});

/**
 * @route   GET /api/payment/ospay/callback
 * @desc    Handle OSPay payment callback
 * @access  Public
 */
router.get('/ospay/callback', async (req, res) => {
  try {
    console.log('OSPay callback received:', req.query);

    // Verify callback
    const verification = ospayService.verifyCallback(req.query);

    if (!verification.isValid) {
      console.error('Invalid OSPay callback signature');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=invalid_signature`);
    }

    const { orderId, isSuccess, txnResponseCode, message, txnRef, amount, transactionNo } = verification;

    if (!orderId) {
      console.error('Order ID not found in callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=invalid_order`);
    }

    // Get order from database
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      console.error('Order not found:', orderId);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=order_not_found`);
    }

    if (isSuccess) {
      // Update order status to paid
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'paid',
            payment_method = 'ospay',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);

      // Log transaction
      db.prepare(`
        INSERT INTO payment_transactions (order_id, transaction_ref, amount, status, response_code, response_message, transaction_no)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(orderId, txnRef, amount, 'success', txnResponseCode, message, transactionNo || null);

      console.log(`Payment successful for order ${orderId}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`);
    } else {
      // Payment failed
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);

      // Log failed transaction
      db.prepare(`
        INSERT INTO payment_transactions (order_id, transaction_ref, amount, status, response_code, response_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(orderId, txnRef, amount, 'failed', txnResponseCode, message);

      console.log(`Payment failed for order ${orderId}: ${message}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}&error=${encodeURIComponent(message)}`);
    }

  } catch (error) {
    console.error('OSPay callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=system_error`);
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

    // Get transaction details
    const transaction = db.prepare(`
      SELECT * FROM payment_transactions 
      WHERE order_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(orderId);

    res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          total_amount: order.total_amount,
          payment_status: order.payment_status,
          payment_method: order.payment_method
        },
        transaction: transaction || null
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
