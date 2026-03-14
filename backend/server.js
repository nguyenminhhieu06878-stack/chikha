const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

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

// Import advanced routes
const searchAdvancedRoutes = require('./routes/search-advanced');
const reviewsAdvancedRoutes = require('./routes/reviews-advanced');
const recommendationsAdvancedRoutes = require('./routes/recommendations-advanced');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Advanced API Routes
app.use('/api/search-advanced', searchAdvancedRoutes);
app.use('/api/reviews-advanced', reviewsAdvancedRoutes);
app.use('/api/recommendations-advanced', recommendationsAdvancedRoutes);

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