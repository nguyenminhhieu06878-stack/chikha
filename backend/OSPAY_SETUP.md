# OSPay (OneSPay) Payment Gateway Setup

## Overview
OSPay (OneSPay) is a Vietnamese payment gateway that supports credit/debit cards, e-wallets, and bank transfers.

## Configuration Steps

### 1. Register for OSPay Account
1. Visit [OneSPay website](https://onepay.vn/)
2. Register for a merchant account
3. Complete KYC verification
4. Get your credentials:
   - Merchant ID
   - Access Code
   - Secret Key

### 2. Configure Environment Variables

Add these to your `backend/.env` file:

```env
# OSPay (OneSPay) Configuration
OSPAY_MERCHANT_ID=your_merchant_id
OSPAY_ACCESS_CODE=your_access_code
OSPAY_SECRET_KEY=your_secret_key
OSPAY_PAYMENT_URL=https://mtf.onepay.vn/onecomm-pay/vpc.op
OSPAY_RETURN_URL=http://localhost:3001/api/payment/ospay/callback
```

### 3. Testing Environment

For testing, use OneSPay's sandbox environment:
- Payment URL: `https://mtf.onepay.vn/onecomm-pay/vpc.op` (test environment)
- Production URL: `https://onepay.vn/onecomm-pay/vpc.op`

### 4. Test Cards

OneSPay provides test cards for sandbox testing:
- Card Number: `9704000000000018`
- Card Holder: `NGUYEN VAN A`
- Expiry Date: Any future date
- CVV: `123`

## Payment Flow

1. **Customer initiates payment**
   - Selects OSPay as payment method
   - Submits checkout form
   - Order is created in database

2. **Redirect to OSPay**
   - Backend generates secure payment URL
   - Customer is redirected to OSPay gateway
   - Customer enters payment details

3. **Payment processing**
   - OSPay processes the payment
   - Customer completes authentication (OTP, 3D Secure, etc.)

4. **Callback handling**
   - OSPay redirects back to your callback URL
   - Backend verifies the signature
   - Order status is updated
   - Customer is redirected to success/failed page

## API Endpoints

### Create Payment
```
POST /api/payment/ospay/create
Authorization: Bearer <token>

Body:
{
  "orderId": "order-uuid",
  "amount": 100000,
  "orderInfo": "Payment for order #123",
  "customerName": "Nguyen Van A",
  "customerPhone": "0123456789"
}

Response:
{
  "success": true,
  "data": {
    "paymentUrl": "https://mtf.onepay.vn/onecomm-pay/vpc.op?...",
    "orderId": "order-uuid"
  }
}
```

### Payment Callback
```
GET /api/payment/ospay/callback?vpc_SecureHash=...&vpc_TxnResponseCode=...
```

This endpoint is called by OSPay after payment processing.

### Get Transaction Details
```
GET /api/payment/transaction/:orderId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid",
      "total_amount": 100000,
      "payment_status": "paid",
      "payment_method": "ospay"
    },
    "transaction": {
      "id": 1,
      "order_id": "order-uuid",
      "transaction_ref": "order-uuid_1234567890",
      "amount": 100000,
      "status": "success",
      "response_code": "0",
      "response_message": "Transaction successful",
      "transaction_no": "123456",
      "created_at": "2024-03-29 10:00:00"
    }
  }
}
```

## Security

- All payment requests include a secure hash (HMAC-SHA256)
- Callback responses are verified using the same hash
- Secret key is never exposed to the client
- All sensitive data is encrypted in transit (HTTPS)

## Troubleshooting

### Payment URL not working
- Check if credentials are correct
- Verify callback URL is accessible from internet (use ngrok for local testing)
- Check if amount is in correct format (VND, no decimals)

### Callback not received
- Ensure callback URL is publicly accessible
- Check firewall settings
- Verify callback URL in OSPay merchant dashboard

### Invalid signature error
- Check if secret key is correct
- Verify parameter sorting is alphabetical
- Ensure no extra spaces in parameters

## Production Checklist

- [ ] Update `OSPAY_PAYMENT_URL` to production URL
- [ ] Update `OSPAY_RETURN_URL` to production domain
- [ ] Configure webhook URL in OSPay dashboard
- [ ] Test with real cards in production
- [ ] Set up monitoring for failed transactions
- [ ] Configure email notifications for payment status

## Support

- OSPay Documentation: https://docs.onepay.vn/
- Technical Support: support@onepay.vn
- Hotline: 1900 633 927
