import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, User, MapPin, CreditCard } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrderDetail(id);
      console.log('Order detail response:', response);
      
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Không thể tải thông tin đơn hàng');
      }
    } catch (err) {
      setError('Không thể tải thông tin đơn hàng');
      console.error('Error fetching order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await adminAPI.updateOrderStatus(id, { status: newStatus });
      await fetchOrderDetail(); // Refresh data
    } catch (err) {
      setError('Không thể cập nhật trạng thái đơn hàng');
      console.error('Error updating order status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Không tìm thấy đơn hàng'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Đơn hàng #{String(order.id).padStart(8, '0')}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      {/* Status Update Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cập nhật trạng thái</h3>
        <div className="flex space-x-3">
          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate('processing')}
              disabled={updating}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <Package className="w-4 h-4 mr-2" />
              Bắt đầu xử lý
            </button>
          )}
          
          {order.status === 'processing' && (
            <button
              onClick={() => handleStatusUpdate('shipped')}
              disabled={updating}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Truck className="w-4 h-4 mr-2" />
              Gửi hàng
            </button>
          )}
          
          {order.status === 'shipped' && (
            <button
              onClick={() => handleStatusUpdate('delivered')}
              disabled={updating}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Đã giao hàng
            </button>
          )}
          
          {['pending'].includes(order.status) && (
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updating}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h3>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={item.products?.image_url || '/placeholder-image.jpg'}
                    alt={item.products?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.products?.name}</h4>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Thông tin khách hàng
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Tên khách hàng</p>
                <p className="font-medium">{order.users?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.users?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium">{order.users?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Địa chỉ giao hàng
            </h3>
            <div className="space-y-2">
              <p className="font-medium">{order.shipping_address?.full_name}</p>
              <p className="text-gray-600">{order.shipping_address?.phone}</p>
              <p className="text-gray-600">
                {order.shipping_address?.address_line}, {order.shipping_address?.ward}, {order.shipping_address?.district}, {order.shipping_address?.city}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Tóm tắt đơn hàng
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatPrice(order.subtotal || order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>{formatPrice(order.shipping_fee || 0)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Phương thức thanh toán: {order.payment_method || 'COD'}</p>
                <p>Ngày đặt: {formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;