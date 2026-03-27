const express = require('express');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).max(99).required()
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required()
});

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cartItems = db.prepare(`
      SELECT 
        c.*,
        p.id as product_id,
        p.name as product_name,
        p.price,
        p.image_url,
        p.stock_quantity,
        cat.name as category_name
      FROM cart_items c
      INNER JOIN products p ON c.product_id = p.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `).all(userId);
    
    // Calculate cart summary
    let totalItems = 0;
    let subtotal = 0;
    
    const validCartItems = cartItems.filter(item => {
      // Check if product has stock
      if (item.stock_quantity < item.quantity) {
        // Remove invalid items from cart
        db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
        return false;
      }
      
      totalItems += item.quantity;
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      return true;
    });
    
    const summary = {
      total_items: totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
      estimated_shipping: 0
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
    const product = db.prepare('SELECT id, name, stock_quantity, price FROM products WHERE id = ?').get(product_id);
    
    if (!product) {
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
    const existingItem = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, product_id);
    
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
      
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQuantity, existingItem.id);
      cartItem = db.prepare(`
        SELECT c.*, p.name as product_name, p.price, p.image_url
        FROM cart_items c
        INNER JOIN products p ON c.product_id = p.id
        WHERE c.id = ?
      `).get(existingItem.id);
    } else {
      // Add new item to cart
      const insert = db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)');
      const result = insert.run(userId, product_id, quantity);
      
      cartItem = db.prepare(`
        SELECT c.*, p.name as product_name, p.price, p.image_url
        FROM cart_items c
        INNER JOIN products p ON c.product_id = p.id
        WHERE c.id = ?
      `).get(result.lastInsertRowid);
    }
    
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
    const cartItem = db.prepare(`
      SELECT c.*, p.stock_quantity
      FROM cart_items c
      INNER JOIN products p ON c.product_id = p.id
      WHERE c.id = ? AND c.user_id = ?
    `).get(id, userId);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    // Check stock availability
    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${cartItem.stock_quantity}`
      });
    }
    
    // Update cart item
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, id);
    
    const updatedItem = db.prepare(`
      SELECT c.*, p.name as product_name, p.price, p.image_url
      FROM cart_items c
      INNER JOIN products p ON c.product_id = p.id
      WHERE c.id = ?
    `).get(id);
    
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
    const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }
    
    // Delete cart item
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(id);
    
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
    
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    
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

module.exports = router;
