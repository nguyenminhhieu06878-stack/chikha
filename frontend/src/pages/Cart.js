import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice, getProductImageUrl } from '../services/api';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading, fetchCart } = useCart();
  
  console.log('Cart data:', cart);
  console.log('Cart items:', cart?.items);
  console.log('Cart summary:', cart?.summary);

  const handleForceRefresh = async () => {
    console.log('Force refreshing cart...');
    await fetchCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Start shopping to add items to your cart.</p>
            <div className="mt-4 space-x-4">
              <Link
                to="/products"
                className="inline-block btn-primary"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/100'}
                      alt={item.product_name || 'Product'}
                      className="w-20 h-20 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0"
                    />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">{item.product_name}</h3>
                      <p className="text-gray-600 text-sm sm:text-base">{formatPrice(item.price)}</p>
                      {item.category_name && (
                        <p className="text-xs sm:text-sm text-gray-500">{item.category_name}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 rounded-md hover:bg-gray-100 border border-gray-300"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-md hover:bg-gray-100 border border-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md mx-auto sm:mx-0"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal ({cart.summary?.total_items || 0} items)</span>
                  <span className="font-medium">{formatPrice(cart.summary?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-base sm:text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(cart.summary?.total || 0)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="w-full btn-primary block text-center py-3 text-sm sm:text-base"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/products"
                  className="w-full btn-outline block text-center py-2 text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;