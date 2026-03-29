import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Phone, 
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { ordersAPI, formatPrice, formatDateTime, getProductImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery(
    ['order', id],
    () => ordersAPI.getOrder(id),
    { 
      enabled: !!id,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        console.log('=== FRONTEND ORDER DATA ===');
        console.log('Raw API response:', data);
        console.log('Response.data:', data?.data);
        console.log('Response.data.data:', data?.data?.data);
        console.log('Order items:', data?.data?.order_items);
        console.log('Order items (nested):', data?.data?.data?.order_items);
        console.log('=== END FRONTEND ORDER DATA ===');
      },
      onError: (error) => {
        console.error('Order loading error:', error);
      }
    }
  );

  // Handle axios response structure - data might be nested
  const order = orderData?.data?.data || orderData?.data;
  
  console.log('=== ORDER OBJECT ===');
  console.log('Order:', order);
  console.log('Order items:', order?.order_items);
  console.log('Order items length:', order?.order_items?.length);
  console.log('Total amount:', order?.total_amount);
  console.log('Payment method:', order?.payment_method);
  console.log('=== END ORDER OBJECT ===');
  
  console.log('OrderDetail render:', { id, isLoading, error, order });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border border-purple-200',
      delivered: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5" />,
      processing: <Package className="w-5 h-5" />,
      shipped: <Truck className="w-5 h-5" />,
      delivered: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />
    };
    return icons[status] || <Clock className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-8">The order does not exist or you do not have permission to view it.</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            Back to order list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Details
            </h1>
            <p className="text-gray-600 mt-1">
              {order?.id ? `ORD${String(order.id).padStart(8, '0')}` : 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {order?.status && getStatusIcon(order.status)}
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${order?.status ? getStatusColor(order.status) : 'bg-gray-100 text-gray-800'}`}>
            {order?.status ? getStatusText(order.status) : 'Loading...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Ordered Products</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {order?.order_items && order.order_items.length > 0 ? (
                  order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image_url || 'https://via.placeholder.com/80'}
                        alt={item.product_name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_name || 'Product'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.category_name || 'Category'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(item.price)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products in this order</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order created</p>
                    <p className="text-sm text-gray-500">{order?.created_at ? formatDateTime(order.created_at) : ''}</p>
                  </div>
                </div>
                
                {order?.status !== 'pending' && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Processing</p>
                      <p className="text-sm text-gray-500">Order is being prepared</p>
                    </div>
                  </div>
                )}
                
                {(order?.status === 'shipped' || order?.status === 'delivered') && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shipped</p>
                      <p className="text-sm text-gray-500">
                        {order?.shipped_at ? formatDateTime(order.shipped_at) : 'In transit'}
                      </p>
                    </div>
                  </div>
                )}
                
                {order?.status === 'delivered' && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-500">
                        {order?.delivered_at ? formatDateTime(order.delivered_at) : 'Completed'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Order Information</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{order?.created_at ? formatDateTime(order.created_at) : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">
                    {order?.payment_method === 'cod' ? 'Cash on Delivery' : 
                     order?.payment_method === 'cash' ? 'Cash on Delivery' :
                     order?.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
                     order?.payment_method?.toUpperCase() || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
            </div>
            <div className="card-content">
              <div className="space-y-2">
                {order?.shipping_phone && (
                  <p className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {order.shipping_phone}
                  </p>
                )}
                <div className="text-gray-600">
                  {order?.shipping_address && (
                    <p className="whitespace-pre-line">{order.shipping_address}</p>
                  )}
                  {order?.shipping_city && (
                    <p className="font-medium mt-2">{order.shipping_city}</p>
                  )}
                  {!order?.shipping_address && !order?.shipping_city && (
                    <p className="text-gray-400 italic">No shipping address available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
            </div>
            <div className="card-content space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{order?.subtotal ? formatPrice(order.subtotal) : formatPrice(order?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              {order?.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-{formatPrice(order?.discount_amount || 0)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatPrice(order?.total_amount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order?.status === 'pending' && (
            <div className="card">
              <div className="card-content">
                <button className="w-full btn-outline text-red-600 border-red-200 hover:bg-red-50">
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;