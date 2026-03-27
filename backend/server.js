const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

// Initialize database
const { initDatabase } = require('./config/database');
initDatabase();

// Initialize ElasticSearch (optional - will work without it)
const { initializeElasticSearch } = require('./config/elasticsearch');
initializeElasticSearch().catch(err => {
  console.log('⚠️ ElasticSearch not available, using basic search');
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const searchRoutes = require('./routes/search');
const recommendationRoutes = require('./routes/recommendations');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const addressesRoutes = require('./routes/addresses');

// Import advanced routes
const searchAdvancedRoutes = require('./routes/search-advanced');
const reviewsAdvancedRoutes = require('./routes/reviews-advanced');
const recommendationsAdvancedRoutes = require('./routes/recommendations-advanced');

// Import new routes
const elasticsearchRoutes = require('./routes/elasticsearch');
const couponsRoutes = require('./routes/coupons');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files (uploaded images)
app.use('/uploads', express.static('public/uploads'));

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session & Passport (for Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'ecommerce-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'E-commerce API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to E-commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      reviews: '/api/reviews',
      orders: '/api/orders',
      cart: '/api/cart',
      search: '/api/search',
      recommendations: '/api/recommendations'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressesRoutes);

// Advanced API Routes
app.use('/api/search-advanced', searchAdvancedRoutes);
app.use('/api/reviews-advanced', reviewsAdvancedRoutes);
app.use('/api/recommendations-advanced', recommendationsAdvancedRoutes);

// New API Routes
app.use('/api/elasticsearch', elasticsearchRoutes);
app.use('/api/coupons', couponsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;