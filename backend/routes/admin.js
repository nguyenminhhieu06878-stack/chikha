const express = require('express');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Dashboard overview (original route)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get statistics
    const totalUsersResult = db.prepare('SELECT COUNT(*) as total FROM users').get();
    console.log('Total users from DB:', totalUsersResult);
    const totalProductsResult = db.prepare('SELECT COUNT(*) as total FROM products').get();
    const totalOrdersResult = db.prepare('SELECT COUNT(*) as total FROM orders').get();
    const totalRevenueResult = db.prepare("SELECT SUM(total_amount) as revenue FROM orders WHERE status IN ('delivered', 'shipped')").get();

    // Get recent orders count
    const recentOrdersResult = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at >= datetime('now', '-7 days')
    `).get();

    // Calculate conversion rate
    const conversionRate = totalUsersResult.total > 0 ? 
      ((totalOrdersResult.total / totalUsersResult.total) * 100).toFixed(1) : 0;

    // Prevent caching
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsersResult.total || 0,
          totalProducts: totalProductsResult.total || 0,
          totalOrders: totalOrdersResult.total || 0,
          totalRevenue: totalRevenueResult.revenue || 0,
          recentOrders: recentOrdersResult.count || 0,
          conversionRate: parseFloat(conversionRate)
        }
      }
    });
    
    console.log('Dashboard response sent:', {
      totalUsers: totalUsersResult.total,
      totalProducts: totalProductsResult.total,
      totalOrders: totalOrdersResult.total,
      totalRevenue: totalRevenueResult.revenue
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Dashboard with time range stats
router.get('/dashboard/:timeRange', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { timeRange } = req.params;
    
    // Get basic statistics
    const totalUsersResult = db.prepare('SELECT COUNT(*) as total FROM users').get();
    const totalProductsResult = db.prepare('SELECT COUNT(*) as total FROM products').get();
    const totalOrdersResult = db.prepare('SELECT COUNT(*) as total FROM orders').get();
    const totalRevenueResult = db.prepare("SELECT SUM(total_amount) as revenue FROM orders WHERE status IN ('delivered', 'shipped')").get();

    // Calculate date range for time-specific stats
    let dateCondition = '';
    let days = 7;
    
    switch (timeRange) {
      case '1d':
        dateCondition = "AND created_at >= datetime('now', '-1 day')";
        days = 1;
        break;
      case '7d':
        dateCondition = "AND created_at >= datetime('now', '-7 days')";
        days = 7;
        break;
      case '30d':
        dateCondition = "AND created_at >= datetime('now', '-30 days')";
        days = 30;
        break;
      case '3m':
        dateCondition = "AND created_at >= datetime('now', '-90 days')";
        days = 90;
        break;
    }

    // Get time-range specific stats
    const rangeRevenueResult = db.prepare(`
      SELECT SUM(total_amount) as revenue, COUNT(*) as orders
      FROM orders 
      WHERE status IN ('delivered', 'shipped') ${dateCondition}
    `).get();

    const rangeUsersResult = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= datetime('now', '-${days} days')
    `).get();

    // Calculate conversion rate
    const conversionRate = totalUsersResult.total > 0 ? 
      ((totalOrdersResult.total / totalUsersResult.total) * 100).toFixed(1) : 0;

    // Prevent caching
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsersResult.total || 0,
          totalProducts: totalProductsResult.total || 0,
          totalOrders: totalOrdersResult.total || 0,
          totalRevenue: totalRevenueResult.revenue || 0,
          recentOrders: rangeRevenueResult.orders || 0,
          recentRevenue: rangeRevenueResult.revenue || 0,
          recentUsers: rangeUsersResult.count || 0,
          conversionRate: parseFloat(conversionRate),
          timeRange: timeRange
        }
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Products Management
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    if (category && category !== 'all') {
      query += ` AND p.category_id = ?`;
      params.push(category);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const products = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ` AND name LIKE ?`;
      countParams.push(`%${search}%`);
    }

    if (category && category !== 'all') {
      countQuery += ` AND category_id = ?`;
      countParams.push(category);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: products,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Orders Management
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.full_name as user_name, u.email as user_email
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const orders = db.prepare(query).all(...params);

    // Get order items for each order
    orders.forEach(order => {
      order.order_items = db.prepare(`
        SELECT oi.*, p.name as product_name, p.price
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id);
    });

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];

    if (status && status !== 'all') {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit)
      },
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Get Single Order
router.get('/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order with user info
    const order = db.prepare(`
      SELECT o.*, u.full_name, u.email, u.phone
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Get order items with product info
    const orderItems = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(id);

    // Get shipping address if exists
    let shippingAddress = null;
    if (order.shipping_address_id) {
      shippingAddress = db.prepare(`
        SELECT * FROM addresses WHERE id = ?
      `).get(order.shipping_address_id);
    }

    // Structure the response
    const orderDetail = {
      ...order,
      users: {
        full_name: order.full_name,
        email: order.email,
        phone: order.phone
      },
      order_items: orderItems.map(item => ({
        ...item,
        products: {
          name: item.name,
          image_url: item.image_url
        }
      })),
      shipping_address: shippingAddress
    };

    res.json({
      success: true,
      data: orderDetail
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Update Order Status
router.put('/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Users Management
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, full_name, phone, role, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      query += ` AND role = ?`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const users = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ` AND (full_name LIKE ? OR email LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: users,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Get Single User
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, email, full_name, phone, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user statistics
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE user_id = ?) as total_orders,
        (SELECT SUM(total_amount) FROM orders WHERE user_id = ? AND status = 'delivered') as total_spent,
        (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as total_reviews
    `).get(id, id, id);

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          total_orders: stats.total_orders || 0,
          total_spent: stats.total_spent || 0,
          total_reviews: stats.total_reviews || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Create User
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, full_name, phone, role = 'customer', password } = req.body;

    // Validate required fields
    if (!email || !full_name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, full name, and password are required'
      });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const insert = db.prepare(`
      INSERT INTO users (email, password, full_name, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(email, hashedPassword, full_name, phone || '', role);

    const user = db.prepare(`
      SELECT id, email, full_name, phone, role, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Update User
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, phone, role } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is taken by another user
    if (email) {
      const emailTaken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Update user
    const update = db.prepare(`
      UPDATE users 
      SET email = COALESCE(?, email),
          full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          role = COALESCE(?, role),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(email, full_name, phone, role, id);

    const user = db.prepare(`
      SELECT id, email, full_name, phone, role, created_at, updated_at
      FROM users WHERE id = ?
    `).get(id);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Delete User
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = db.prepare('SELECT id, role FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deleting admin users (optional safety check)
    if (existingUser.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin users'
      });
    }

    // Delete user (cascade will handle related records)
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Update User Role
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin or customer'
      });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update role
    db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);

    const user = db.prepare(`
      SELECT id, email, full_name, phone, role, created_at, updated_at
      FROM users WHERE id = ?
    `).get(id);

    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Reviews Management
router.get('/reviews', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.full_name as user_name, p.name as product_name, p.image_url
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const reviews = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE 1=1';
    const countParams = [];

    if (status && status !== 'all') {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin reviews error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Update Review Status
router.put('/reviews/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'flagged'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);

    const review = db.prepare(`
      SELECT r.*, u.full_name as user_name, p.name as product_name, p.image_url
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN products p ON r.product_id = p.id
      WHERE r.id = ?
    `).get(id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Delete Review
router.delete('/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Analytics
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Revenue by month
    const revenueByMonth = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE status IN ('delivered', 'shipped')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();

    // Top products
    const topProducts = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.image_url,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('delivered', 'shipped')
      GROUP BY p.id, p.name, p.image_url, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `).all();

    // Popular searches
    const popularSearches = db.prepare(`
      SELECT query, COUNT(*) as count
      FROM search_analytics
      GROUP BY query
      ORDER BY count DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      data: {
        revenueByMonth,
        topProducts,
        popularSearches
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Sales Report
router.get('/reports/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%W';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    let query = `
      SELECT 
        strftime('${dateFormat}', created_at) as period,
        SUM(total_amount) as revenue,
        COUNT(*) as order_count,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status IN ('delivered', 'shipped')
    `;
    
    const params = [];
    
    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      query += ` AND created_at <= ?`;
      params.push(endDate);
    }
    
    query += ` GROUP BY period ORDER BY period DESC`;
    
    const salesData = db.prepare(query).all(...params);

    // Get totals
    let totalQuery = `
      SELECT 
        SUM(total_amount) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE status IN ('delivered', 'shipped')
    `;
    
    const totalParams = [];
    
    if (startDate) {
      totalQuery += ` AND created_at >= ?`;
      totalParams.push(startDate);
    }
    
    if (endDate) {
      totalQuery += ` AND created_at <= ?`;
      totalParams.push(endDate);
    }
    
    const totals = db.prepare(totalQuery).get(...totalParams);

    res.json({
      success: true,
      data: {
        salesData,
        totals: {
          total_revenue: totals.total_revenue || 0,
          total_orders: totals.total_orders || 0,
          avg_order_value: totals.avg_order_value || 0
        }
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Analytics
router.get('/search-analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get top searches
    const topSearches = db.prepare(`
      SELECT 
        query,
        COUNT(*) as search_count,
        AVG(results_count) as avg_results
      FROM search_analytics
      GROUP BY query
      ORDER BY search_count DESC
      LIMIT 20
    `).all();

    // Get recent searches
    const recentSearches = db.prepare(`
      SELECT query, results_count, created_at
      FROM search_analytics
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    // Get stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_searches,
        COUNT(DISTINCT query) as unique_queries,
        AVG(results_count) as avg_results
      FROM search_analytics
    `).get();

    res.json({
      success: true,
      data: {
        top_searches: topSearches,
        recent_searches: recentSearches,
        stats
      }
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Categories Management
router.get('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND c.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const categories = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM categories WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ` AND name LIKE ?`;
      countParams.push(`%${search}%`);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: categories,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Get Single Category
router.get('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const category = db.prepare(`
      SELECT c.*, 
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Create Category
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingCategory = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Create category
    const insert = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(name, slug, description || '', image_url || '');

    const category = db.prepare(`
      SELECT * FROM categories WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Update Category
router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    // Check if category exists
    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    let slug = existingCategory.slug;
    
    // If name is being updated, generate new slug
    if (name && name !== existingCategory.name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if new slug already exists
      const slugTaken = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, id);
      if (slugTaken) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }

    // Update category
    const update = db.prepare(`
      UPDATE categories 
      SET name = COALESCE(?, name),
          slug = ?,
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(name, slug, description, image_url, id);

    const category = db.prepare(`
      SELECT c.*, 
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(id);

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Delete Category
router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id);
    if (productCount.count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It has ${productCount.count} products. Please move or delete the products first.`
      });
    }

    // Delete category
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;