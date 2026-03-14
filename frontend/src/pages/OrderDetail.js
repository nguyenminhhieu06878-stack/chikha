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
import { ordersAPI, formatPrice, formatDateTime } from '../services/api';
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
      onSuccess: (data) => {
        console.log('Order data loaded:', data);
      },
      onError: (error) => {
        console.error('Order loading error:', error);
      }
    }
  );

  const order = orderData?.data;
  
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
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-8">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary"
          >
            Quay lại danh sách đơn hàng
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
            <span>Quay lại</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600 mt-1">
              {order?.id ? `ORD${order.id.slice(-8).toUpperCase()}` : 'Đang tải...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {order?.status && getStatusIcon(order.status)}
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${order?.status ? getStatusColor(order.status) : 'bg-gray-100 text-gray-800'}`}>
            {order?.status ? getStatusText(order.status) : 'Đang tải...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Sản phẩm đã đặt</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {order?.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.products?.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={item.products?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.products?.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.products?.categories?.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {formatPrice(item.total || (item.price * item.quantity))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Trạng thái đơn hàng</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Đơn hàng đã được tạo</p>
                    <p className="text-sm text-gray-500">{order?.created_at ? formatDateTime(order.created_at) : ''}</p>
                  </div>
                </div>
                
                {order?.status !== 'pending' && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Đang xử lý</p>
                      <p className="text-sm text-gray-500">Đơn hàng đang được chuẩn bị</p>
                    </div>
                  </div>
                )}
                
                {(order?.status === 'shipped' || order?.status === 'delivered') && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Đã gửi hàng</p>
                      <p className="text-sm text-gray-500">
                        {order?.shipped_at ? formatDateTime(order.shipped_at) : 'Đang vận chuyển'}
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
                      <p className="font-medium text-gray-900">Đã giao hàng</p>
                      <p className="text-sm text-gray-500">
                        {order?.delivered_at ? formatDateTime(order.delivered_at) : 'Đã hoàn thành'}
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
              <h2 className="text-xl font-semibold text-gray-900">Thông tin đơn hàng</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="font-medium">{order?.created_at ? formatDateTime(order.created_at) : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="font-medium">
                    {order?.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 
                     order?.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 
                     order?.payment_method?.toUpperCase() || ''}
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
                Địa chỉ giao hàng
              </h2>
            </div>
            <div className="card-content">
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{order.shipping_address?.full_name}</p>
                <p className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {order.shipping_address?.phone}
                </p>
                <div className="text-gray-600">
                  <p>{order.shipping_address?.address_line_1}</p>
                  {order.shipping_address?.address_line_2 && (
                    <p>{order.shipping_address.address_line_2}</p>
                  )}
                  <p>
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                  </p>
                  {order.shipping_address?.country && order.shipping_address.country !== 'Vietnam' && (
                    <p>{order.shipping_address.country}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
            </div>
            <div className="card-content space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{order?.subtotal ? formatPrice(order.subtotal) : formatPrice(order?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              {order?.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="font-medium text-red-600">-{formatPrice(order?.discount_amount || 0)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">{formatPrice(order?.total_amount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order?.status === 'pending' && (
            <div className="card">
              <div className="card-content">
                <button className="w-full btn-outline text-red-600 border-red-200 hover:bg-red-50">
                  Hủy đơn hàng
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