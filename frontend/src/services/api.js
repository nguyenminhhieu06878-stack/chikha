import axios from 'axios';
import { PLACEHOLDER_IMAGES } from '../utils/placeholder';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getSuggestions: (query) => api.get('/search/suggest', { params: { q: query } }),
  getPopularTerms: () => api.get('/search/popular'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (id, data) => api.put(`/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
  getCartCount: () => api.get('/cart/count'),
  bulkAddToCart: (items) => api.post('/cart/bulk', { items }),
};

// Orders API
export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  getOrderStats: (params) => api.get('/orders/stats/summary', { params }),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
};

// Recommendations API
export const recommendationsAPI = {
  getSimilarProducts: (productId, params) => api.get(`/recommendations/similar/${productId}`, { params }),
  getPersonalizedRecommendations: (params) => api.get('/recommendations/for-user', { params }),
  getTrendingProducts: (params) => api.get('/recommendations/trending', { params }),
  getCustomersAlsoBought: (productId, params) => api.get(`/recommendations/customers-also-bought/${productId}`, { params }),
  getRecentlyViewed: (params) => api.get('/recommendations/recently-viewed', { params }),
  trackView: (productId) => api.post('/recommendations/track-view', { product_id: productId }),
};

// Addresses API
export const addressesAPI = {
  getAddresses: () => api.get('/addresses'),
  getAddress: (id) => api.get(`/addresses/${id}`),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/addresses/${id}/default`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist', { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
};

// Utility functions
// Helper function to get product image URL (handles both SQLite and Supabase formats)
export const getProductImageUrl = (product, placeholder = PLACEHOLDER_IMAGES.product) => {
  if (!product) return placeholder;
  // SQLite returns image_url (string), Supabase returns images (array)
  return product.image_url || product.images?.[0] || placeholder;
};

export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Admin API
export const adminAPI = {
  getDashboard: (timeRange) => {
    if (timeRange && timeRange !== '7d') {
      return api.get(`/admin/dashboard/${timeRange}`);
    }
    return api.get('/admin/dashboard');
  },
  getSalesReport: (params) => api.get('/admin/reports/sales', { params }),
  getInventory: () => api.get('/admin/inventory'),
  updateStock: (productId, data) => api.put(`/admin/inventory/${productId}/stock`, data),
  
  // Admin Products
  getProducts: (params) => api.get('/admin/products', { params }),
  
  // Admin Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderDetail: (orderId) => api.get(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId, data) => api.put(`/admin/orders/${orderId}/status`, data),
  
  // Admin Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  
  // Admin Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }),
  updateReviewStatus: (reviewId, status) => api.put(`/admin/reviews/${reviewId}/status`, { status }),
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
  
  // Admin Analytics
  analytics: () => api.get('/admin/analytics'),
  
  // Admin Categories
  getCategories: (params) => api.get('/admin/categories', { params }),
  getCategory: (categoryId) => api.get(`/admin/categories/${categoryId}`),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/admin/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
};

export default api;