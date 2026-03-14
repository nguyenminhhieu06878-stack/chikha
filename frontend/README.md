# E-commerce Frontend

React.js frontend cho hệ thống E-commerce với ElasticSearch, Review và Recommendation System.

## 🚀 Tính năng

- **Responsive Design** - Hoạt động tốt trên desktop, tablet và mobile
- **Smart Search** - Tìm kiếm thông minh với autocomplete và suggestions
- **Product Catalog** - Hiển thị sản phẩm với filter và sort
- **Shopping Cart** - Quản lý giỏ hàng với real-time updates
- **User Authentication** - Đăng ký, đăng nhập với JWT
- **Order Management** - Đặt hàng và theo dõi đơn hàng
- **Product Reviews** - Xem và viết đánh giá sản phẩm
- **Recommendations** - Gợi ý sản phẩm cá nhân hóa
- **Admin Features** - Quản lý sản phẩm, đơn hàng (coming soon)

## 🛠️ Tech Stack

- **Framework:** React.js 18+
- **Styling:** Tailwind CSS
- **State Management:** Context API + React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📦 Installation

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Tạo file `.env` trong thư mục frontend:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# App Configuration
REACT_APP_NAME=E-Store
REACT_APP_VERSION=1.0.0
```

### 3. Chạy development server

```bash
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   └── Layout.js
│   │   ├── ProductCard.js
│   │   ├── SearchBar.js
│   │   ├── LoadingSpinner.js
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Products.js
│   │   ├── ProductDetail.js
│   │   ├── Search.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Profile.js
│   │   ├── Orders.js
│   │   └── NotFound.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🎨 UI Components

### Layout Components
- **Header**: Navigation với search bar, cart icon, user menu
- **Footer**: Links và thông tin công ty
- **Layout**: Wrapper component cho tất cả pages

### Product Components
- **ProductCard**: Hiển thị sản phẩm với hình ảnh, giá, rating
- **SearchBar**: Tìm kiếm với autocomplete
- **LoadingSpinner**: Loading indicator

### Form Components
- **ProtectedRoute**: Bảo vệ routes cần authentication

## 🔧 API Integration

Frontend kết nối với backend qua REST API:

```javascript
// API Base URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Example API calls
const products = await productsAPI.getProducts();
const searchResults = await searchAPI.search({ q: 'iphone' });
const cart = await cartAPI.getCart();
```

### API Endpoints được sử dụng:

- **Auth**: `/api/auth/*` - Authentication
- **Products**: `/api/products/*` - Product management
- **Search**: `/api/search/*` - ElasticSearch
- **Cart**: `/api/cart/*` - Shopping cart
- **Orders**: `/api/orders/*` - Order management
- **Reviews**: `/api/reviews/*` - Product reviews
- **Recommendations**: `/api/recommendations/*` - Product suggestions

## 🎯 Key Features

### 1. Smart Search
- Real-time search với debouncing
- Autocomplete suggestions
- Advanced filters (category, price, rating)
- Sort options (relevance, price, rating, date)

### 2. Shopping Experience
- Product catalog với pagination
- Product detail với image gallery
- Add to cart với quantity selection
- Shopping cart management
- Secure checkout process

### 3. User Management
- User registration và login
- Profile management
- Order history
- Protected routes

### 4. Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔐 Authentication

Frontend sử dụng JWT tokens cho authentication:

```javascript
// Token được lưu trong localStorage
const token = localStorage.getItem('token');

// Tự động thêm vào headers
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Auto redirect khi token expired
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## 📱 Responsive Design

Sử dụng Tailwind CSS breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

```css
/* Example responsive classes */
.product-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}
```

## 🎨 Styling

### Tailwind CSS Configuration
- Custom color palette
- Extended spacing và typography
- Custom components và utilities
- Dark mode support (future)

### Component Styles
```css
/* Button variants */
.btn-primary { @apply bg-primary-600 text-white hover:bg-primary-700; }
.btn-secondary { @apply bg-gray-100 text-gray-900 hover:bg-gray-200; }
.btn-outline { @apply border border-gray-300 bg-white hover:bg-gray-50; }

/* Form inputs */
.input { @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500; }

/* Cards */
.card { @apply bg-white rounded-lg border border-gray-200 shadow-sm; }
```

## 🚀 Build & Deploy

### Development
```bash
npm start          # Start dev server
npm run build      # Build for production
npm test           # Run tests
```

### Production Build
```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/`

### Deployment Options
- **Vercel**: Automatic deployment từ GitHub
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: CDN deployment
- **Docker**: Container deployment

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📈 Performance

### Optimizations
- Code splitting với React.lazy()
- Image optimization với lazy loading
- API caching với React Query
- Debounced search inputs
- Memoized components với React.memo()

### Bundle Analysis
```bash
npm run build
npx serve -s build
```

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# App Configuration  
REACT_APP_NAME=E-Store
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PWA=false
```

### Proxy Configuration
Development server tự động proxy API calls tới backend:

```json
{
  "proxy": "http://localhost:3001"
}
```

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**
```bash
# Check backend server
curl http://localhost:3001/health

# Check proxy configuration
# Verify REACT_APP_API_URL in .env
```

**2. Build Errors**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

**3. Styling Issues**
```bash
# Rebuild Tailwind CSS
npm run build:css

# Check for conflicting styles
# Verify Tailwind config
```

## 🚀 Next Steps

### Planned Features
- [ ] Admin Dashboard
- [ ] Product Reviews với images
- [ ] Wishlist functionality
- [ ] Advanced filtering
- [ ] PWA support
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Real-time notifications

### Performance Improvements
- [ ] Image optimization
- [ ] Bundle splitting
- [ ] Service Worker caching
- [ ] CDN integration

---

**Happy Coding! 🎉**