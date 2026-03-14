# E-commerce Backend API

Backend API cho hệ thống E-commerce với ElasticSearch, Review và Recommendation System.

## 🚀 Tính năng

- **Authentication & Authorization** với Supabase Auth
- **Product Management** với CRUD operations
- **ElasticSearch Integration** cho tìm kiếm thông minh
- **Review System** với rating và upload hình ảnh
- **Recommendation Engine** dựa trên user behavior
- **Shopping Cart & Orders** management
- **Admin Dashboard** APIs

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Search:** ElasticSearch 8+
- **Authentication:** Supabase Auth + JWT
- **File Upload:** Cloudinary
- **Validation:** Joi

## 📦 Installation

### 1. Clone và cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

**Cần điền:**
- `SUPABASE_URL` và `SUPABASE_ANON_KEY` từ Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` (optional, cho admin operations)
- `JWT_SECRET` (random string)
- `ELASTICSEARCH_NODE` (http://localhost:9200)
- `CLOUDINARY_*` credentials (optional)

### 3. Setup Supabase Database

1. Tạo project mới trên [Supabase](https://supabase.com)
2. Vào Table Editor và tạo các bảng theo hướng dẫn trong `database/supabase-setup.md`
3. Hoặc copy/paste SQL từ file đó vào SQL Editor

### 4. Setup ElasticSearch

**Option 1: Docker (Khuyến nghị)**
```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0
```

**Option 2: Download & Install**
- Download từ: https://www.elastic.co/downloads/elasticsearch
- Unzip và chạy: `bin/elasticsearch`

### 5. Seed Database với data mẫu

```bash
npm run seed
```

### 6. Chạy server

```bash
# Development mode
npm run dev

# Production mode
npm start

# Test API endpoints
npm run test-api
```

Server sẽ chạy tại: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (có pagination, filter)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin only)

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy chi tiết danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin only)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin only)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin only)

### Search (ElasticSearch)
- `GET /api/search?q=keyword` - Tìm kiếm sản phẩm
- `GET /api/search/suggestions?q=key` - Gợi ý tìm kiếm
- `GET /api/search/popular` - Từ khóa phổ biến

### Reviews
- `GET /api/reviews/product/:productId` - Lấy reviews của sản phẩm
- `POST /api/reviews` - Tạo review mới (Customer only)
- `PUT /api/reviews/:id` - Cập nhật review (Owner only)
- `DELETE /api/reviews/:id` - Xóa review (Owner/Admin)

### Cart
- `GET /api/cart` - Lấy giỏ hàng (Customer only)
- `POST /api/cart` - Thêm vào giỏ hàng
- `PUT /api/cart/:id` - Cập nhật số lượng
- `DELETE /api/cart/:id` - Xóa khỏi giỏ hàng
- `DELETE /api/cart` - Xóa toàn bộ giỏ hàng
- `GET /api/cart/count` - Lấy số lượng items trong giỏ
- `POST /api/cart/bulk` - Thêm nhiều items cùng lúc

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin only)
- `DELETE /api/orders/:id` - Hủy đơn hàng (pending orders only)
- `GET /api/orders/stats/summary` - Thống kê đơn hàng (Admin only)

### Recommendations
- `GET /api/recommendations/similar/:productId` - Sản phẩm tương tự
- `GET /api/recommendations/for-user` - Gợi ý cho user (Customer only)
- `GET /api/recommendations/trending` - Sản phẩm trending
- `GET /api/recommendations/customers-also-bought/:productId` - Collaborative filtering
- `GET /api/recommendations/recently-viewed` - Sản phẩm đã xem gần đây
- `POST /api/recommendations/track-view` - Track view cho recommendations

## 🔧 API Usage Examples

### 1. Đăng ký user mới

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "phone": "0123456789"
  }'
```

### 2. Tìm kiếm sản phẩm

```bash
curl "http://localhost:5000/api/search?q=iphone&min_price=500&sort_by=price_asc"
```

### 3. Thêm vào giỏ hàng

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": "product-uuid-here",
    "quantity": 2
  }'
```

### 4. Tạo đơn hàng

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "product_id": "product-uuid",
        "quantity": 1,
        "price": 999.99
      }
    ],
    "shipping_address": {
      "full_name": "John Doe",
      "phone": "0123456789",
      "address_line_1": "123 Main St",
      "city": "Ho Chi Minh City",
      "state": "Ho Chi Minh",
      "postal_code": "70000"
    },
    "payment_method": "cod"
  }'
```

## 🗄️ Database Schema

Database được setup với các tables:
- `user_profiles` - Thông tin user mở rộng
- `categories` - Danh mục sản phẩm
- `products` - Sản phẩm
- `reviews` - Đánh giá sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `cart` - Giỏ hàng
- `user_activity` - Hoạt động user (cho recommendation)
- `addresses` - Địa chỉ giao hàng
- `search_analytics` - Thống kê tìm kiếm

Chi tiết schema xem trong `database/supabase-setup.md`

## 🔍 ElasticSearch Setup

API tự động tạo index `products` với mapping phù hợp cho:
- Full-text search
- Autocomplete/suggestions
- Faceted search (filter)
- Fuzzy search (chịu lỗi chính tả)

## 🚨 Error Handling

API trả về format lỗi chuẩn:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🔐 Authentication

API sử dụng JWT tokens từ Supabase Auth:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Testing

```bash
# Test tất cả endpoints
npm run test-api

# Chạy unit tests (nếu có)
npm test
```

## 🚀 Deployment

API có thể deploy lên:
- Railway
- Render
- Heroku
- Vercel (serverless functions)

## 📞 Troubleshooting

Nếu có vấn đề, check:

1. **Environment variables**: `.env` file có đúng không
2. **Supabase**: Database có connect được không
3. **ElasticSearch**: Có chạy không (http://localhost:9200)
4. **Logs**: Check console để debug
5. **Tables**: Đã tạo tables trong Supabase chưa
6. **Data**: Đã chạy `npm run seed` chưa

### Common Issues

**1. Supabase connection error**
```bash
# Check .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**2. ElasticSearch not available**
- API sẽ fallback về database search
- Start ElasticSearch: `docker start elasticsearch`

**3. No data found**
```bash
# Seed database
npm run seed
```

**4. Authentication errors**
- Check JWT token format
- Verify Supabase Auth setup

## 🎯 Next Steps

1. **Frontend Development**: Tạo React.js frontend
2. **Testing**: Viết unit tests và integration tests
3. **Performance**: Optimize database queries và caching
4. **Security**: Implement rate limiting và input sanitization
5. **Monitoring**: Add logging và error tracking

---

**Happy Coding! 🎉**