import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, Truck, Shield, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../contexts/CartContext';
import { ordersAPI, formatPrice, getProductImageUrl, addressesAPI, paymentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { cartItems, cartSummary, clearCart } = useCart();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  // Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await addressesAPI.getAddresses();
        if (response.data.success) {
          const addresses = response.data.data;
          setSavedAddresses(addresses);
          
          // Auto-fill default address
          const defaultAddress = addresses.find(addr => addr.is_default);
          if (defaultAddress) {
            setValue('full_name', defaultAddress.full_name);
            setValue('phone', defaultAddress.phone);
            setValue('address_line_1', defaultAddress.address_line_1);
            setValue('address_line_2', defaultAddress.address_line_2 || '');
            setValue('city', defaultAddress.city);
            setValue('state', defaultAddress.state);
            setValue('postal_code', defaultAddress.postal_code);
            setValue('country', defaultAddress.country || 'Vietnam');
          }
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadAddresses();
  }, [setValue]);

  // Function to populate form with a saved address
  const fillFormWithAddress = (address) => {
    setValue('full_name', address.full_name);
    setValue('phone', address.phone);
    setValue('address_line_1', address.address_line_1);
    setValue('address_line_2', address.address_line_2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('postal_code', address.postal_code);
    setValue('country', address.country || 'Vietnam');
    toast.success('Address loaded');
  };

  // Redirect if cart is empty
  React.useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Prepare order data for SQLite backend
      const orderData = {
        items: cartItems.map(item => {
          const product = item.products || item;
          return {
            product_id: product.product_id || product.id,
            quantity: item.quantity,
            price: product.price
          };
        }),
        shipping_address: `${data.address_line_1}, ${data.address_line_2 || ''}, ${data.city}, ${data.state}`,
        shipping_city: data.city,
        shipping_phone: data.phone
      };

      const response = await ordersAPI.createOrder(orderData);
      
      if (response.data.success) {
        const orderId = response.data.data.id;
        
        // If payment method is OSPay, redirect to payment gateway
        if (paymentMethod === 'ospay') {
          try {
            const paymentResponse = await paymentAPI.createOSPayPayment({
              orderId,
              amount: cartSummary.total,
              orderInfo: `Payment for order #${orderId}`,
              customerName: data.full_name,
              customerPhone: data.phone
            });

            if (paymentResponse.data.success) {
              // Redirect to OSPay payment page
              window.location.href = paymentResponse.data.data.paymentUrl;
              return;
            }
          } catch (paymentError) {
            console.error('Payment creation failed:', paymentError);
            toast.error('Failed to create payment. Please try again.');
            setLoading(false);
            return;
          }
        }
        
        // For COD and Bank Transfer, clear cart and redirect to order detail
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${orderId}`);
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

              {/* Saved Addresses */}
              {!loadingAddress && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Use Saved Address
                  </label>
                  <div className="space-y-2">
                    {savedAddresses.map(address => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => fillFormWithAddress(address)}
                        className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition ${
                          address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {address.full_name}
                              {address.is_default && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {address.address_line_1}, {address.city}, {address.state}
                            </div>
                            <div className="text-sm text-gray-500">{address.phone}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-500">Or enter a new address below:</p>
                  </div>
                </div>
              )}
              
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
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="ospay"
                    checked={paymentMethod === 'ospay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      OSPay (OneSPay)
                    </div>
                    <div className="text-sm text-gray-500">Pay online with credit/debit card or e-wallet</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Transfer to our bank account</div>
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
                {cartItems.map(item => {
                  const product = item.products || item;
                  const productName = product.product_name || product.name;
                  const productPrice = product.price;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={getProductImageUrl(product, 'https://via.placeholder.com/60')}
                        alt={productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {productName}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(productPrice * item.quantity)}
                      </p>
                    </div>
                  );
                })}
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

              {/* OSPay QR Code */}
              {paymentMethod === 'ospay' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Scan QR Code to Pay
                    </p>
                    <div className="flex justify-center mb-3">
                      <div className="bg-white p-3 rounded-lg">
                        <QRCodeSVG 
                          value={`OSPAY:${cartSummary.total}:VND`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Amount: {formatPrice(cartSummary.total)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Or click "Proceed to Payment" below
                    </p>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="loading-spinner mx-auto"></div>
                ) : paymentMethod === 'ospay' ? (
                  'Proceed to Payment'
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