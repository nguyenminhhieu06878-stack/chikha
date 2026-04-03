const { PayOS } = require('@payos/node');

// Initialize PayOS
let payOS = null;

try {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (clientId && apiKey && checksumKey) {
    payOS = new PayOS(clientId, apiKey, checksumKey);
    console.log('✅ PayOS initialized successfully');
  } else {
    console.log('⚠️ PayOS not configured - missing credentials');
  }
} catch (error) {
  console.error('❌ PayOS initialization failed:', error.message);
}

/**
 * Create payment link
 */
async function createPaymentLink(orderData) {
  if (!payOS) {
    throw new Error('PayOS is not configured');
  }

  const { orderId, amount, description, returnUrl, cancelUrl } = orderData;

  const paymentData = {
    orderCode: Number(orderId),
    amount: Number(amount),
    description: description || `Thanh toán đơn hàng #${orderId}`,
    returnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
    cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
  };

  try {
    const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);
    return {
      success: true,
      data: paymentLinkResponse
    };
  } catch (error) {
    console.error('PayOS create payment link error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get payment info
 */
async function getPaymentInfo(orderCode) {
  if (!payOS) {
    throw new Error('PayOS is not configured');
  }

  try {
    const paymentInfo = await payOS.paymentRequests.get(orderCode);
    return {
      success: true,
      data: paymentInfo
    };
  } catch (error) {
    console.error('PayOS get payment info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel payment link
 */
async function cancelPaymentLink(orderCode, cancellationReason) {
  if (!payOS) {
    throw new Error('PayOS is not configured');
  }

  try {
    const result = await payOS.paymentRequests.cancel(orderCode, cancellationReason);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('PayOS cancel payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify webhook signature
 */
async function verifyWebhookSignature(webhookData) {
  if (!payOS) {
    throw new Error('PayOS is not configured');
  }

  try {
    return await payOS.webhooks.verify(webhookData);
  } catch (error) {
    console.error('PayOS verify webhook error:', error);
    return null;
  }
}

module.exports = {
  payOS,
  createPaymentLink,
  getPaymentInfo,
  cancelPaymentLink,
  verifyWebhookSignature
};
