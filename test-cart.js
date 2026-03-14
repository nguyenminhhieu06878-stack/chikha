// Test script to add products to cart and verify frontend sync
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testCart() {
  try {
    console.log('🔐 Logging in as customer...');
    
    // Login as customer
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'customer@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Get products
    console.log('📦 Getting products...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    const products = productsResponse.data.data.slice(0, 3); // Get first 3 products
    
    console.log(`Found ${products.length} products to add`);
    
    // Add products to cart
    for (const product of products) {
      console.log(`➕ Adding ${product.name} to cart...`);
      
      const addResponse = await axios.post(`${API_BASE}/cart`, {
        product_id: product.id,
        quantity: 1
      }, { headers });
      
      if (addResponse.data.success) {
        console.log(`✅ Added ${product.name}`);
      } else {
        console.log(`❌ Failed to add ${product.name}`);
      }
    }
    
    // Check cart
    console.log('🛒 Checking cart contents...');
    const cartResponse = await axios.get(`${API_BASE}/cart`, { headers });
    
    console.log('Cart Summary:');
    console.log(`- Items: ${cartResponse.data.data.summary.total_items}`);
    console.log(`- Total: ${cartResponse.data.data.summary.total} VND`);
    
    console.log('\nCart Items:');
    cartResponse.data.data.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.products.name} - Qty: ${item.quantity} - Price: ${item.products.price} VND`);
    });
    
    console.log('\n🎉 Cart test completed!');
    console.log('Now refresh the frontend cart page to see the items.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCart();