# 🛒 E-commerce System với ElasticSearch, Review & Recommendation

Hệ thống E-commerce hoàn chỉnh được xây dựng với Node.js, React.js, ElasticSearch và Supabase.

## 🎯 Tổng quan dự án

Đây là đồ án tốt nghiệp xây dựng hệ thống thương mại điện tử với 3 tính năng chính:
- **ElasticSearch**: Tìm kiếm thông minh và nhanh chóng
- **Review System**: Đánh giá sản phẩm từ khách hàng thực tế  
- **Recommendation Engine**: Gợi ý sản phẩm cá nhân hóa

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React.js      │◄──►│   Node.js       │◄──►│   Supabase      │
│   Tailwind CSS  │    │   Express.js    │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  ElasticSearch  │
                       │   (Search)      │
                       └─────────────────┘
```

## 📁 Cấu trúc dự án

```
ecommerce-project/
├── backend/                 # Node.js API Server
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication, validation
│   ├── config/            # Database, ElasticSearch config
│   └── database/          # Schema, seeding
├── frontend/              # React.js Web App
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # State management
│   │   └── services/      # API calls
└── docs/                  # Documentation
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Điền thông tin Supabase vào .env
npm run seed
npm run dev
```

### 2. Frontend Setup  
```bash
cd frontend
npm install
npm start
```

### 3. Truy cập ứng dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## ✨ Tính năng chính

### 🔍 Smart Search (ElasticSearch)
- Tìm kiếm full-text nhanh chóng
- Auto-complete và suggestions
- Fuzzy search (chịu lỗi chính tả)
- Filter nâng cao (giá, rating, category)
- Sort theo relevance, giá, rating

### ⭐ Review System
- Đánh giá 1-5 sao với comment
- Upload hình ảnh review
- Chỉ khách đã mua mới được review
- Tính rating trung bình tự động
- Admin có thể quản lý reviews

### 🎯 Recommendation Engine
- **Content-based**: Sản phẩm tương tự
- **Collaborative filtering**: "Khách cũng mua"
- **Personalized**: Dựa trên lịch sử user
- **Trending**: Sản phẩm hot nhất

### 🛍️ E-commerce Core
- Catalog sản phẩm với pagination
- Shopping cart real-time
- Checkout và order management
- User authentication (JWT)
- Admin dashboard (basic)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Search**: ElasticSearch 8+
- **Auth**: Supabase Auth + JWT
- **Validation**: Joi
- **File Upload**: Cloudinary

### Frontend  
- **Framework**: React.js 18+
- **Styling**: Tailwind CSS
- **State**: Context API + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP**: Axios

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Search**: ElasticSearch (Docker)
- **Storage**: Cloudinary (images)
- **Deployment**: Local development

## 📊 Database Schema

### Core Tables
- `user_profiles` - Thông tin người dùng
- `categories` - Danh mục sản phẩm  
- `products` - Sản phẩm
- `reviews` - Đánh giá sản phẩm
- `orders` & `order_items` - Đơn hàng
- `cart` - Giỏ hàng
- `user_activity` - Hoạt động (cho recommendation)

## 🔧 Development

### Prerequisites
- Node.js 18+
- Docker (cho ElasticSearch)
- Supabase account

### Environment Setup
1. Tạo Supabase project
2. Setup ElasticSearch (Docker)
3. Configure environment variables
4. Run database migrations
5. Seed sample data

### API Documentation
- Health check: `GET /health`
- Products: `GET /api/products`
- Search: `GET /api/search?q=keyword`
- Cart: `GET /api/cart`
- Orders: `POST /api/orders`

Chi tiết API docs trong `backend/README.md`

## 📱 Screenshots & Demo

### Homepage
- Hero section với search bar
- Featured products
- Category navigation
- Trending products

### Product Catalog
- Grid/List view toggle
- Advanced filtering
- Sort options
- Pagination

### Product Detail
- Image gallery
- Product info & specs
- Reviews section
- Similar products
- Add to cart

### Shopping Cart
- Item management
- Quantity updates
- Price calculations
- Checkout flow

## 🧪 Testing

```bash
# Backend API testing
cd backend
npm run test-api

# Frontend testing  
cd frontend
npm test
```

## 🚀 Deployment

### Development
- Backend: `npm run dev` (port 3001)
- Frontend: `npm start` (port 3000)
- ElasticSearch: Docker container (port 9200)

### Production (Future)
- Backend: Railway/Render
- Frontend: Vercel/Netlify
- Database: Supabase
- Search: Elastic Cloud

## 📈 Performance

### Backend Optimizations
- Database indexing
- API response caching
- ElasticSearch for fast search
- Pagination for large datasets

### Frontend Optimizations  
- Code splitting
- Image lazy loading
- API caching (React Query)
- Debounced search

## 🔐 Security

- JWT authentication
- Row Level Security (Supabase)
- Input validation (Joi)
- CORS configuration
- Rate limiting (future)

## 📚 Documentation

- [Backend API](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Database Setup](./backend/database/supabase-setup.md)
- [Deployment Guide](./backend/SETUP_GUIDE.md)

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Đồ án tốt nghiệp** - Hệ thống E-commerce với ElasticSearch, Review và Recommendation

---

**🎉 Happy Coding!**