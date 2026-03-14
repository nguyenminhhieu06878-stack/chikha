const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Validation schemas
const addToCartSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(99).required()
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required()
});

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart')
      .select(`
        *,
        products!inner(
          id,
          name,
          price,
          discount_price,
          images,
          stock_quantity,
          categories(name)
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    
    if (error) throw error;
    
    // Calculate cart summary
    let totalItems = 0;
    let subtotal = 0;
    let totalDiscount = 0;
    
    const validCartItems = cartItems.filter(item => {
      // Check if product still exists and has stock
      if (!item.products || item.products.stock_quantity < item.quantity) {
        // Remove invalid items from cart
        supabase
          .from('cart')
          .delete()
          .eq('id', item.id)
          .then(() => console.log(`Removed invalid cart item: ${item.id}`));
        return false;
      }
      
      totalItems += item.quantity;
      const price = item.products.discount_price || item.products.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      if (item.products.discount_price) {
        totalDiscount += (item.products.price - item.products.discount_price) * item.quantity;
      }
      
      return true;
    });
    
    const summary = {
      total_items: totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      total_discount: Math.round(totalDiscount * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
      estimated_shipping: 0 // Free shipping for now
    };
    
    res.json({
      success: true,
      data: {
        items: validCartItems,
        summary
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

// POST /api/cart - Add item to cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = addToCartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { product_id, quantity } = value;
    const userId = req.user.id;
    
    // Check if product exists and has sufficient stock
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', product_id)
      .single();
    
    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.stock_quantity}`
      });
    }
    
    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabaseAdmin
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();
    
    let cartItem;
    
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot add ${quantity} more items. Maximum available: ${product.stock_quantity - existingItem.quantity}`
        });
      }
      
      const { data: updatedItem, error: updateError } = await supabaseAdmin
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select(`
          *,
          products!inner(
            id,
            name,
            price,
            discount_price,
            images,
            stock_quantity,
            categories(name)
          )
        `)
        .single();
      
      if (updateError) throw updateError;
      cartItem = updatedItem;
    } else {
      // Add new item to cart
      const { data: newItem, error: insertError } = await supabaseAdmin
        .from('cart')
        .insert({
          user_id: userId,
          product_id,
          quantity
        })
        .select(`
          *,
          products!inner(
            id,
            name,
            price,
            discount_price,
            images,
            stock_quantity,
            categories(name)
          )
        `)
        .single();
      
      if (insertError) throw insertError;
      cartItem = newItem;
    }
    
    // Record user activity for recommendations
    await supabaseAdmin
      .from('user_activity')
      .insert({
        user_id: userId,
        product_id,
        action_type: 'add_to_cart',
        metadata: { quantity }
      });
    
    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validate request body
    const { error, value } = updateCartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const { quantity } = value;
    
    // Check if cart item exists and belongs to user
    const { data: cartItem, error: fetchError } = await supabaseAdmin
      .from('cart')
      .select(`
        *,
        products!inner(id, name, stock_quantity)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    // Check stock availability
    if (quantity > cartItem.products.stock_quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${cartItem.products.stock_quantity}`
      });
    }
    
    // Update cart item
    const { data: updatedItem, error: updateError } = await supabaseAdmin
      .from('cart')
      .update({ quantity })
      .eq('id', id)
      .select(`
        *,
        products!inner(
          id,
          name,
          price,
          discount_price,
          images,
          stock_quantity,
          categories(name)
        )
      `)
      .single();
    
    if (updateError) throw updateError;
    
    res.json({
      success: true,
      data: updatedItem,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item'
    });
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if cart item exists and belongs to user
    const { data: cartItem, error: fetchError } = await supabaseAdmin
      .from('cart')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    // Delete cart item
    const { error: deleteError } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { error } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

// GET /api/cart/count - Get cart items count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart')
      .select('quantity')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      success: true,
      data: { count: totalItems }
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart count'
    });
  }
});

// POST /api/cart/bulk - Add multiple items to cart
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      });
    }
    
    // Validate each item
    const validationSchema = Joi.array().items(addToCartSchema);
    const { error, value } = validationSchema.validate(items);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const item of value) {
      try {
        // Check product availability
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select('id, name, stock_quantity')
          .eq('id', item.product_id)
          .single();
        
        if (productError || !product) {
          errors.push(`Product ${item.product_id} not found`);
          continue;
        }
        
        if (product.stock_quantity < item.quantity) {
          errors.push(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
          continue;
        }
        
        // Check if item already exists in cart
        const { data: existingItem } = await supabaseAdmin
          .from('cart')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', item.product_id)
          .single();
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity;
          if (newQuantity > product.stock_quantity) {
            errors.push(`Cannot add ${item.quantity} more ${product.name}. Maximum available: ${product.stock_quantity - existingItem.quantity}`);
            continue;
          }
          
          const { data: updatedItem, error: updateError } = await supabaseAdmin
            .from('cart')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id)
            .select()
            .single();
          
          if (!updateError) {
            results.push(updatedItem);
          }
        } else {
          const { data: newItem, error: insertError } = await supabaseAdmin
            .from('cart')
            .insert({
              user_id: userId,
              product_id: item.product_id,
              quantity: item.quantity
            })
            .select()
            .single();
          
          if (!insertError) {
            results.push(newItem);
            
            // Record user activity
            await supabaseAdmin
              .from('user_activity')
              .insert({
                user_id: userId,
                product_id: item.product_id,
                action_type: 'add_to_cart',
                metadata: { quantity: item.quantity }
              });
          }
        }
      } catch (itemError) {
        console.error('Bulk add item error:', itemError);
        errors.push(`Failed to add item ${item.product_id}`);
      }
    }
    
    res.json({
      success: true,
      data: {
        added_items: results,
        errors: errors
      },
      message: `Successfully added ${results.length} items to cart${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    });
  } catch (error) {
    console.error('Bulk add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add items to cart'
    });
  }
});

module.exports = router;