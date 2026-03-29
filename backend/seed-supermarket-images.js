const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'ecommerce.db');
const db = new Database(dbPath);

// Function to get appropriate image URL for each category
function getImageUrl(categorySlug, productIndex) {
  const imageMap = {
    'fresh-meat': [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800', // Beef
      'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800', // Pork
      'https://images.unsplash.com/photo-1588347818111-c3b2c3c5b9b5?w=800', // Raw meat
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800', // Chicken
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', // Meat cuts
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', // Pork ribs
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800', // Beef steak
      'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800', // Ground meat
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800', // Chicken breast
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800'  // Poultry
    ],
    'fresh-seafood': [
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', // Salmon
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800', // Shrimp
      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800', // Fresh fish
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', // Seafood mix
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', // Crab
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // Squid
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800', // Fish fillet
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800', // Seafood platter
      'https://images.unsplash.com/photo-1535140728325-a4d3707eee61?w=800', // Clams
      'https://images.unsplash.com/photo-1580959375944-0b7b2b3e6b0e?w=800'  // Tuna
    ],
    'vegetables': [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', // Vegetables mix
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800', // Tomatoes
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800', // Potatoes
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800', // Eggplant
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800', // Cabbage
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800', // Carrots
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800', // Lettuce
      'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=800', // Bell peppers
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800', // Broccoli
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800'  // Fresh greens
    ],
    'fresh-fruits': [
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800', // Fruit basket
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800', // Apples
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800', // Bananas
      'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800', // Oranges
      'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800', // Grapes
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800', // Strawberries
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800', // Watermelon
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', // Tropical fruits
      'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800', // Citrus
      'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=800'  // Mixed fruits
    ],
    'dairy-products': [
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800', // Dairy products
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800', // Milk
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800', // Cheese
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800', // Yogurt
      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800', // Butter
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800', // Milk bottles
      'https://images.unsplash.com/photo-1571212515416-fca88c6e8b5d?w=800', // Dairy shelf
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800', // Cream
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800', // Fresh milk
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800'  // Cheese varieties
    ],
    'eggs-poultry': [
      'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800', // Eggs in carton
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800', // Fresh eggs
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800', // Chicken
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800', // Poultry
      'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800', // Brown eggs
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800', // White eggs
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800', // Chicken meat
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800', // Chicken breast
      'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800', // Egg basket
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800'  // Farm eggs
    ],
    'bread-pastries': [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', // Bread loaves
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', // Croissants
      'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=800', // Bagels
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800', // Muffins
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800', // Baguette
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', // Fresh bread
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', // Pastries
      'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=800', // Bakery items
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800', // Sweet bread
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'  // Artisan bread
    ],
    'rice-grains': [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', // Rice grains
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800', // White rice
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', // Rice varieties
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800', // Grain mix
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', // Brown rice
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800', // Rice bowl
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', // Jasmine rice
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800', // Basmati rice
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', // Rice sack
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800'  // Whole grains
    ],
    'noodles-pasta': [
      'https://images.unsplash.com/photo-1551462147-37cbd8c5d00b?w=800', // Pasta varieties
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', // Noodles
      'https://images.unsplash.com/photo-1551462147-37cbd8c5d00b?w=800', // Spaghetti
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', // Asian noodles
      'https://images.unsplash.com/photo-1551462147-37cbd8c5d00b?w=800', // Pasta shapes
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', // Rice noodles
      'https://images.unsplash.com/photo-1551462147-37cbd8c5d00b?w=800', // Penne pasta
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', // Instant noodles
      'https://images.unsplash.com/photo-1551462147-37cbd8c5d00b?w=800', // Fusilli
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'  // Udon noodles
    ],
    'oil-seasonings': [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', // Cooking oil
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', // Spices
      'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800', // Olive oil
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', // Seasonings
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', // Oil bottles
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', // Herbs
      'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800', // Condiments
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', // Spice jars
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', // Vegetable oil
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'  // Salt pepper
    ]
  };
  
  // Default images for categories not specifically mapped
  const defaultImages = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
  ];
  
  const categoryImages = imageMap[categorySlug] || defaultImages;
  return categoryImages[productIndex % categoryImages.length];
}

async function updateProductImages() {
  try {
    console.log('🖼️ Starting product image update...');

    // Get all products with their categories
    const getProducts = db.prepare(`
      SELECT p.id, p.name, c.slug as category_slug 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
    `);
    
    const products = getProducts.all();
    console.log(`📊 Found ${products.length} products to update`);

    // Update images in batches
    const updateImage = db.prepare('UPDATE products SET image_url = ? WHERE id = ?');
    
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`  Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}...`);
      
      batch.forEach((product, index) => {
        const imageUrl = getImageUrl(product.category_slug, (i + index) % 10);
        updateImage.run(imageUrl, product.id);
      });
    }

    console.log('✅ Product images updated successfully!');

  } catch (error) {
    console.error('❌ Error updating product images:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run update if called directly
if (require.main === module) {
  updateProductImages();
}

module.exports = { updateProductImages };