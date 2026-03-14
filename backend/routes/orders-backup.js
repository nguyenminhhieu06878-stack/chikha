const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Validation schemas
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required(),
  shipping_address: Joi.object({
    full_name: Joi.string().required(),
    phone: Joi.string().required(),
    address_line_1: Joi.string().required(),
    address_line_2: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
    country: Joi.string().default('Vietnam')
  }).required(),
  payment_method: Joi.string().valid('cod', 'bank_transfer', 'credit_card').default('cod'),
  notes: Joi.string().allow('')
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  notes: Joi.string().allow('')
});

// GET /api/orders - Get orders (customer: own orders, admin: all orders)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = supabaseAdminAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, images, price)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // If not admin, only show user's own orders
    if (userRole !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    
    const { data: orders, error } = await query;
    
    if (error) throw error;
    
    // Get total count for pagination
    let countQuery = supabaseAdminAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (userRole !== 'admin') {
      countQuery = countQuery.eq('user_id', userId);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (start_date) {
      countQuery = countQuery.gte('created_at', start_date);
    }
    
    if (end_date) {
      countQuery = countQuery.lte('created_at', end_date);
    }
    
    const { count } = await countQuery;
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, images, price, description)
        ),
        user_profiles!inner(full_name, email, phone)
      `)
      .eq('id', id)
      .single();
    
    // If not admin, only allow access to own orders
    if (userRole !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data: order, error } = await query;
    
    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// POST /api/orders - Create a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { items, shipping_address, payment_method, notes } = value;
    const userId = req.user.id;
    
    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, name, price, stock_quantity')
        .eq('id', item.product_id)
        .single();
      
      if (productError || !product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product_id} not found`
        });
      }
      
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
        });
      }
      
      // Verify price (prevent price manipulation)
      if (Math.abs(item.price - product.price) > 0.01) {
        return res.status(400).json({
          success: false,
          error: `Price mismatch for product ${product.name}`
        });
      }
      
      const subtotal = item.quantity * item.price;
      totalAmount += subtotal;
      
      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal
      });
    }
    
    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        shipping_address,
        payment_method,
        notes: notes || null
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items
    const orderItemsData = validatedItems.map(item => ({
      order_id: order.id,
      ...item
    }));
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);
    
    if (itemsError) throw itemsError;
    
    // Update product stock quantities
    for (const item of validatedItems) {
      const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({
          stock_quantity: supabase.raw(`stock_quantity - ${item.quantity}`)
        })
        .eq('id', item.product_id);
      
      if (stockError) {
        console.error('Stock update error:', stockError);
      }
    }
    
    // Clear user's cart
    await supabaseAdmin
      .from('cart')
      .delete()
      .eq('user_id', userId);
    
    // Record user activity for recommendations
    for (const item of validatedItems) {
      await supabaseAdmin
        .from('user_activity')
        .insert({
          user_id: userId,
          product_id: item.product_id,
          action_type: 'purchase',
          metadata: { order_id: order.id, quantity: item.quantity }
        });
    }
    
    // Fetch complete order data
    const { data: completeOrder } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, images, price)
        )
      `)
      .eq('id', order.id)
      .single();
    
    res.status(201).json({
      success: true,
      data: completeOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const { error, value } = updateOrderStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { status, notes } = value;
    
    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Validate status transition
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };
    
    if (!validTransitions[existingOrder.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from ${existingOrder.status} to ${status}`
      });
    }
    
    // Update order status
    const updateData = { status };
    if (notes) {
      updateData.admin_notes = notes;
    }
    
    const { data: order, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        order_items(
          *,
          products(name, images, price)
        ),
        user_profiles!inner(full_name, email, phone)
      `)
      .single();
    
    if (updateError) throw updateError;
    
    // If order is cancelled, restore product stock
    if (status === 'cancelled') {
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', id);
      
      for (const item of orderItems || []) {
        await supabaseAdmin
          .from('products')
          .update({
            stock_quantity: supabase.raw(`stock_quantity + ${item.quantity}`)
          })
          .eq('id', item.product_id);
      }
    }
    
    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// GET /api/orders/stats/summary - Get order statistics (admin only)
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = supabaseAdmin.from('orders').select('*');
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    
    const { data: orders, error } = await query;
    
    if (error) throw error;
    
    // Calculate statistics
    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      status_breakdown: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      },
      average_order_value: 0
    };
    
    orders.forEach(order => {
      if (stats.status_breakdown.hasOwnProperty(order.status)) {
        stats.status_breakdown[order.status]++;
      }
    });
    
    if (stats.total_orders > 0) {
      stats.average_order_value = stats.total_revenue / stats.total_orders;
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
});

// DELETE /api/orders/:id - Cancel order (customer can cancel pending orders)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get order
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (userRole !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data: order, error: fetchError } = await query;
    
    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending orders can be cancelled'
      });
    }
    
    // Update order status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    // Restore product stock
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id);
    
    for (const item of orderItems || []) {
      await supabaseAdmin
        .from('products')
        .update({
          stock_quantity: supabase.raw(`stock_quantity + ${item.quantity}`)
        })
        .eq('id', item.product_id);
    }
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
});

module.exports = router;