const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'ecommerce.db');
const db = new Database(dbPath);

// Grocery store categories
const categories = [
  { name: 'Thực phẩm tươi sống', slug: 'thuc-pham-tuoi-song', description: 'Thịt, cá, rau củ quả tươi' },
  { name: 'Đồ uống', slug: 'do-uong', description: 'Nước ngọt, bia, rượu, nước suối' },
  { name: 'Bánh kẹo', slug: 'banh-keo', description: 'Bánh quy, kẹo, chocolate' },
  { name: 'Gia vị & Đồ khô', slug: 'gia-vi-do-kho', description: 'Gia vị, mì gói, đồ khô' },
  { name: 'Sữa & Trứng', slug: 'sua-trung', description: 'Sữa tươi, sữa chua, trứng' },
  { name: 'Đồ gia dụng', slug: 'do-gia-dung', description: 'Đồ dùng nhà bếp, vệ sinh' },
  { name: 'Chăm sóc cá nhân', slug: 'cham-soc-ca-nhan', description: 'Mỹ phẩm, dầu gội, kem đánh răng' },
  { name: 'Đồ ăn nhanh', slug: 'do-an-nhanh', description: 'Thức ăn đóng hộp, đồ ăn liền' }
];

// Grocery products with Vietnamese names and realistic prices
const products = [
  // Thực phẩm tươi sống
  {
    name: 'Thịt ba chỉ heo',
    description: 'Thịt ba chỉ heo tươi ngon, thích hợp nướng BBQ hoặc kho',
    price: 120000,
    discount_price: null,
    category_slug: 'thuc-pham-tuoi-song',
    stock_quantity: 50,
    sku: 'MEAT001',
    weight: 0.5,
    image_url: 'https://images.unsplash.com/photo-1588347818111-c3b2c3c5b9b5?w=500',
    is_featured: true
  },
  {
    name: 'Cá hồi Na Uy',
    description: 'Cá hồi Na Uy tươi ngon, giàu omega-3, thích hợp làm sashimi',
    price: 350000,
    discount_price: 320000,
    category_slug: 'thuc-pham-tuoi-song',
    stock_quantity: 25,
    sku: 'FISH001',
    weight: 0.3,
    image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
    is_featured: true
  },
  {
    name: 'Rau cải ngọt',
    description: 'Rau cải ngọt tươi xanh, trồng theo tiêu chuẩn VietGAP',
    price: 15000,
    discount_price: null,
    category_slug: 'thuc-pham-tuoi-song',
    stock_quantity: 100,
    sku: 'VEG001',
    weight: 0.3,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'
  },
  {
    name: 'Cà chua bi',
    description: 'Cà chua bi ngọt, tươi ngon, giàu vitamin C',
    price: 25000,
    discount_price: null,
    category_slug: 'thuc-pham-tuoi-song',
    stock_quantity: 80,
    sku: 'VEG002',
    weight: 0.5,
    image_url: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500'
  },

  // Đồ uống
  {
    name: 'Coca Cola 330ml',
    description: 'Nước ngọt Coca Cola lon 330ml, vị nguyên bản',
    price: 12000,
    discount_price: 10000,
    category_slug: 'do-uong',
    stock_quantity: 200,
    sku: 'DRINK001',
    weight: 0.33,
    image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
    is_featured: true
  },
  {
    name: 'Bia Saigon Special',
    description: 'Bia Saigon Special lon 330ml, độ cồn 4.9%',
    price: 18000,
    discount_price: null,
    category_slug: 'do-uong',
    stock_quantity: 150,
    sku: 'DRINK002',
    weight: 0.33,
    image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500'
  },
  {
    name: 'Nước suối Lavie 500ml',
    description: 'Nước suối tinh khiết Lavie chai 500ml',
    price: 5000,
    discount_price: null,
    category_slug: 'do-uong',
    stock_quantity: 300,
    sku: 'DRINK003',
    weight: 0.5,
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500'
  },
  {
    name: 'Trà xanh C2 455ml',
    description: 'Trà xanh C2 hương chanh chai 455ml, không đường',
    price: 8000,
    discount_price: null,
    category_slug: 'do-uong',
    stock_quantity: 120,
    sku: 'DRINK004',
    weight: 0.455,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'
  },

  // Bánh kẹo
  {
    name: 'Bánh quy Oreo',
    description: 'Bánh quy Oreo vị socola kem vani gói 137g',
    price: 25000,
    discount_price: 22000,
    category_slug: 'banh-keo',
    stock_quantity: 80,
    sku: 'SNACK001',
    weight: 0.137,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
    is_featured: true
  },
  {
    name: 'Kẹo dẻo Haribo',
    description: 'Kẹo dẻo Haribo vị trái cây gói 100g',
    price: 35000,
    discount_price: null,
    category_slug: 'banh-keo',
    stock_quantity: 60,
    sku: 'SNACK002',
    weight: 0.1,
    image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500'
  },
  {
    name: 'Chocolate Kitkat',
    description: 'Chocolate Kitkat thanh 41.5g, vị socola sữa',
    price: 15000,
    discount_price: null,
    category_slug: 'banh-keo',
    stock_quantity: 100,
    sku: 'SNACK003',
    weight: 0.0415,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500'
  },

  // Gia vị & Đồ khô
  {
    name: 'Mì tôm Hảo Hảo',
    description: 'Mì tôm chua cay Hảo Hảo gói 75g',
    price: 4000,
    discount_price: null,
    category_slug: 'gia-vi-do-kho',
    stock_quantity: 500,
    sku: 'INSTANT001',
    weight: 0.075,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
    is_featured: true
  },
  {
    name: 'Nước mắm Nam Ngư',
    description: 'Nước mắm Nam Ngư 40 độ đạm chai 500ml',
    price: 45000,
    discount_price: null,
    category_slug: 'gia-vi-do-kho',
    stock_quantity: 70,
    sku: 'SAUCE001',
    weight: 0.5,
    image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500'
  },
  {
    name: 'Gạo ST25',
    description: 'Gạo ST25 thơm ngon túi 5kg',
    price: 180000,
    discount_price: 165000,
    category_slug: 'gia-vi-do-kho',
    stock_quantity: 40,
    sku: 'RICE001',
    weight: 5,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'
  },

  // Sữa & Trứng
  {
    name: 'Sữa tươi TH True Milk',
    description: 'Sữa tươi tiệt trùng TH True Milk hộp 1L',
    price: 32000,
    discount_price: null,
    category_slug: 'sua-trung',
    stock_quantity: 90,
    sku: 'MILK001',
    weight: 1,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
    is_featured: true
  },
  {
    name: 'Trứng gà ta',
    description: 'Trứng gà ta tươi vỉ 10 quả',
    price: 35000,
    discount_price: null,
    category_slug: 'sua-trung',
    stock_quantity: 60,
    sku: 'EGG001',
    weight: 0.6,
    image_url: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=500'
  },
  {
    name: 'Sữa chua Vinamilk',
    description: 'Sữa chua Vinamilk có đường lốc 4 hộp x 100g',
    price: 18000,
    discount_price: null,
    category_slug: 'sua-trung',
    stock_quantity: 80,
    sku: 'YOGURT001',
    weight: 0.4,
    image_url: 'https://images.unsplash.com/photo-1571212515416-fca88c6e8b5d?w=500'
  },

  // Đồ gia dụng
  {
    name: 'Nước rửa chén Sunlight',
    description: 'Nước rửa chén Sunlight chanh chai 750ml',
    price: 28000,
    discount_price: 25000,
    category_slug: 'do-gia-dung',
    stock_quantity: 50,
    sku: 'CLEAN001',
    weight: 0.75,
    image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500'
  },
  {
    name: 'Giấy vệ sinh Paseo',
    description: 'Giấy vệ sinh Paseo 3 lớp lốc 12 cuộn',
    price: 65000,
    discount_price: null,
    category_slug: 'do-gia-dung',
    stock_quantity: 40,
    sku: 'TISSUE001',
    weight: 2,
    image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500'
  },

  // Chăm sóc cá nhân
  {
    name: 'Dầu gội Head & Shoulders',
    description: 'Dầu gội Head & Shoulders sạch gàu chai 400ml',
    price: 85000,
    discount_price: 75000,
    category_slug: 'cham-soc-ca-nhan',
    stock_quantity: 45,
    sku: 'SHAMPOO001',
    weight: 0.4,
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500'
  },
  {
    name: 'Kem đánh răng Colgate',
    description: 'Kem đánh răng Colgate bảo vệ tối đa tuýp 200g',
    price: 35000,
    discount_price: null,
    category_slug: 'cham-soc-ca-nhan',
    stock_quantity: 70,
    sku: 'TOOTHPASTE001',
    weight: 0.2,
    image_url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500'
  },

  // Đồ ăn nhanh
  {
    name: 'Xúc xích CP',
    description: 'Xúc xích CP heo gói 500g, đã nấu chín',
    price: 55000,
    discount_price: null,
    category_slug: 'do-an-nhanh',
    stock_quantity: 35,
    sku: 'SAUSAGE001',
    weight: 0.5,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500'
  },
  {
    name: 'Cơm hộp Bento',
    description: 'Cơm hộp Bento thịt nướng teriyaki 350g',
    price: 45000,
    discount_price: 40000,
    category_slug: 'do-an-nhanh',
    stock_quantity: 25,
    sku: 'BENTO001',
    weight: 0.35,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500'
  }
];

// Sample users
const users = [
  {
    full_name: 'Nguyễn Văn Admin',
    email: 'admin@grocery.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK', // password: admin123
    role: 'admin',
    phone: '0901234567',
    is_verified: true
  },
  {
    full_name: 'Trần Thị Lan',
    email: 'lan@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK', // password: user123
    role: 'customer',
    phone: '0987654321',
    is_verified: true
  },
  {
    full_name: 'Lê Minh Tuấn',
    email: 'tuan@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK', // password: user123
    role: 'customer',
    phone: '0912345678',
    is_verified: true
  }
];

// Sample reviews
const reviews = [
  {
    product_name: 'Thịt ba chỉ heo',
    user_email: 'lan@gmail.com',
    rating: 5,
    comment: 'Thịt tươi ngon, nướng lên rất thơm. Sẽ mua lại!'
  },
  {
    product_name: 'Cá hồi Na Uy',
    user_email: 'tuan@gmail.com',
    rating: 4,
    comment: 'Cá tươi, thịt chắc. Giá hơi cao nhưng chất lượng tốt.'
  },
  {
    product_name: 'Coca Cola 330ml',
    user_email: 'lan@gmail.com',
    rating: 5,
    comment: 'Nước ngọt ngon, giao hàng nhanh. Giá cả hợp lý.'
  },
  {
    product_name: 'Bánh quy Oreo',
    user_email: 'tuan@gmail.com',
    rating: 5,
    comment: 'Bánh giòn tan, kem ngọt vừa phải. Con em rất thích!'
  },
  {
    product_name: 'Mì tôm Hảo Hảo',
    user_email: 'lan@gmail.com',
    rating: 4,
    comment: 'Mì ngon, chua cay vừa miệng. Giá rẻ, tiện lợi.'
  }
];

async function seedGroceryData() {
  try {
    console.log('🌱 Starting grocery data seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('DELETE FROM reviews');
    db.exec('DELETE FROM products');
    db.exec('DELETE FROM categories');
    db.exec("DELETE FROM users WHERE email NOT IN ('admin@example.com')");
    db.exec('PRAGMA foreign_keys = ON');

    // Insert categories
    console.log('📂 Inserting categories...');
    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, description, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    for (const category of categories) {
      insertCategory.run(category.name, category.slug, category.description);
    }

    // Get category IDs
    const categoryMap = {};
    const getCategories = db.prepare('SELECT id, slug FROM categories');
    const dbCategories = getCategories.all();
    for (const cat of dbCategories) {
      categoryMap[cat.slug] = cat.id;
    }

    // Insert products
    console.log('🛍️ Inserting products...');
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, slug, description, price, category_id, 
        stock_quantity, image_url, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    for (const product of products) {
      const categoryId = categoryMap[product.category_slug];
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      insertProduct.run(
        product.name,
        slug,
        product.description,
        product.price,
        categoryId,
        product.stock_quantity,
        product.image_url,
        product.is_featured ? 1 : 0
      );
    }

    // Insert users
    console.log('👥 Inserting users...');
    const insertUser = db.prepare(`
      INSERT INTO users (
        id, full_name, email, password, role, phone,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    for (const user of users) {
      try {
        const userId = Math.random().toString(36).substr(2, 9);
        insertUser.run(
          userId,
          user.full_name,
          user.email,
          user.password,
          user.role,
          user.phone
        );
      } catch (error) {
        if (!error.message.includes('UNIQUE constraint failed')) {
          throw error;
        }
      }
    }

    // Get user and product IDs for reviews
    const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');
    const getProductId = db.prepare('SELECT id FROM products WHERE name = ?');

    // Insert reviews
    console.log('⭐ Inserting reviews...');
    const insertReview = db.prepare(`
      INSERT INTO reviews (
        product_id, user_id, rating, comment, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);

    for (const review of reviews) {
      const user = getUserId.get(review.user_email);
      const product = getProductId.get(review.product_name);
      
      if (user && product) {
        insertReview.run(
          product.id,
          user.id,
          review.rating,
          review.comment
        );
      }
    }

    // Update product ratings
    console.log('📊 Updating product ratings...');
    db.exec(`
      UPDATE products 
      SET specifications = json_object(
        'average_rating', (
          SELECT ROUND(AVG(CAST(rating AS REAL)), 1)
          FROM reviews 
          WHERE reviews.product_id = products.id
        ),
        'review_count', (
          SELECT COUNT(*)
          FROM reviews 
          WHERE reviews.product_id = products.id
        )
      )
      WHERE id IN (SELECT DISTINCT product_id FROM reviews)
    `);

    console.log('✅ Grocery data seeding completed successfully!');
    console.log(`📊 Seeded: ${categories.length} categories, ${products.length} products, ${users.length} users, ${reviews.length} reviews`);

  } catch (error) {
    console.error('❌ Error seeding grocery data:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedGroceryData();
}

module.exports = { seedGroceryData };