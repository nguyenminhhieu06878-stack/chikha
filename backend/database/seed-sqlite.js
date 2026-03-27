const { db, initDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  console.log('🌱 Seeding database...\n');

  try {
    // Initialize schema
    initDatabase();

    // Temporarily disable foreign key constraints
    db.pragma('foreign_keys = OFF');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    db.exec('DELETE FROM search_analytics');
    db.exec('DELETE FROM order_items');
    db.exec('DELETE FROM orders');
    db.exec('DELETE FROM reviews');
    db.exec('DELETE FROM cart_items');
    db.exec('DELETE FROM wishlist');
    db.exec('DELETE FROM addresses');
    db.exec('DELETE FROM user_activity');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec('DELETE FROM users');
    console.log('✅ Data cleared');

    // Create demo users
    console.log('👥 Creating users...');
    const adminId = uuidv4();
    const customerId = uuidv4();
    const testId = uuidv4();

    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const hashedCustomerPass = await bcrypt.hash('password123', 10);
    const hashedTestPass = await bcrypt.hash('test123', 10);

    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password, full_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(adminId, 'admin@example.com', hashedAdminPass, 'Admin User', '+84123456789', 'admin');
    insertUser.run(customerId, 'customer@example.com', hashedCustomerPass, 'Demo Customer', '+84987654321', 'customer');
    insertUser.run(testId, 'test@example.com', hashedTestPass, 'Test User', '+84111222333', 'customer');

    console.log('✅ Users created');

    // Create categories
    console.log('\n📁 Creating categories...');
    const categories = [
      { name: 'Điện thoại', slug: 'dien-thoai', description: 'Smartphone và phụ kiện', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9' },
      { name: 'Laptop', slug: 'laptop', description: 'Laptop và máy tính xách tay', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853' },
      { name: 'Tablet', slug: 'tablet', description: 'Máy tính bảng', image_url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764' },
      { name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện công nghệ', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f' }
    ];

    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `);

    categories.forEach(cat => {
      insertCategory.run(cat.name, cat.slug, cat.description, cat.image_url);
    });

    console.log('✅ Categories created');

    // Create products
    console.log('\n📦 Creating products...');
    const products = [
      { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', description: 'Flagship mới nhất từ Apple', price: 29990000, category_id: 1, stock: 50, featured: 1, image: 'https://images.unsplash.com/photo-1696446702183-cbd50c2e5e34' },
      { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-s24-ultra', description: 'Flagship Android cao cấp', price: 27990000, category_id: 1, stock: 45, featured: 1, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c' },
      { name: 'MacBook Pro M3', slug: 'macbook-pro-m3', description: 'Laptop chuyên nghiệp', price: 45990000, category_id: 2, stock: 30, featured: 1, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' },
      { name: 'Dell XPS 15', slug: 'dell-xps-15', description: 'Laptop cao cấp cho doanh nhân', price: 35990000, category_id: 2, stock: 25, featured: 0, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45' },
      { name: 'iPad Pro 12.9', slug: 'ipad-pro-129', description: 'Tablet chuyên nghiệp', price: 25990000, category_id: 3, stock: 40, featured: 1, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0' },
      { name: 'Samsung Galaxy Tab S9', slug: 'samsung-tab-s9', description: 'Tablet Android cao cấp', price: 18990000, category_id: 3, stock: 35, featured: 0, image: 'https://images.unsplash.com/photo-1585790050230-5dd28404f1b4' },
      { name: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'Tai nghe không dây cao cấp', price: 5990000, category_id: 4, stock: 100, featured: 1, image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7' },
      { name: 'Apple Watch Series 9', slug: 'apple-watch-9', description: 'Đồng hồ thông minh', price: 9990000, category_id: 4, stock: 60, featured: 0, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d' }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (name, slug, description, price, category_id, stock_quantity, is_featured, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach(p => {
      insertProduct.run(p.name, p.slug, p.description, p.price, p.category_id, p.stock, p.featured, p.image);
    });

    console.log('✅ Products created');

    // Create sample reviews
    console.log('\n⭐ Creating reviews...');
    const reviews = [
      { product_id: 1, user_id: customerId, rating: 5, comment: 'Sản phẩm tuyệt vời, rất hài lòng!' },
      { product_id: 1, user_id: testId, rating: 4, comment: 'Chất lượng tốt, giá hơi cao' },
      { product_id: 2, user_id: customerId, rating: 5, comment: 'Camera đẹp, pin trâu' },
      { product_id: 3, user_id: testId, rating: 5, comment: 'Hiệu năng mạnh mẽ' }
    ];

    const insertReview = db.prepare(`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `);

    reviews.forEach(r => {
      insertReview.run(r.product_id, r.user_id, r.rating, r.comment);
    });

    console.log('✅ Reviews created');

    // Create sample orders
    console.log('\n🛒 Creating sample orders...');
    
    // Create some orders with different statuses and dates
    const orders = [
      {
        user_id: customerId,
        total_amount: 29990000,
        status: 'delivered',
        payment_method: 'cod',
        shipping_address: '123 Nguyễn Văn Linh',
        shipping_city: 'TP.HCM',
        shipping_phone: '+84987654321',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        user_id: testId,
        total_amount: 45990000,
        status: 'delivered',
        payment_method: 'bank_transfer',
        shipping_address: '456 Lê Văn Việt',
        shipping_city: 'TP.HCM',
        shipping_phone: '+84111222333',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        user_id: customerId,
        total_amount: 65980000,
        status: 'shipped',
        payment_method: 'cod',
        shipping_address: '789 Võ Văn Ngân',
        shipping_city: 'TP.HCM',
        shipping_phone: '+84987654321',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        user_id: testId,
        total_amount: 18990000,
        status: 'processing',
        payment_method: 'bank_transfer',
        shipping_address: '321 Điện Biên Phủ',
        shipping_city: 'TP.HCM',
        shipping_phone: '+84111222333',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        user_id: customerId,
        total_amount: 15980000,
        status: 'pending',
        payment_method: 'cod',
        shipping_address: '654 Cách Mạng Tháng 8',
        shipping_city: 'TP.HCM',
        shipping_phone: '+84987654321',
        created_at: new Date().toISOString() // today
      }
    ];

    const insertOrder = db.prepare(`
      INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address, shipping_city, shipping_phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const orderIds = [];
    orders.forEach(order => {
      const result = insertOrder.run(
        order.user_id, order.total_amount, order.status, order.payment_method,
        order.shipping_address, order.shipping_city, order.shipping_phone, order.created_at
      );
      orderIds.push(result.lastInsertRowid);
    });

    // Create order items
    const orderItems = [
      // Order 1: iPhone 15 Pro Max
      { order_id: orderIds[0], product_id: 1, quantity: 1, price: 29990000 },
      
      // Order 2: MacBook Pro M3
      { order_id: orderIds[1], product_id: 3, quantity: 1, price: 45990000 },
      
      // Order 3: iPhone + Samsung Tab
      { order_id: orderIds[2], product_id: 1, quantity: 1, price: 29990000 },
      { order_id: orderIds[2], product_id: 6, quantity: 2, price: 18990000 },
      
      // Order 4: Samsung Galaxy Tab S9
      { order_id: orderIds[3], product_id: 6, quantity: 1, price: 18990000 },
      
      // Order 5: AirPods + Apple Watch
      { order_id: orderIds[4], product_id: 7, quantity: 1, price: 5990000 },
      { order_id: orderIds[4], product_id: 8, quantity: 1, price: 9990000 }
    ];

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    orderItems.forEach(item => {
      insertOrderItem.run(item.order_id, item.product_id, item.quantity, item.price);
    });

    console.log('✅ Sample orders created');

    // Create some search analytics data
    console.log('\n🔍 Creating search analytics...');
    const searches = [
      { query: 'iphone', results_count: 2, user_id: customerId },
      { query: 'macbook', results_count: 1, user_id: testId },
      { query: 'samsung', results_count: 2, user_id: customerId },
      { query: 'laptop', results_count: 2, user_id: null },
      { query: 'tablet', results_count: 2, user_id: testId },
      { query: 'airpods', results_count: 1, user_id: customerId }
    ];

    const insertSearch = db.prepare(`
      INSERT INTO search_analytics (query, results_count, user_id)
      VALUES (?, ?, ?)
    `);

    searches.forEach(search => {
      insertSearch.run(search.query, search.results_count, search.user_id);
    });

    console.log('✅ Search analytics created');

    // Re-enable foreign key constraints
    db.pragma('foreign_keys = ON');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo accounts:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN: admin@example.com / admin123                     │');
    console.log('│ CUSTOMER: customer@example.com / password123            │');
    console.log('│ TEST: test@example.com / test123                        │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
