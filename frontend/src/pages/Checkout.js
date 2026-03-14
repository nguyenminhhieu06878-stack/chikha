import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, Truck, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { ordersAPI, formatPrice } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const { cartItems, cartSummary, clearCart } = useCart();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.products.id,
          quantity: item.quantity,
          price: item.products.discount_price || item.products.price
        })),
        shipping_address: {
          full_name: data.full_name,
          phone: data.phone,
          address_line_1: data.address_line_1,
          address_line_2: data.address_line_2 || '',
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country || 'Vietnam'
        },
        payment_method: data.payment_method,
        notes: data.notes || ''
      };

      const response = await ordersAPI.createOrder(orderData);
      
      if (response.data.success) {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${response.data.data.id}`);
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('full_name', { required: 'Full name is required' })}
                    className={`input ${errors.full_name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    {...register('country')}
                    className="input"
                    defaultValue="Vietnam"
                  >
                    <option value="Vietnam">Vietnam</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    {...register('address_line_1', { required: 'Address is required' })}
                    className={`input ${errors.address_line_1 ? 'border-red-500' : ''}`}
                    placeholder="Street address, P.O. box, company name"
                  />
                  {errors.address_line_1 && (
                    <p className="text-red-600 text-sm mt-1">{errors.address_line_1.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    {...register('address_line_2')}
                    className="input"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    className={`input ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Enter your city"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province *
                  </label>
                  <input
                    {...register('state', { required: 'State is required' })}
                    className={`input ${errors.state ? 'border-red-500' : ''}`}
                    placeholder="Enter your state/province"
                  />
                  {errors.state && (
                    <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    {...register('postal_code', { required: 'Postal code is required' })}
                    className={`input ${errors.postal_code ? 'border-red-500' : ''}`}
                    placeholder="Enter postal code"
                  />
                  {errors.postal_code && (
                    <p className="text-red-600 text-sm mt-1">{errors.postal_code.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value="cod"
                    defaultChecked
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value="bank_transfer"
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Transfer to our bank account</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    value="credit_card"
                    disabled
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-gray-500">Coming soon</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Notes (Optional)
              </h2>
              <textarea
                {...register('notes')}
                rows={3}
                className="input"
                placeholder="Special instructions for your order..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.products.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={item.products.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.products.name}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice((item.products.discount_price || item.products.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartSummary.subtotal)}</span>
                </div>
                
                {cartSummary.total_discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(cartSummary.total_discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>{formatPrice(cartSummary.total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="loading-spinner mx-auto"></div>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Security Info */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;