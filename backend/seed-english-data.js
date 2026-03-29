const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'ecommerce.db');
const db = new Database(dbPath);

// English categories for supermarket
const categories = [
  // Food & Beverages
  { name: 'Fresh Meat', slug: 'fresh-meat', description: 'Fresh pork, beef, chicken, duck' },
  { name: 'Fresh Seafood', slug: 'fresh-seafood', description: 'Fresh fish, shrimp, crab, squid' },
  { name: 'Vegetables', slug: 'vegetables', description: 'Fresh green vegetables and root vegetables' },
  { name: 'Fresh Fruits', slug: 'fresh-fruits', description: 'Local and imported fresh fruits' },
  { name: 'Dairy Products', slug: 'dairy-products', description: 'Fresh milk, yogurt, cheese' },
  { name: 'Eggs & Poultry', slug: 'eggs-poultry', description: 'Chicken, duck, quail eggs' },
  { name: 'Bread & Pastries', slug: 'bread-pastries', description: 'Fresh bread, pastries, cakes' },
  { name: 'Rice & Grains', slug: 'rice-grains', description: 'Various rice types, oats, cereals' },
  { name: 'Noodles & Pasta', slug: 'noodles-pasta', description: 'Instant noodles, dried noodles, pasta' },
  { name: 'Cooking Oil & Seasonings', slug: 'oil-seasonings', description: 'Cooking oil, fish sauce, chili sauce' },
  
  // Beverages
  { name: 'Carbonated Drinks', slug: 'carbonated-drinks', description: 'Coca Cola, Pepsi, 7Up varieties' },
  { name: 'Fruit Juices', slug: 'fruit-juices', description: 'Orange, apple, grape juices' },
  { name: 'Tea & Coffee', slug: 'tea-coffee', description: 'Tea bags, instant coffee' },
  { name: 'Water & Filtered Water', slug: 'water-filtered', description: 'Spring water, filtered bottled water' },
  { name: 'Beer & Alcohol', slug: 'beer-alcohol', description: 'Various beers, wine, whisky' },
  { name: 'Soy Milk & Health Drinks', slug: 'soy-milk-health', description: 'Soy milk, bird nest drinks, collagen' },
  
  // Snacks & Confectionery
  { name: 'Cookies & Crackers', slug: 'cookies-crackers', description: 'Sweet and savory cookies' },
  { name: 'Candy & Chocolate', slug: 'candy-chocolate', description: 'Hard candy, gummy candy, chocolate' },
  { name: 'Snacks & Chips', slug: 'snacks-chips', description: 'Rice crackers, potato chips' },
  { name: 'Nuts & Dried Fruits', slug: 'nuts-dried-fruits', description: 'Cashews, raisins, dried apricots' },
  
  // Frozen & Canned Foods
  { name: 'Frozen Foods', slug: 'frozen-foods', description: 'Frozen meat, frozen vegetables' },
  { name: 'Canned Foods', slug: 'canned-foods', description: 'Canned fish, canned meat, canned vegetables' },
  { name: 'Ice Cream & Frozen Treats', slug: 'ice-cream-frozen', description: 'Ice cream bars, ice cream tubs, ice cubes' },
  
  // Health & Beauty
  { name: 'Facial Care', slug: 'facial-care', description: 'Face wash, moisturizers' },
  { name: 'Body Care', slug: 'body-care', description: 'Body wash, shampoo, soap' },
  { name: 'Oral Care', slug: 'oral-care', description: 'Toothpaste, toothbrushes' },
  { name: 'Makeup Tools', slug: 'makeup-tools', description: 'Lipstick, powder, mascara' },
  { name: 'Hair Care', slug: 'hair-care', description: 'Shampoo, conditioner, hair gel' },
  { name: 'Perfume & Deodorant', slug: 'perfume-deodorant', description: 'Perfume, body deodorant spray' },
  
  // Household & Cleaning
  { name: 'Cleaning Products', slug: 'cleaning-products', description: 'Dish soap, laundry detergent, floor cleaner' },
  { name: 'Toilet Paper & Tissues', slug: 'toilet-paper-tissues', description: 'Toilet paper, napkins' },
  { name: 'Kitchen Utensils', slug: 'kitchen-utensils', description: 'Pans, pots, knives, cutting boards' },
  { name: 'Household Items', slug: 'household-items', description: 'Basins, bowls, storage baskets' },
  { name: 'Light Bulbs & Electrical', slug: 'light-bulbs-electrical', description: 'LED bulbs, electrical outlets' },
  
  // Baby & Kids
  { name: 'Baby Formula', slug: 'baby-formula', description: 'Formula milk for all ages' },
  { name: 'Baby Supplies', slug: 'baby-supplies', description: 'Baby bottles, diapers, toys' },
  { name: 'Baby Food', slug: 'baby-food', description: 'Baby porridge, baby snacks' },
  
  // Pet Care
  { name: 'Pet Food', slug: 'pet-food', description: 'Food for dogs, cats, fish' },
  { name: 'Pet Supplies', slug: 'pet-supplies', description: 'Cages, toys, leashes' },
  
  // Health & Pharmacy
  { name: 'Over-the-Counter Medicine', slug: 'otc-medicine', description: 'Cold medicine, headache medicine' },
  { name: 'Health Supplements', slug: 'health-supplements', description: 'Vitamins, calcium, omega-3' },
  { name: 'Medical Supplies', slug: 'medical-supplies', description: 'Thermometers, bandages, medical alcohol' },
  
  // Electronics & Tech
  { name: 'Phones & Accessories', slug: 'phones-accessories', description: 'Phones, cases, chargers' },
  { name: 'Home Electronics', slug: 'home-electronics', description: 'Fans, irons, hair dryers' },
  
  // Sports & Outdoor
  { name: 'Sports Equipment', slug: 'sports-equipment', description: 'Soccer balls, badminton, yoga' },
  { name: 'Outdoor Gear', slug: 'outdoor-gear', description: 'Tents, sleeping bags, water bottles' },
  
  // Stationery & Books
  { name: 'Office Supplies', slug: 'office-supplies', description: 'Pens, paper, glue, rulers' },
  { name: 'Books & Magazines', slug: 'books-magazines', description: 'Textbooks, novels' },
  
  // Fashion & Accessories
  { name: 'Men\'s Clothing', slug: 'mens-clothing', description: 'Shirts, jeans, t-shirts' },
  { name: 'Women\'s Clothing', slug: 'womens-clothing', description: 'Dresses, blouses, pants' },
  { name: 'Shoes & Footwear', slug: 'shoes-footwear', description: 'Sneakers, sandals, slippers' }
];

// English product templates
const productTemplates = {
  'fresh-meat': [
    { name: 'Pork Belly', price: 120000, description: 'Fresh pork belly, perfect for BBQ grilling' },
    { name: 'Pork Shoulder', price: 140000, description: 'Fresh lean pork shoulder, low fat' },
    { name: 'Beef Tenderloin', price: 280000, description: 'Premium beef tenderloin, tender and delicious' },
    { name: 'Free-Range Chicken', price: 160000, description: 'Fresh free-range chicken, hormone-free' },
    { name: 'Duck Meat', price: 180000, description: 'Fresh duck meat, aromatic and tasty' },
    { name: 'Pork Ribs', price: 150000, description: 'Fresh pork ribs, perfect for grilling' },
    { name: 'Beef Stew Meat', price: 220000, description: 'Fresh beef stew meat' },
    { name: 'Pork Trotters', price: 90000, description: 'Fresh pork trotters, rich in collagen' },
    { name: 'Broiler Chicken', price: 85000, description: 'Fresh broiler chicken, clean and safe' },
    { name: 'Ground Beef', price: 200000, description: 'Fresh ground beef, convenient for cooking' }
  ],
  'fresh-seafood': [
    { name: 'Norwegian Salmon', price: 350000, description: 'Fresh Norwegian salmon, rich in omega-3' },
    { name: 'Fresh Tiger Prawns', price: 280000, description: 'Fresh delicious tiger prawns, large size' },
    { name: 'Fresh Mackerel', price: 180000, description: 'Fresh delicious mackerel, firm meat' },
    { name: 'Fresh Squid', price: 220000, description: 'Fresh delicious squid, chewy texture' },
    { name: 'Fresh Sea Crab', price: 320000, description: 'Fresh live sea crab, sweet meat' },
    { name: 'Basa Fish Fillet', price: 120000, description: 'Fresh basa fish fillet, boneless' },
    { name: 'Fresh White Shrimp', price: 200000, description: 'Fresh delicious white shrimp, medium size' },
    { name: 'Red Snapper', price: 160000, description: 'Fresh delicious red snapper' },
    { name: 'Fresh Clams', price: 80000, description: 'Fresh live clams, sweet meat' },
    { name: 'Fresh Tuna', price: 240000, description: 'Fresh delicious tuna, red meat' }
  ],
  'vegetables': [
    { name: 'Sweet Greens', price: 15000, description: 'Fresh green sweet vegetables, VietGAP certified' },
    { name: 'Cherry Tomatoes', price: 25000, description: 'Sweet cherry tomatoes, rich in vitamin C' },
    { name: 'Dalat Potatoes', price: 35000, description: 'Fresh delicious Dalat potatoes' },
    { name: 'Purple Eggplant', price: 20000, description: 'Fresh delicious purple eggplant' },
    { name: 'White Cabbage', price: 18000, description: 'Fresh crispy white cabbage' },
    { name: 'White Radish', price: 22000, description: 'Fresh delicious white radish' },
    { name: 'Water Spinach', price: 12000, description: 'Fresh green water spinach' },
    { name: 'Red Bell Pepper', price: 45000, description: 'Fresh delicious red bell pepper' },
    { name: 'Broccoli', price: 30000, description: 'Fresh delicious broccoli' },
    { name: 'Beef Tomatoes', price: 35000, description: 'Large sweet beef tomatoes' }
  ]
};

// Generate English products
function generateEnglishProducts() {
  const products = [];
  
  categories.forEach((category, categoryIndex) => {
    const template = productTemplates[category.slug] || [];
    
    for (let i = 0; i < 10; i++) {
      const baseProduct = template[i] || {
        name: `Product ${i + 1} - ${category.name}`,
        price: Math.floor(Math.random() * 200000) + 10000,
        description: `High quality product in ${category.name} category`
      };
      
      const product = {
        name: baseProduct.name,
        description: baseProduct.description,
        price: baseProduct.price,
        discount_price: Math.random() > 0.7 ? Math.floor(baseProduct.price * 0.9) : null,
        category_slug: category.slug,
        stock_quantity: Math.floor(Math.random() * 100) + 10,
        sku: `${category.slug.toUpperCase()}_${String(i + 1).padStart(3, '0')}`,
        weight: Math.random() * 2 + 0.1,
        is_featured: Math.random() > 0.8
      };
      
      products.push(product);
    }
  });
  
  return products;
}

// English users
const users = [
  {
    full_name: 'John Admin',
    email: 'admin@supermarket.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'admin',
    phone: '0901234567'
  },
  {
    full_name: 'Alice Johnson',
    email: 'alice@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0987654321'
  },
  {
    full_name: 'Bob Smith',
    email: 'bob@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0912345678'
  },
  {
    full_name: 'Carol Brown',
    email: 'carol@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0923456789'
  },
  {
    full_name: 'David Wilson',
    email: 'david@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0934567890'
  }
];

// English review comments
const reviewComments = [
  'Great product quality, carefully packaged',
  'Fast delivery, product as described',
  'Reasonable price, will buy again',
  'Excellent quality, very satisfied',
  'Fresh product, worth the money',
  'Good service, friendly staff',
  'Beautiful packaging, perfect for gifts',
  'Product matches the image',
  'Good quality, price a bit high',
  'Very satisfied with this product'
];

async function seedEnglishData() {
  try {
    console.log('🌱 Starting English data seeding...');
    
    const products = generateEnglishProducts();
    console.log(`📊 Will seed: ${categories.length} categories, ${products.length} products, ${users.length} users`);

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
        stock_quantity, is_featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    for (const product of products) {
      const categoryId = categoryMap[product.category_slug];
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);
      
      insertProduct.run(
        product.name,
        slug,
        product.description,
        product.price,
        categoryId,
        product.stock_quantity,
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

    // Generate and insert reviews
    console.log('⭐ Inserting reviews...');
    const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');
    const getProductId = db.prepare('SELECT id FROM products LIMIT 1 OFFSET ?');
    const insertReview = db.prepare(`
      INSERT INTO reviews (
        product_id, user_id, rating, comment, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `);

    for (let i = 0; i < 100; i++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const randomProductIndex = Math.floor(Math.random() * products.length);
      const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
      
      const user = getUserId.get(users[randomUserIndex].email);
      const product = getProductId.get(randomProductIndex);
      
      if (user && product) {
        insertReview.run(
          product.id,
          user.id,
          Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
          randomComment
        );
      }
    }

    console.log('✅ English data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding English data:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedEnglishData();
}

module.exports = { seedEnglishData };