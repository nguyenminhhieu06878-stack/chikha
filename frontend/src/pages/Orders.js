import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Package, Eye, Calendar, CreditCard, MapPin, Phone } from 'lucide-react';
import { ordersAPI, formatPrice, formatDateTime, getProductImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery(
    ['orders', statusFilter, page],
    () => ordersAPI.getOrders({ 
      status: statusFilter || undefined, 
      page, 
      limit: 10 
    }),
    { keepPreviousData: true }
  );

  const orders = ordersData?.data?.data || [];
  const pagination = ordersData?.data?.pagination || {};

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">
            {statusFilter 
              ? `No ${getStatusText(statusFilter).toLowerCase()} orders found.`
              : "You haven't placed any orders yet. Start shopping now!"
            }
          </p>
          <a href="/products" className="btn-primary">
            Start Shopping
          </a>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                <div className="card-header border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Đơn hàng ORD{String(order.id).padStart(8, '0')}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDateTime(order.created_at)}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                             order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 
                             order.payment_method ? order.payment_method.toUpperCase() : 'COD'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-content">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Ordered Items</h4>
                    <div className="space-y-3">
                      {order.order_items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.image_url || 'https://via.placeholder.com/60'}
                            alt={item.product_name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                      
                      {order.order_items?.length > 3 && (
                        <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                          +{order.order_items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          Shipping Address
                        </h4>
                        <div className="text-sm text-gray-700 space-y-1">
                          {order.shipping_phone && (
                            <p className="flex items-center font-medium">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {order.shipping_phone}
                            </p>
                          )}
                          {order.shipping_address && (
                            <p className="whitespace-pre-line">{order.shipping_address}</p>
                          )}
                          {order.shipping_city && (
                            <p className="font-medium">{order.shipping_city}</p>
                          )}
                          {!order.shipping_address && !order.shipping_city && (
                            <p className="text-gray-400 italic">No address provided</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span className="font-medium">{formatPrice(order.subtotal || order.total_amount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phí vận chuyển:</span>
                            <span className="font-medium text-green-600">Miễn phí</span>
                          </div>
                          <div className="flex justify-between text-base font-bold border-t pt-2">
                            <span>Tổng cộng:</span>
                            <span className="text-blue-600">{formatPrice(order.total_amount)}</span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn-outline flex items-center justify-center space-x-2 w-full"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-md ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.total_pages}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;