const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database', 'ecommerce.db');
const db = new Database(dbPath);

// 50 comprehensive categories for a supermarket
const categories = [
  // Food & Beverages
  { name: 'Thịt tươi sống', slug: 'thit-tuoi-song', description: 'Thịt heo, bò, gà, vịt tươi ngon' },
  { name: 'Hải sản tươi', slug: 'hai-san-tuoi', description: 'Cá, tôm, cua, mực tươi sống' },
  { name: 'Rau củ quả', slug: 'rau-cu-qua', description: 'Rau xanh, củ quả tươi ngon' },
  { name: 'Trái cây tươi', slug: 'trai-cay-tuoi', description: 'Trái cây trong nước và nhập khẩu' },
  { name: 'Sữa & Sản phẩm từ sữa', slug: 'sua-san-pham-sua', description: 'Sữa tươi, sữa chua, phô mai' },
  { name: 'Trứng & Gia cầm', slug: 'trung-gia-cam', description: 'Trứng gà, vịt, cút các loại' },
  { name: 'Bánh mì & Bánh ngọt', slug: 'banh-mi-banh-ngot', description: 'Bánh mì tươi, bánh ngọt, bánh kem' },
  { name: 'Gạo & Ngũ cốc', slug: 'gao-ngu-coc', description: 'Gạo các loại, yến mạch, ngũ cốc' },
  { name: 'Mì & Bún khô', slug: 'mi-bun-kho', description: 'Mì gói, bún khô, miến các loại' },
  { name: 'Dầu ăn & Gia vị', slug: 'dau-an-gia-vi', description: 'Dầu ăn, nước mắm, tương ớt' },
  
  // Beverages
  { name: 'Nước ngọt có gas', slug: 'nuoc-ngot-co-gas', description: 'Coca, Pepsi, 7Up các loại' },
  { name: 'Nước trái cây', slug: 'nuoc-trai-cay', description: 'Nước cam, táo, nho ép' },
  { name: 'Trà & Cà phê', slug: 'tra-ca-phe', description: 'Trà túi lọc, cà phê hòa tan' },
  { name: 'Nước suối & Nước lọc', slug: 'nuoc-suoi-nuoc-loc', description: 'Nước suối, nước lọc đóng chai' },
  { name: 'Bia & Rượu', slug: 'bia-ruou', description: 'Bia các loại, rượu vang, whisky' },
  { name: 'Sữa đậu nành & Thức uống dinh dưỡng', slug: 'sua-dau-nanh-thuc-uong-dinh-duong', description: 'Sữa đậu nành, nước yến, collagen' },
  
  // Snacks & Confectionery
  { name: 'Bánh quy & Crackers', slug: 'banh-quy-crackers', description: 'Bánh quy ngọt, mặn các loại' },
  { name: 'Kẹo & Chocolate', slug: 'keo-chocolate', description: 'Kẹo cứng, kẹo dẻo, socola' },
  { name: 'Snack & Đồ ăn vặt', slug: 'snack-do-an-vat', description: 'Bánh tráng, khoai tây chiên' },
  { name: 'Hạt & Trái cây khô', slug: 'hat-trai-cay-kho', description: 'Hạt điều, nho khô, mơ khô' },
  
  // Frozen & Canned Foods
  { name: 'Thực phẩm đông lạnh', slug: 'thuc-pham-dong-lanh', description: 'Thịt đông lạnh, rau đông lạnh' },
  { name: 'Thực phẩm đóng hộp', slug: 'thuc-pham-dong-hop', description: 'Cá hộp, thịt hộp, rau hộp' },
  { name: 'Kem & Đồ lạnh', slug: 'kem-do-lanh', description: 'Kem que, kem hộp, đá viên' },
  
  // Health & Beauty
  { name: 'Chăm sóc da mặt', slug: 'cham-soc-da-mat', description: 'Sữa rửa mặt, kem dưỡng da' },
  { name: 'Chăm sóc cơ thể', slug: 'cham-soc-co-the', description: 'Sữa tắm, dầu gội, xà phòng' },
  { name: 'Chăm sóc răng miệng', slug: 'cham-soc-rang-mieng', description: 'Kem đánh răng, bàn chải đánh răng' },
  { name: 'Dụng cụ trang điểm', slug: 'dung-cu-trang-diem', description: 'Son môi, phấn, mascara' },
  { name: 'Chăm sóc tóc', slug: 'cham-soc-toc', description: 'Dầu gội, dầu xả, gel vuốt tóc' },
  { name: 'Nước hoa & Khử mùi', slug: 'nuoc-hoa-khu-mui', description: 'Nước hoa, xịt khử mùi cơ thể' },
  
  // Household & Cleaning
  { name: 'Chất tẩy rửa', slug: 'chat-tay-rua', description: 'Nước rửa chén, bột giặt, nước lau sàn' },
  { name: 'Giấy vệ sinh & Khăn giấy', slug: 'giay-ve-sinh-khan-giay', description: 'Giấy vệ sinh, khăn giấy ăn' },
  { name: 'Đồ dùng nhà bếp', slug: 'do-dung-nha-bep', description: 'Chảo, nồi, dao, thớt' },
  { name: 'Đồ gia dụng', slug: 'do-gia-dung', description: 'Thau, chậu, giỏ đựng đồ' },
  { name: 'Bóng đèn & Điện gia dụng', slug: 'bong-den-dien-gia-dung', description: 'Bóng đèn LED, ổ cắm điện' },
  
  // Baby & Kids
  { name: 'Sữa bột trẻ em', slug: 'sua-bot-tre-em', description: 'Sữa bột các độ tuổi cho bé' },
  { name: 'Đồ dùng cho bé', slug: 'do-dung-cho-be', description: 'Bình sữa, tã giấy, đồ chơi' },
  { name: 'Thực phẩm cho bé', slug: 'thuc-pham-cho-be', description: 'Cháo hộp, bánh ăn dặm' },
  
  // Pet Care
  { name: 'Thức ăn thú cưng', slug: 'thuc-an-thu-cung', description: 'Thức ăn cho chó, mèo, cá' },
  { name: 'Đồ dùng thú cưng', slug: 'do-dung-thu-cung', description: 'Lồng, đồ chơi, dây dắt' },
  
  // Health & Pharmacy
  { name: 'Thuốc không kê đơn', slug: 'thuoc-khong-ke-don', description: 'Thuốc cảm, thuốc đau đầu' },
  { name: 'Thực phẩm chức năng', slug: 'thuc-pham-chuc-nang', description: 'Vitamin, canxi, omega-3' },
  { name: 'Dụng cụ y tế', slug: 'dung-cu-y-te', description: 'Nhiệt kế, băng gạc, cồn y tế' },
  
  // Electronics & Tech
  { name: 'Điện thoại & Phụ kiện', slug: 'dien-thoai-phu-kien', description: 'Điện thoại, ốp lưng, sạc' },
  { name: 'Đồ điện tử gia dụng', slug: 'do-dien-tu-gia-dung', description: 'Quạt, bàn ủi, máy sấy tóc' },
  
  // Sports & Outdoor
  { name: 'Dụng cụ thể thao', slug: 'dung-cu-the-thao', description: 'Bóng đá, cầu lông, yoga' },
  { name: 'Đồ dùng dã ngoại', slug: 'do-dung-da-ngoai', description: 'Lều, túi ngủ, bình nước' },
  
  // Stationery & Books
  { name: 'Văn phòng phẩm', slug: 'van-phong-pham', description: 'Bút, giấy, keo dán, thước' },
  { name: 'Sách & Tạp chí', slug: 'sach-tap-chi', description: 'Sách giáo khoa, tiểu thuyết' },
  
  // Fashion & Accessories
  { name: 'Quần áo nam', slug: 'quan-ao-nam', description: 'Áo sơ mi, quần jean, áo thun' },
  { name: 'Quần áo nữ', slug: 'quan-ao-nu', description: 'Váy, áo kiểu, quần tây' },
  { name: 'Giày dép', slug: 'giay-dep', description: 'Giày thể thao, dép, sandal' }
];

// Function to get appropriate image URL for each category
function getImageUrl(categorySlug, productIndex) {
  const imageMap = {
    'thit-tuoi-song': [
      'https://images.unsplash.com/photo-1588347818111-c3b2c3c5b9b5?w=500', // pork
      'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=500', // meat
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', // beef
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500', // chicken
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500', // duck
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500', // ribs
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500', // beef stew
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500', // pork leg
      'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=500', // chicken industrial
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500'  // ground beef
    ],
    'hai-san-tuoi': [
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500', // salmon
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500', // shrimp
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', // fish
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', // squid
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', // crab
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=500', // fish fillet
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500', // small shrimp
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', // red fish
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', // clams
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500'  // tuna
    ],
    'rau-cu-qua': [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', // green vegetables
      'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500', // cherry tomatoes
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', // potatoes
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', // eggplant
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500', // cabbage
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', // white radish
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', // water spinach
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', // bell pepper
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500', // broccoli
      'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500'  // beef tomato
    ],
    'trai-cay-tuoi': [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', // apple
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', // banana
      'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500', // orange
      'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500', // grapes
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', // strawberry
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', // mango
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', // pineapple
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', // papaya
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', // dragon fruit
      'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500'  // watermelon
    ],
    'sua-san-pham-sua': [
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', // milk
      'https://images.unsplash.com/photo-1571212515416-fca88c6e8b5d?w=500', // yogurt
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500', // cheese
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', // fresh milk
      'https://images.unsplash.com/photo-1571212515416-fca88c6e8b5d?w=500', // greek yogurt
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500', // mozzarella
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', // almond milk
      'https://images.unsplash.com/photo-1571212515416-fca88c6e8b5d?w=500', // probiotic yogurt
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500', // cream cheese
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500'  // coconut milk
    ],
    'nuoc-ngot-co-gas': [
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', // coca cola
      'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500', // pepsi
      'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500', // sprite
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', // fanta
      'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500', // mountain dew
      'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500', // 7up
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', // dr pepper
      'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500', // mirinda
      'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500', // schweppes
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500'  // coca zero
    ],
    'banh-quy-crackers': [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', // oreo
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', // cookies
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // crackers
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', // chocolate cookies
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', // biscuits
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // wafers
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', // sandwich cookies
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', // digestive
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // saltines
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500'  // marie biscuits
    ],
    'keo-chocolate': [
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500', // gummy bears
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // chocolate bar
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500', // hard candy
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // dark chocolate
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500', // lollipops
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // milk chocolate
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500', // jelly beans
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500', // white chocolate
      'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500', // marshmallows
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500'  // chocolate truffles
    ],
    'chat-tay-rua': [
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500', // dish soap
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', // laundry detergent
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500', // floor cleaner
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', // fabric softener
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500', // glass cleaner
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', // bleach
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500', // bathroom cleaner
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', // kitchen cleaner
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500', // multi-surface cleaner
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500'  // stain remover
    ],
    'cham-soc-da-mat': [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', // face wash
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500', // moisturizer
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', // toner
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500', // serum
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', // sunscreen
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500', // face mask
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', // eye cream
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500', // cleanser
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', // exfoliator
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500'  // night cream
    ],
    'gao-ngu-coc': [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', // rice
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', // oats
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', // brown rice
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', // quinoa
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', // jasmine rice
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', // barley
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', // basmati rice
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', // wheat
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', // wild rice
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'  // millet
    ],
    'mi-bun-kho': [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', // instant noodles
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500', // dried noodles
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', // ramen
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500', // rice noodles
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', // cup noodles
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500', // soba noodles
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', // udon noodles
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500', // glass noodles
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', // egg noodles
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500'  // wheat noodles
    ]
  };
  
  // Default images for categories not specifically mapped
  const defaultImages = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500'
  ];
  
  const categoryImages = imageMap[categorySlug] || defaultImages;
  return categoryImages[productIndex % categoryImages.length];
}
  const products = [];
  
  // Product data templates for each category
  const productTemplates = {
    'thit-tuoi-song': [
      { name: 'Thịt ba chỉ heo', price: 120000, description: 'Thịt ba chỉ heo tươi ngon, thích hợp nướng BBQ' },
      { name: 'Thịt nạc vai heo', price: 140000, description: 'Thịt nạc vai heo tươi, ít mỡ' },
      { name: 'Thịt bò thăn', price: 280000, description: 'Thịt bò thăn cao cấp, mềm ngon' },
      { name: 'Thịt gà ta', price: 160000, description: 'Thịt gà ta tươi ngon, không hormone' },
      { name: 'Thịt vịt xiêm', price: 180000, description: 'Thịt vịt xiêm tươi, thơm ngon' },
      { name: 'Sườn heo non', price: 150000, description: 'Sườn heo non tươi, thích hợp nướng' },
      { name: 'Thịt bò kho', price: 220000, description: 'Thịt bò kho tươi ngon' },
      { name: 'Chân giò heo', price: 90000, description: 'Chân giò heo tươi, giàu collagen' },
      { name: 'Thịt gà công nghiệp', price: 85000, description: 'Thịt gà công nghiệp tươi sạch' },
      { name: 'Thịt bò xay', price: 200000, description: 'Thịt bò xay tươi, tiện chế biến' }
    ],
    'hai-san-tuoi': [
      { name: 'Cá hồi Na Uy', price: 350000, description: 'Cá hồi Na Uy tươi ngon, giàu omega-3' },
      { name: 'Tôm sú tươi', price: 280000, description: 'Tôm sú tươi ngon, size lớn' },
      { name: 'Cá thu tươi', price: 180000, description: 'Cá thu tươi ngon, thịt chắc' },
      { name: 'Mực ống tươi', price: 220000, description: 'Mực ống tươi ngon, dai giòn' },
      { name: 'Cua biển tươi', price: 320000, description: 'Cua biển tươi sống, thịt ngọt' },
      { name: 'Cá basa fillet', price: 120000, description: 'Cá basa fillet tươi, không xương' },
      { name: 'Tôm thẻ tươi', price: 200000, description: 'Tôm thẻ tươi ngon, size vừa' },
      { name: 'Cá điêu hồng', price: 160000, description: 'Cá điêu hồng tươi ngon' },
      { name: 'Nghêu tươi', price: 80000, description: 'Nghêu tươi sống, thịt ngọt' },
      { name: 'Cá ngừ tươi', price: 240000, description: 'Cá ngừ tươi ngon, thịt đỏ' }
    ],
    'rau-cu-qua': [
      { name: 'Rau cải ngọt', price: 15000, description: 'Rau cải ngọt tươi xanh, VietGAP' },
      { name: 'Cà chua bi', price: 25000, description: 'Cà chua bi ngọt, giàu vitamin C' },
      { name: 'Khoai tây Đà Lạt', price: 35000, description: 'Khoai tây Đà Lạt tươi ngon' },
      { name: 'Cà rót tím', price: 20000, description: 'Cà rót tím tươi ngon' },
      { name: 'Bắp cải trắng', price: 18000, description: 'Bắp cải trắng tươi giòn' },
      { name: 'Củ cải trắng', price: 22000, description: 'Củ cải trắng tươi ngon' },
      { name: 'Rau muống', price: 12000, description: 'Rau muống tươi xanh' },
      { name: 'Ớt chuông đỏ', price: 45000, description: 'Ớt chuông đỏ tươi ngon' },
      { name: 'Bông cải xanh', price: 30000, description: 'Bông cải xanh tươi ngon' },
      { name: 'Cà chua beef', price: 35000, description: 'Cà chua beef to, ngọt' }
    ]
    // ... (I'll continue with more categories in the implementation)
  };

  // Generate 10 products for each category
  categories.forEach((category, categoryIndex) => {
    const template = productTemplates[category.slug] || [];
    
    for (let i = 0; i < 10; i++) {
      const baseProduct = template[i] || {
        name: `Sản phẩm ${i + 1} - ${category.name}`,
        price: Math.floor(Math.random() * 200000) + 10000,
        description: `Sản phẩm chất lượng cao thuộc danh mục ${category.name}`
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
        image_url: getImageUrl(category.slug, i),
        is_featured: Math.random() > 0.8
      };
      
      products.push(product);
    }
  });
  
  return products;
}

// Generate all products
const products = generateProducts();

// Sample users
const users = [
  {
    full_name: 'Nguyễn Văn Admin',
    email: 'admin@supermarket.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'admin',
    phone: '0901234567'
  },
  {
    full_name: 'Trần Thị Lan',
    email: 'lan@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0987654321'
  },
  {
    full_name: 'Lê Minh Tuấn',
    email: 'tuan@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKhYKhKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0912345678'
  },
  {
    full_name: 'Phạm Thị Hoa',
    email: 'hoa@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0923456789'
  },
  {
    full_name: 'Hoàng Văn Nam',
    email: 'nam@gmail.com',
    password: '$2b$10$rOzJKKhYKhKhYKhKhYKhKOeJ8vKKhYKhKhYKhKhYKhKhYKhKhYKhK',
    role: 'customer',
    phone: '0934567890'
  }
];

// Generate sample reviews
function generateReviews() {
  const reviews = [];
  const reviewComments = [
    'Sản phẩm chất lượng tốt, đóng gói cẩn thận',
    'Giao hàng nhanh, sản phẩm đúng như mô tả',
    'Giá cả hợp lý, sẽ mua lại lần sau',
    'Chất lượng tuyệt vời, rất hài lòng',
    'Sản phẩm tươi ngon, đáng tiền',
    'Dịch vụ tốt, nhân viên thân thiện',
    'Đóng gói đẹp, phù hợp làm quà',
    'Sản phẩm đúng như hình ảnh',
    'Chất lượng ổn, giá hơi cao',
    'Rất hài lòng với sản phẩm này'
  ];
  
  // Generate reviews for random products
  for (let i = 0; i < 100; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
    
    reviews.push({
      product_name: randomProduct.name,
      user_email: randomUser.email,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
      comment: randomComment
    });
  }
  
  return reviews;
}

const reviews = generateReviews();

async function seedSupermarketData() {
  try {
    console.log('🌱 Starting supermarket data seeding...');
    console.log(`📊 Will seed: ${categories.length} categories, ${products.length} products, ${users.length} users, ${reviews.length} reviews`);

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

    // Insert products in batches
    console.log('🛍️ Inserting products...');
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, slug, description, price, category_id, 
        stock_quantity, image_url, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`  Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}...`);
      
      for (const product of batch) {
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
          product.image_url,
          product.is_featured ? 1 : 0
        );
      }
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

    console.log('✅ Supermarket data seeding completed successfully!');
    console.log(`📊 Final count: ${categories.length} categories, ${products.length} products, ${users.length} users, ${reviews.length} reviews`);

  } catch (error) {
    console.error('❌ Error seeding supermarket data:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedSupermarketData();
}

module.exports = { seedSupermarketData };