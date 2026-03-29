const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'ecommerce.db');
const db = new Database(dbPath);

// Specific product images
const productImages = {
  'Beef Tenderloin': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800',
  'Fresh Tuna': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800'
};

async function updateSpecificImages() {
  try {
    console.log('🖼️  Updating specific product images...\n');

    const updateStmt = db.prepare('UPDATE products SET image_url = ? WHERE name = ?');
    
    for (const [productName, imageUrl] of Object.entries(productImages)) {
      const result = updateStmt.run(imageUrl, productName);
      
      if (result.changes > 0) {
        console.log(`✅ Updated ${productName}`);
        console.log(`   Image: ${imageUrl}\n`);
      } else {
        console.log(`⚠️  Product not found: ${productName}\n`);
      }
    }

    console.log('🎉 Specific images updated successfully!');

  } catch (error) {
    console.error('❌ Error updating images:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run if executed directly
if (require.main === module) {
  updateSpecificImages();
}

module.exports = { updateSpecificImages };
