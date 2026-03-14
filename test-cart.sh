#!/bin/bash

echo "🔐 Logging in as customer..."

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}' | \
  jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:50}..."

# Get first product
echo "📦 Getting products..."
PRODUCT_ID=$(curl -s http://localhost:3001/api/products | jq -r '.data[0].id')
PRODUCT_NAME=$(curl -s http://localhost:3001/api/products | jq -r '.data[0].name')

echo "Adding product: $PRODUCT_NAME"

# Add to cart
echo "➕ Adding to cart..."
ADD_RESULT=$(curl -s -X POST http://localhost:3001/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"product_id\":\"$PRODUCT_ID\",\"quantity\":2}")

echo "Add result: $ADD_RESULT"

# Check cart
echo "🛒 Checking cart..."
CART_DATA=$(curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN")

echo "Cart data: $CART_DATA"

echo ""
echo "🎉 Test completed!"
echo "Now refresh your browser cart page (http://localhost:3000/cart)"
echo "Make sure you're logged in as customer@example.com"