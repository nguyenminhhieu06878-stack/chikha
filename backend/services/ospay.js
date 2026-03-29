const crypto = require('crypto');

/**
 * OSPay (OneSPay) Payment Gateway Service
 * Documentation: https://docs.onepay.vn/
 */

class OSPayService {
  constructor() {
    this.merchantId = process.env.OSPAY_MERCHANT_ID;
    this.accessCode = process.env.OSPAY_ACCESS_CODE;
    this.secretKey = process.env.OSPAY_SECRET_KEY;
    this.paymentUrl = process.env.OSPAY_PAYMENT_URL || 'https://mtf.onepay.vn/onecomm-pay/vpc.op';
    this.returnUrl = process.env.OSPAY_RETURN_URL || 'http://localhost:3000/payment/callback';
    this.version = '2';
    this.command = 'pay';
    this.currency = 'VND';
    this.locale = 'vn';
  }

  /**
   * Generate secure hash for OSPay request
   */
  generateSecureHash(params) {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Create HMAC SHA256 hash
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(sortedParams);
    return hmac.digest('hex').toUpperCase();
  }

  /**
   * Create payment URL for OSPay
   * @param {Object} orderData - Order information
   * @returns {string} Payment URL
   */
  createPaymentUrl(orderData) {
    const {
      orderId,
      amount,
      orderInfo,
      customerName,
      customerEmail,
      customerPhone
    } = orderData;

    // Convert amount to smallest currency unit (VND doesn't have decimals)
    const amountInSmallestUnit = Math.round(amount);

    // Create transaction reference (unique for each transaction)
    const txnRef = `${orderId}_${Date.now()}`;

    // Prepare payment parameters
    const params = {
      vpc_Version: this.version,
      vpc_Command: this.command,
      vpc_AccessCode: this.accessCode,
      vpc_MerchTxnRef: txnRef,
      vpc_Merchant: this.merchantId,
      vpc_OrderInfo: orderInfo || `Payment for order ${orderId}`,
      vpc_Amount: amountInSmallestUnit,
      vpc_ReturnURL: this.returnUrl,
      vpc_Locale: this.locale,
      vpc_Currency: this.currency,
      vpc_TickNo: customerPhone || '',
      AgainLink: process.env.FRONTEND_URL || 'http://localhost:3000',
      Title: 'E-commerce Payment'
    };

    // Add customer info if available
    if (customerName) params.vpc_Customer_Name = customerName;
    if (customerEmail) params.vpc_Customer_Email = customerEmail;
    if (customerPhone) params.vpc_Customer_Phone = customerPhone;

    // Generate secure hash
    const secureHash = this.generateSecureHash(params);
    params.vpc_SecureHash = secureHash;

    // Build payment URL
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return `${this.paymentUrl}?${queryString}`;
  }

  /**
   * Verify callback from OSPay
   * @param {Object} callbackParams - Parameters from OSPay callback
   * @returns {Object} Verification result
   */
  verifyCallback(callbackParams) {
    const secureHash = callbackParams.vpc_SecureHash;
    
    // Remove secure hash from params for verification
    const paramsToVerify = { ...callbackParams };
    delete paramsToVerify.vpc_SecureHash;

    // Generate hash from callback params
    const calculatedHash = this.generateSecureHash(paramsToVerify);

    // Verify hash
    const isValid = secureHash === calculatedHash;

    // Parse transaction response code
    const txnResponseCode = callbackParams.vpc_TxnResponseCode;
    const isSuccess = txnResponseCode === '0';

    return {
      isValid,
      isSuccess,
      txnResponseCode,
      message: this.getResponseMessage(txnResponseCode),
      orderId: this.extractOrderId(callbackParams.vpc_MerchTxnRef),
      txnRef: callbackParams.vpc_MerchTxnRef,
      amount: callbackParams.vpc_Amount,
      transactionNo: callbackParams.vpc_TransactionNo
    };
  }

  /**
   * Extract order ID from transaction reference
   */
  extractOrderId(txnRef) {
    if (!txnRef) return null;
    return txnRef.split('_')[0];
  }

  /**
   * Get response message based on response code
   */
  getResponseMessage(code) {
    const messages = {
      '0': 'Transaction successful',
      '1': 'Bank declined transaction',
      '3': 'Merchant code does not exist',
      '4': 'Invalid access code',
      '5': 'Invalid amount',
      '6': 'Invalid currency code',
      '7': 'Transaction not found',
      '8': 'Transaction already exists',
      '9': 'Card/Account has been locked',
      '10': 'Card/Account has expired',
      '11': 'Insufficient funds',
      '12': 'Card/Account information is incorrect',
      '13': 'Transaction amount exceeds limit',
      '21': 'Insufficient funds in account',
      '99': 'User cancelled transaction',
      'B': 'Validation error',
      'E': 'Transaction declined',
      'F': 'Transaction failed',
      'Z': 'Transaction processing'
    };

    return messages[code] || 'Unknown error occurred';
  }

  /**
   * Query transaction status from OSPay
   * @param {string} txnRef - Transaction reference
   * @returns {Promise<Object>} Transaction status
   */
  async queryTransaction(txnRef) {
    // This would require implementing OSPay's query API
    // For now, return a placeholder
    return {
      success: false,
      message: 'Query API not implemented yet'
    };
  }
}

module.exports = new OSPayService();
