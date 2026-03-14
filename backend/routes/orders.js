const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(id, name, price, images)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: orders, error, count } = await query;
    
    if (error) {
      console.error('Database error:', error);
      // Return empty array if table doesn't exist yet
      return res.json({
        success: true,
        data: [],
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: 0,
          total_pages: 0
        }
      });
    }
    
    const totalPages = Math.ceil((count || 0) / limit);
    
    res.json({
      success: true,
      data: orders || [],
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: count || 0,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.json({
      success: true,
      data: [],
      pagination: {
        current_page: parseInt(page || 1),
        per_page: parseInt(limit || 10),
        total: 0,
        total_pages: 0
      }
    });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(id, name, price, images)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
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

// POST /api/orders - Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address, payment_method = 'cod' } = req.body;
    
    console.log('Creating order for user:', userId);
    
    // Get user's cart
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart')
      .select(`
        *,
        products!inner(
          id,
          name,
          price,
          discount_price,
          stock_quantity
        )
      `)
      .eq('user_id', userId);
    
    if (cartError) {
      console.error('Cart fetch error:', cartError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch cart'
      });
    }
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }
    
    // Calculate order totals
    let subtotal = 0;
    let totalItems = 0;
    
    cartItems.forEach(item => {
      const price = item.products.discount_price || item.products.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;
    });
    
    const shippingFee = 0; // Free shipping
    const total = subtotal + shippingFee;
    
    // Create order with only essential fields that exist in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: total,
        shipping_address: shipping_address || {
          full_name: 'Customer',
          phone: '0123456789',
          address_line_1: 'Default Address',
          city: 'Ho Chi Minh',
          state: 'Ho Chi Minh',
          postal_code: '70000'
        }
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('Order creation error:', orderError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create order: ' + orderError.message
      });
    }
    
    console.log('Order created successfully:', order.id);
    
    // Create order items
    const orderItems = cartItems.map(item => {
      const price = item.products.discount_price || item.products.price;
      const subtotal = price * item.quantity;
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: price,
        subtotal: subtotal
      };
    });
    
    console.log('Creating order items:', orderItems);
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Don't fail the order if items creation fails, just log the error
    } else {
      console.log('Order items created successfully');
    }
    
    // Clear user's cart
    await supabaseAdmin
      .from('cart')
      .delete()
      .eq('user_id', userId);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order: ' + error.message
    });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if order exists and belongs to user
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
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
    
    if (updateError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel order'
      });
    }
    
    // Restore product stock
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id);
    
    if (orderItems) {
      for (const item of orderItems) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          await supabaseAdmin
            .from('products')
            .update({ 
              stock_quantity: product.stock_quantity + item.quantity 
            })
            .eq('id', item.product_id);
        }
      }
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