const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware kiểm tra admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
    return res.status(403).json({ error: 'Access denied. Admin required.' });
  }
  next();
};

// Dashboard overview
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Thống kê tổng quan
    const { data: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const { data: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact' });

    const { data: totalOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact' });

    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    // Đơn hàng theo tháng (6 tháng gần nhất)
    const { data: monthlyOrders } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

    // Sản phẩm bán chạy
    const { data: topProducts } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products (name, image_url, price)
      `)
      .limit(10);

    // Đơn hàng gần đây
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        users (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers?.length || 0,
          totalProducts: totalProducts?.length || 0,
          totalOrders: totalOrders?.length || 0,
          totalRevenue
        },
        monthlyOrders,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quản lý users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật role user
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'sales_staff', 'sales_manager', 'warehouse_staff', 'accountant', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Báo cáo doanh số
router.get('/reports/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let query = supabase
      .from('orders')
      .select('created_at, total_amount, status');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at');

    if (error) throw error;

    // Group data theo ngày/tháng/năm
    const groupedData = {};
    data.forEach(order => {
      let key;
      const date = new Date(order.created_at);
      
      switch (groupBy) {
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default: // day
          key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = { revenue: 0, orders: 0, completed: 0 };
      }

      groupedData[key].orders++;
      if (order.status === 'completed') {
        groupedData[key].revenue += parseFloat(order.total_amount);
        groupedData[key].completed++;
      }
    });

    res.json({ success: true, data: groupedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quản lý inventory
router.get('/inventory', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, price, category_id, categories(name)')
      .order('stock_quantity', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật stock
router.put('/inventory/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity, note } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock_quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log inventory change
    await supabase
      .from('inventory_logs')
      .insert({
        product_id: id,
        change_type: 'manual_update',
        quantity_change: stock_quantity,
        note,
        user_id: req.user.id
      });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;