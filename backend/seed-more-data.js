const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database', 'ecommerce.db'));

console.log('🌱 Bắt đầu thêm dữ liệu mới...');

// Thêm categories mới
const categories = [
  { name: 'Laptop', slug: 'laptop', description: 'Máy tính xách tay các loại', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853' },
  { name: 'Tablet', slug: 'tablet', description: 'Máy tính bảng', image_url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764' },
  { name: 'Tai nghe', slug: 'tai-nghe', description: 'Tai nghe, headphone', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
  { name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', description: 'Smartwatch các loại', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' },
  { name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện điện thoại, laptop', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f' },
  { name: 'Camera', slug: 'camera', description: 'Máy ảnh, camera', image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f' },
  { name: 'Loa', slug: 'loa', description: 'Loa bluetooth, loa thông minh', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1' },
  { name: 'Tivi', slug: 'tivi', description: 'Smart TV các loại', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1' },
];

console.log('📦 Thêm categories...');
const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, slug, description, image_url)
  VALUES (?, ?, ?, ?)
`);

categories.forEach(cat => {
  insertCategory.run(cat.name, cat.slug, cat.description, cat.image_url);
});

// Lấy category IDs
const getCategoryId = (slug) => {
  return db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)?.id;
};

// Thêm sản phẩm mới
const products = [
  // Laptop
  { name: 'MacBook Pro 14" M3', slug: 'macbook-pro-14-m3', description: 'Laptop cao cấp với chip M3 mạnh mẽ', price: 45990000, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', stock: 25, featured: 1 },
  { name: 'MacBook Air 13" M2', slug: 'macbook-air-13-m2', description: 'Laptop mỏng nhẹ, hiệu năng tốt', price: 28990000, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9', stock: 30, featured: 1 },
  { name: 'Dell XPS 13', slug: 'dell-xps-13', description: 'Laptop Windows cao cấp', price: 32990000, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', stock: 20, featured: 0 },
  { name: 'HP Pavilion 15', slug: 'hp-pavilion-15', description: 'Laptop phổ thông, giá tốt', price: 15990000, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', stock: 35, featured: 0 },
  { name: 'Lenovo ThinkPad X1', slug: 'lenovo-thinkpad-x1', description: 'Laptop doanh nhân', price: 38990000, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', stock: 15, featured: 0 },
  { name: 'ASUS ROG Zephyrus', slug: 'asus-rog-zephyrus', description: 'Laptop gaming cao cấp', price: 52990000, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302', stock: 12, featured: 1 },
  
  // Tablet
  { name: 'iPad Pro 12.9"', slug: 'ipad-pro-12-9', description: 'Tablet cao cấp nhất của Apple', price: 32990000, category: 'tablet', image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', stock: 20, featured: 1 },
  { name: 'iPad Air', slug: 'ipad-air', description: 'Tablet cân bằng giá và hiệu năng', price: 18990000, category: 'tablet', image_url: 'https://images.unsplash.com/photo-1585790050230-5dd28404f1e9', stock: 30, featured: 0 },
  { name: 'Samsung Galaxy Tab S9', slug: 'samsung-tab-s9', description: 'Tablet Android cao cấp', price: 22990000, category: 'tablet', image_url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764', stock: 25, featured: 0 },
  { name: 'iPad Mini', slug: 'ipad-mini', description: 'Tablet nhỏ gọn, tiện lợi', price: 14990000, category: 'tablet', image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', stock: 28, featured: 0 },
  
  // Tai nghe
  { name: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'Tai nghe true wireless cao cấp', price: 6490000, category: 'tai-nghe', image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7', stock: 50, featured: 1 },
  { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Tai nghe chống ồn tốt nhất', price: 8990000, category: 'tai-nghe', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', stock: 35, featured: 1 },
  { name: 'AirPods Max', slug: 'airpods-max', description: 'Tai nghe over-ear cao cấp', price: 13990000, category: 'tai-nghe', image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944', stock: 20, featured: 0 },
  { name: 'Bose QuietComfort 45', slug: 'bose-qc45', description: 'Tai nghe chống ồn Bose', price: 7990000, category: 'tai-nghe', image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', stock: 30, featured: 0 },
  { name: 'Samsung Galaxy Buds2 Pro', slug: 'galaxy-buds2-pro', description: 'Tai nghe true wireless Samsung', price: 4490000, category: 'tai-nghe', image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df', stock: 45, featured: 0 },
  
  // Đồng hồ thông minh
  { name: 'Apple Watch Series 9', slug: 'apple-watch-series-9', description: 'Smartwatch tốt nhất cho iPhone', price: 10990000, category: 'dong-ho-thong-minh', image_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d', stock: 40, featured: 1 },
  { name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'Smartwatch cao cấp cho thể thao', price: 21990000, category: 'dong-ho-thong-minh', image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a', stock: 15, featured: 1 },
  { name: 'Samsung Galaxy Watch 6', slug: 'galaxy-watch-6', description: 'Smartwatch Android tốt nhất', price: 7990000, category: 'dong-ho-thong-minh', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', stock: 35, featured: 0 },
  { name: 'Garmin Fenix 7', slug: 'garmin-fenix-7', description: 'Đồng hồ thể thao chuyên nghiệp', price: 18990000, category: 'dong-ho-thong-minh', image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1', stock: 20, featured: 0 },
  
  // Phụ kiện
  { name: 'Ốp lưng iPhone 15 Pro', slug: 'op-lung-iphone-15-pro', description: 'Ốp lưng silicon chính hãng', price: 990000, category: 'phu-kien', image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb', stock: 100, featured: 0 },
  { name: 'Cáp sạc USB-C 2m', slug: 'cap-sac-usbc-2m', description: 'Cáp sạc nhanh USB-C', price: 490000, category: 'phu-kien', image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', stock: 150, featured: 0 },
  { name: 'Sạc nhanh 67W', slug: 'sac-nhanh-67w', description: 'Củ sạc nhanh đa năng', price: 790000, category: 'phu-kien', image_url: 'https://images.unsplash.com/photo-1591290619762-c588f7e8e86f', stock: 80, featured: 0 },
  { name: 'Pin dự phòng 20000mAh', slug: 'pin-du-phong-20000mah', description: 'Pin sạc dự phòng dung lượng lớn', price: 1290000, category: 'phu-kien', image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5', stock: 60, featured: 0 },
  { name: 'Giá đỡ laptop', slug: 'gia-do-laptop', description: 'Giá đỡ laptop nhôm cao cấp', price: 590000, category: 'phu-kien', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', stock: 45, featured: 0 },
  
  // Camera
  { name: 'Canon EOS R6 Mark II', slug: 'canon-eos-r6-mark-ii', description: 'Máy ảnh mirrorless full-frame', price: 68990000, category: 'camera', image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd', stock: 10, featured: 1 },
  { name: 'Sony A7 IV', slug: 'sony-a7-iv', description: 'Máy ảnh hybrid tốt nhất', price: 62990000, category: 'camera', image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f', stock: 12, featured: 1 },
  { name: 'GoPro Hero 12', slug: 'gopro-hero-12', description: 'Camera hành trình 5.3K', price: 11990000, category: 'camera', image_url: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77', stock: 25, featured: 0 },
  
  // Loa
  { name: 'HomePod 2', slug: 'homepod-2', description: 'Loa thông minh Apple', price: 7990000, category: 'loa', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1', stock: 30, featured: 0 },
  { name: 'JBL Flip 6', slug: 'jbl-flip-6', description: 'Loa bluetooth di động', price: 2990000, category: 'loa', image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d', stock: 50, featured: 0 },
  { name: 'Bose SoundLink Revolve+', slug: 'bose-soundlink-revolve', description: 'Loa bluetooth 360 độ', price: 6990000, category: 'loa', image_url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab', stock: 35, featured: 0 },
  
  // Tivi
  { name: 'Samsung QLED 65"', slug: 'samsung-qled-65', description: 'Smart TV QLED 4K', price: 32990000, category: 'tivi', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1', stock: 15, featured: 1 },
  { name: 'LG OLED 55"', slug: 'lg-oled-55', description: 'Smart TV OLED 4K', price: 28990000, category: 'tivi', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1', stock: 18, featured: 1 },
  { name: 'Sony Bravia 50"', slug: 'sony-bravia-50', description: 'Smart TV 4K Android', price: 18990000, category: 'tivi', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1', stock: 22, featured: 0 },
];

console.log('📱 Thêm sản phẩm...');
const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (name, slug, description, price, category_id, image_url, stock_quantity, is_featured)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

let addedCount = 0;
products.forEach(product => {
  const categoryId = getCategoryId(product.category);
  if (categoryId) {
    insertProduct.run(
      product.name,
      product.slug,
      product.description,
      product.price,
      categoryId,
      product.image_url,
      product.stock,
      product.featured
    );
    addedCount++;
  }
});

// Thống kê
const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

console.log('\n✅ Hoàn thành!');
console.log(`📦 Tổng số categories: ${totalCategories}`);
console.log(`📱 Tổng số sản phẩm: ${totalProducts}`);
console.log(`➕ Đã thêm: ${addedCount} sản phẩm mới`);

db.close();
