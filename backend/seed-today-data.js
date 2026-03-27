const { db } = require('./config/database');

console.log('🌱 Creating data for TODAY (last 24 hours)...\n');

try {
  const products = db.prepare('SELECT id, price FROM products LIMIT 20').all();
  let user = db.prepare('SELECT id FROM users LIMIT 1').get();
  
  if (!user) {
    const insertUser = db.prepare(`INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)`);
    const result = insertUser.run('demo@example.com', 'hashed', 'Demo User', 'customer');
    user = { id: result.lastInsertRowid };
  }

  const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
  const statuses = ['pending', 'processing', 'delivered'];
  
  // Create 10 orders TODAY
  console.log('📦 Creating orders for today...');
  for (let i = 0; i < 10; i++) {
    const hoursAgo = Math.floor(Math.random() * 24);
    const orderDate = new Date();
    orderDate.setHours(orderDate.getHours() - hoursAgo);
    const createdAt = orderDate.toISOString().slice(0, 19).replace('T', ' ');

    const numItems = Math.floor(Math.random() * 2) + 1;
    const selectedProducts = [];
    let totalAmount = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      selectedProducts.push({ ...product, quantity });
      totalAmount += product.price * quantity;
    }

    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, total_amount, shipping_address, shipping_city, shipping_phone, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      totalAmount,
      `${Math.floor(Math.random() * 999) + 1} Đường ABC`,
      cities[Math.floor(Math.random() * cities.length)],
      `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      statuses[Math.floor(Math.random() * statuses.length)],
      createdAt
    );

    const orderId = orderResult.lastInsertRowid;
    selectedProducts.forEach(product => {
      db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').run(
        orderId, product.id, product.quantity, product.price
      );
    });

    console.log(`  ✅ Order ${orderId}: ${numItems} items (${hoursAgo}h ago)`);
  }

  // Create views TODAY
  console.log('\n👁️  Creating product views for today...');
  let totalViews = 0;
  products.forEach(product => {
    const viewCount = Math.floor(Math.random() * 50) + 20; // 20-70 views
    
    for (let i = 0; i < viewCount; i++) {
      const hoursAgo = Math.floor(Math.random() * 24);
      const viewDate = new Date();
      viewDate.setHours(viewDate.getHours() - hoursAgo);
      const viewedAt = viewDate.toISOString().slice(0, 19).replace('T', ' ');
      
      db.prepare('INSERT INTO product_views (product_id, viewed_at) VALUES (?, ?)').run(
        product.id, viewedAt
      );
    }
    
    totalViews += viewCount;
  });

  console.log(`  ✅ Created ${totalViews} views\n`);
  console.log('✅ TODAY data created successfully!');
  console.log('🔥 Trending now shows products from last 24 hours only!');

} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
