import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to format price
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Advanced Search API
export const searchAdvancedAPI = {
  autocomplete: (query) => 
    api.get('/search-advanced/autocomplete', { params: { q: query } }),
  advancedSearch: (params = {}) => 
    api.get('/search-advanced/advanced', { params }),
  getAnalytics: (params = {}) => 
    api.get('/search-advanced/analytics', { params }),
  getPopularSearches: () => api.get('/search-advanced/popular'),
  getTrendingSearches: () => api.get('/search-advanced/trending'),
};

// Advanced Reviews API
export const reviewsAdvancedAPI = {
  getProductReviews: (productId, params = {}) => 
    api.get(`/reviews-advanced/product/${productId}`, { params }),
  createReviewWithImages: (formData) => 
    api.post('/reviews-advanced', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  markHelpful: (reviewId, helpful) => 
    api.post(`/reviews-advanced/${reviewId}/helpful`, { helpful }),
  reportReview: (reviewId, data) => 
    api.post(`/reviews-advanced/${reviewId}/report`, data),
  // Admin endpoints
  getPendingReviews: (params = {}) => 
    api.get('/reviews-advanced/admin/pending', { params }),
  moderateReview: (reviewId, data) => 
    api.put(`/reviews-advanced/admin/${reviewId}/moderate`, data),
};

// Advanced Recommendations API
export const recommendationsAdvancedAPI = {
  getPersonalized: (params = {}) => 
    api.get('/recommendations-advanced/personalized', { params }),
  getSimilar: (productId, params = {}) => 
    api.get(`/recommendations-advanced/similar/${productId}`, { params }),
  getAlsoBought: (productId, params = {}) => 
    api.get(`/recommendations-advanced/also-bought/${productId}`, { params }),
  getTrending: (params = {}) => 
    api.get('/recommendations-advanced/trending', { params }),
  getHomepage: () => api.get('/recommendations-advanced/homepage'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => 
    api.put(`/admin/users/${userId}/role`, { role }),
  getSalesReport: (params = {}) => 
    api.get('/admin/reports/sales', { params }),
  getInventory: () => api.get('/admin/inventory'),
  updateStock: (productId, data) => 
    api.put(`/admin/inventory/${productId}/stock`, data),
};

export default api;