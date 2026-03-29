const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'ecommerce.db');
const db = new Database(dbPath);

// Category images mapping (supports both Vietnamese and English slugs)
const categoryImages = {
  // Vietnamese slugs
  'thit-tuoi-song': 'https://images.unsplash.com/photo-1588347818111-c3b2c3c5b9b5?w=500',
  'hai-san-tuoi': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500',
  'rau-cu-qua': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
  'trai-cay-tuoi': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
  'sua-san-pham-sua': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
  'trung-gia-cam': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
  'banh-mi-banh-ngot': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
  'gao-ngu-coc': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
  'mi-bun-kho': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
  'dau-an-gia-vi': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
  'nuoc-ngot-co-gas': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
  'nuoc-trai-cay': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500',
  'tra-ca-phe': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
  'nuoc-suoi-nuoc-loc': 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=500',
  'bia-ruou': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500',
  'sua-dau-nanh-thuc-uong-dinh-duong': 'https://images.unsplash.com/photo-1571212515416-fca88c6e8b5d?w=500',
  'banh-quy-crackers': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
  'keo-chocolate': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500',
  'snack-do-an-vat': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500',
  'hat-trai-cay-kho': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500',
  'thuc-pham-dong-lanh': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
  'thuc-pham-dong-hop': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=500',
  'kem-do-lanh': 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=500',
  'cham-soc-da-mat': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500',
  'cham-soc-co-the': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500',
  'cham-soc-rang-mieng': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500',
  'dung-cu-trang-diem': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
  'cham-soc-toc': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
  'nuoc-hoa-khu-mui': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
  'chat-tay-rua': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500',
  'giay-ve-sinh-khan-giay': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500',
  'do-dung-nha-bep': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
  'do-gia-dung': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  'bong-den-dien-gia-dung': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
  'sua-bot-tre-em': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
  'do-dung-cho-be': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500',
  'thuc-pham-cho-be': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
  'thuc-an-thu-cung': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
  'do-dung-thu-cung': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
  'thuoc-khong-ke-don': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500',
  'thuc-pham-chuc-nang': 'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=500',
  'dung-cu-y-te': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500',
  'dien-thoai-phu-kien': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  'do-dien-tu-gia-dung': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
  'dung-cu-the-thao': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
  'do-dung-da-ngoai': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500',
  'van-phong-pham': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
  'sach-tap-chi': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
  'quan-ao-nam': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500',
  'quan-ao-nu': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
  'giay-dep': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
  
  // English slugs
  'fresh-meat': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800',
  'fresh-seafood': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800',
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  'fresh-fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
  'dairy-products': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
  'eggs-poultry': 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800',
  'bread-pastries': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  'rice-grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
  'noodles-pasta': 'https://images.unsplash.com/photo-1551462147-37cbd8c5d00b?w=800',
  'oil-seasonings': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
  'carbonated-drinks': 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=800',
  'fruit-juices': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
  'tea-coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  'water-filtered': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
  'beer-alcohol': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800',
  'soy-milk-health': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
  'cookies-crackers': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
  'candy-chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800',
  'snacks-chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800',
  'nuts-dried-fruits': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800',
  'frozen-foods': 'https://images.unsplash.com/photo-1476887334197-56adbf254e1a?w=800',
  'canned-foods': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800',
  'ice-cream-frozen': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
  'facial-care': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
  'body-care': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',
  'oral-care': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800',
  'makeup-tools': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
  'hair-care': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
  'perfume-deodorant': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
  'cleaning-products': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800',
  'toilet-paper-tissues': 'https://images.unsplash.com/photo-1584556326561-c8c2b0b8b7e7?w=800',
  'kitchen-utensils': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'household-items': 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
  'light-bulbs-electrical': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
  'baby-formula': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
  'baby-supplies': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800',
  'baby-food': 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800',
  'pet-food': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
  'pet-supplies': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
  'otc-medicine': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
  'health-supplements': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
  'medical-supplies': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800',
  'phones-accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  'home-electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
  'sports-equipment': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  'outdoor-gear': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  'office-supplies': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
  'books-magazines': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
  'mens-clothing': 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800',
  'womens-clothing': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  'shoes-footwear': 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800'
};

async function updateCategoryImages() {
  try {
    console.log('🖼️ Starting category image update...');

    // Get all categories
    const getCategories = db.prepare('SELECT id, slug, name FROM categories');
    const categories = getCategories.all();
    console.log(`📊 Found ${categories.length} categories to update`);

    // Update category images
    const updateImage = db.prepare('UPDATE categories SET image_url = ? WHERE id = ?');
    
    let updatedCount = 0;
    categories.forEach(category => {
      const imageUrl = categoryImages[category.slug];
      if (imageUrl) {
        updateImage.run(imageUrl, category.id);
        updatedCount++;
        console.log(`  ✅ Updated ${category.name}: ${imageUrl}`);
      } else {
        console.log(`  ⚠️ No image found for ${category.name} (${category.slug})`);
      }
    });

    console.log(`✅ Category images updated successfully! ${updatedCount}/${categories.length} categories updated`);

  } catch (error) {
    console.error('❌ Error updating category images:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run update if called directly
if (require.main === module) {
  updateCategoryImages();
}

module.exports = { updateCategoryImages };