import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], summary: { total_items: 0, subtotal: 0, total: 0 } });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({ items: [], summary: { total_items: 0, subtotal: 0, total: 0 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      console.log('Fetching cart data...');
      const response = await cartAPI.getCart();
      console.log('Cart API response:', response.data);
      
      // Handle the API response structure: { success: true, data: { items: [], summary: {} } }
      if (response.data && response.data.success && response.data.data) {
        setCart(response.data.data);
      } else {
        // Fallback for direct data structure
        setCart(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
      // Set empty cart on error
      setCart({ items: [], summary: { total_items: 0, subtotal: 0, total: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      setLoading(true);
      console.log('Adding to cart:', { productId, quantity });
      const response = await cartAPI.addToCart({ product_id: productId, quantity });
      console.log('Add to cart response:', response);
      
      // Force refresh cart after adding
      await fetchCart();
      
      toast.success('Item added to cart');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Add to cart error:', error);
      const message = error.response?.data?.error || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      await cartAPI.updateCartItem(itemId, { quantity });
      await fetchCart(); // Refresh cart
      toast.success('Cart updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      await cartAPI.removeFromCart(itemId);
      await fetchCart(); // Refresh cart
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to remove item';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return { success: false };

    try {
      setLoading(true);
      await cartAPI.clearCart();
      setCart({ items: [], summary: { total_items: 0, subtotal: 0, total: 0 } });
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to clear cart';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () => {
    return cart?.summary?.total_items || 0;
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartCount,
    cartItems: cart.items || [],
    cartSummary: cart.summary || { total_items: 0, subtotal: 0, total: 0 }
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};