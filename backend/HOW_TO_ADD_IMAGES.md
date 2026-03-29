# Hướng Dẫn Thêm Hình Ảnh

## Cách Sử Dụng

### 1. Thêm hình ảnh cho danh mục
```bash
cd backend
npm run seed-category-images
```

### 2. Thêm hình ảnh cho sản phẩm
```bash
npm run seed-product-images
```

### 3. Thêm tất cả hình ảnh (danh mục + sản phẩm)
```bash
npm run seed-all-images
```

## Kết Quả

- ✅ Tất cả danh mục sẽ có hình ảnh từ Unsplash
- ✅ Tất cả sản phẩm sẽ có hình ảnh phù hợp với danh mục
- ✅ Hình ảnh chất lượng cao (500px width)

## Kiểm Tra

```bash
sqlite3 database/ecommerce.db
```

```sql
-- Xem hình ảnh danh mục
SELECT name, image_url FROM categories LIMIT 5;

-- Xem hình ảnh sản phẩm
SELECT name, image_url FROM products LIMIT 10;
```

## Tùy Chỉnh

### Thêm hình cho danh mục mới
Chỉnh sửa `seed-category-images.js`:
```javascript
const categoryImages = {
  'your-slug': 'https://images.unsplash.com/photo-xxxxx?w=500',
  // ...
};
```

### Thêm hình cho loại sản phẩm mới
Chỉnh sửa `seed-supermarket-images.js`:
```javascript
const imageMap = {
  'your-category-slug': [
    'https://images.unsplash.com/photo-xxxxx?w=500',
    // ...
  ]
};
```

## Lưu Ý

- Hình ảnh từ Unsplash miễn phí cho mục đích thương mại
- Script sẽ ghi đè hình ảnh cũ
- Đảm bảo database không bị lock khi chạy script
