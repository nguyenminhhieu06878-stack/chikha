const { db } = require('./config/database');

console.log('🌱 Seeding trending data...');

try {
  // Get all products
  const products = db.prepare('SELECT id, price FROM products LIMIT 20').all();
  
  // Get first user (or create a demo user)
  let user = db.prepare('SELECT id FROM users LIMIT 1').get();
  
  if (!user) {
    console.log('Creating demo user...');
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, full_name, role)
      VALUES (?, ?, ?, ?)
    `);
    const result = insertUser.run('demo@example.com', 'hashed_password', 'Demo User', 'customer');
    user = { id: result.lastInsertRowid };
  }

  console.log(`Using user ID: ${user.id}`);
  console.log(`Found ${products.length} products`);

  // Create orders for trending products
  const insertOrder = db.prepare(`
    INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_phone, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `);

  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
  
  // Create 30 orders in the last 30 days
  for (let i = 0; i < 30; i++) {
    // Random date in last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    const createdAt = orderDate.toISOString().slice(0, 19).replace('T', ' ');

    // Select 1-3 random products for this order
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      selectedProducts.push({ ...product, quantity });
      totalAmount += product.price * quantity;
    }

    // Create order
    const orderResult = insertOrder.run(
      user.id,
      totalAmount,
      `${Math.floor(Math.random() * 999) + 1} Đường ABC, Quận ${Math.floor(Math.random() * 12) + 1}`,
      cities[Math.floor(Math.random() * cities.length)],
      `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      statuses[Math.floor(Math.random() * statuses.length)],
      createdAt
    );

    const orderId = orderResult.lastInsertRowid;

    // Create order items
    selectedProducts.forEach(product => {
      insertOrderItem.run(orderId, product.id, product.quantity, product.price);
    });

    console.log(`✅ Created order ${orderId} with ${numItems} items (${daysAgo} days ago)`);
  }

  console.log('✅ Trending data seeded successfully!');
  console.log('📊 Created 30 orders with random products');
  console.log('🔥 Trending products should now appear on homepage');

} catch (error) {
  console.error('❌ Error seeding trending data:', error);
  process.exit(1);
}
