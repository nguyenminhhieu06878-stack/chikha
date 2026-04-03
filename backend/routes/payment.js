const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../config/database');
const { 
  createPaymentLink, 
  getPaymentInfo, 
  cancelPaymentLink,
  verifyWebhookSignature 
} = require('../services/payos');

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

/**
 * @route   POST /api/payment/payos/create
 * @desc    Create PayOS payment link
 * @access  Private
 */
router.post('/payos/create', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;

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

    // Create PayOS payment link
    const result = await createPaymentLink({
      orderId: order.id,
      amount: order.total_amount,
      description: `Thanh toán đơn hàng #${order.id}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success?orderId=${order.id}`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel?orderId=${order.id}`
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to create payment link'
      });
    }

    // Update order payment method
    db.prepare(`
      UPDATE orders 
      SET payment_method = 'payos',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(orderId);

    res.json({
      success: true,
      data: {
        checkoutUrl: result.data.checkoutUrl,
        orderId: order.id,
        amount: order.total_amount
      }
    });

  } catch (error) {
    console.error('Create PayOS payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment link'
    });
  }
});

/**
 * @route   GET /api/payment/payos/status/:orderId
 * @desc    Get PayOS payment status
 * @access  Private
 */
router.get('/payos/status/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order belongs to user
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
      .get(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get payment info from PayOS
    const result = await getPaymentInfo(Number(orderId));

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to get payment status'
      });
    }

    // Update order payment status based on PayOS response
    const paymentStatus = result.data.status === 'PAID' ? 'paid' : 
                         result.data.status === 'CANCELLED' ? 'failed' : 'pending';

    if (paymentStatus === 'paid') {
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'paid',
            status = 'processing',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        paymentStatus: paymentStatus,
        payosData: result.data
      }
    });

  } catch (error) {
    console.error('Get PayOS payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get payment status'
    });
  }
});

/**
 * @route   POST /api/payment/payos/webhook
 * @desc    PayOS webhook handler
 * @access  Public (verified by signature)
 */
router.post('/payos/webhook', async (req, res) => {
  try {
    const webhookData = req.body;

    // Verify webhook signature
    const verifiedData = verifyWebhookSignature(webhookData);

    if (!verifiedData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const { orderCode, code, desc } = verifiedData;

    // code === '00' means payment successful
    if (code === '00') {
      // Update order status to paid
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'paid',
            status = 'processing',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderCode);

      console.log(`✅ Order ${orderCode} paid successfully via PayOS webhook`);
    } else {
      // Payment failed or cancelled
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderCode);

      console.log(`❌ Order ${orderCode} payment failed: ${desc}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed'
    });

  } catch (error) {
    console.error('PayOS webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

/**
 * @route   POST /api/payment/payos/cancel/:orderId
 * @desc    Cancel PayOS payment
 * @access  Private
 */
router.post('/payos/cancel/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Verify order belongs to user
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
      .get(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Cancel payment link
    const result = await cancelPaymentLink(
      Number(orderId), 
      reason || 'Người dùng hủy thanh toán'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to cancel payment'
      });
    }

    // Update order status
    db.prepare(`
      UPDATE orders 
      SET payment_status = 'cancelled',
          status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(orderId);

    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel PayOS payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel payment'
    });
  }
});

module.exports = router;
