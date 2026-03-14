import { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  BarChart3
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [reportType, setReportType] = useState('sales');

  const { data: salesData, isLoading: salesLoading } = useQuery(
    ['admin-sales-report', dateRange],
    () => adminAPI.getSalesReport({ 
      startDate: getStartDate(dateRange),
      endDate: new Date().toISOString(),
      groupBy: dateRange === '1d' ? 'hour' : dateRange === '7d' ? 'day' : 'month'
    }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: dashboardData } = useQuery(
    'admin-dashboard',
    () => adminAPI.getDashboard(),
    { staleTime: 5 * 60 * 1000 }
  );

  function getStartDate(range) {
    const now = new Date();
    switch (range) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const overview = dashboardData?.data?.overview || {};
  const salesReport = salesData?.data || {};

  // Calculate totals from sales report
  const totalRevenue = Object.values(salesReport).reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = Object.values(salesReport).reduce((sum, item) => sum + (item.orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Tổng đơn hàng',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
      trend: 'up'
    },
    {
      title: 'Giá trị đơn hàng TB',
      value: formatPrice(avgOrderValue),
      icon: BarChart3,
      color: 'bg-purple-500',
      change: '+5.1%',
      trend: 'up'
    },
    {
      title: 'Tổng khách hàng',
      value: (overview.totalUsers || 0).toLocaleString(),
      icon: Users,
      color: 'bg-orange-500',
      change: '+15.3%',
      trend: 'up'
    }
  ];

  if (salesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Phân tích & Báo cáo</h1>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">24 giờ qua</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">Báo cáo bán hàng</option>
            <option value="products">Báo cáo sản phẩm</option>
            <option value="customers">Báo cáo khách hàng</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">so với kỳ trước</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Doanh thu theo thời gian</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(salesReport).map(([date, data]) => (
              <div key={date} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.orders} đơn hàng
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(data.revenue)}
                  </p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((data.revenue / Math.max(...Object.values(salesReport).map(d => d.revenue))) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {dashboardData?.data?.topProducts?.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                </div>
                <img
                  src={item.products?.image_url || 'https://via.placeholder.com/40'}
                  alt={item.products?.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.products?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.products?.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {item.quantity} đã bán
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                Chưa có dữ liệu sản phẩm
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo chi tiết</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Tỷ lệ chuyển đổi</h3>
            <p className="text-2xl font-bold text-green-600">3.2%</p>
            <p className="text-sm text-gray-500">+0.5% so với tháng trước</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Tỷ lệ bỏ giỏ hàng</h3>
            <p className="text-2xl font-bold text-blue-600">68.5%</p>
            <p className="text-sm text-gray-500">-2.1% so với tháng trước</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Khách hàng quay lại</h3>
            <p className="text-2xl font-bold text-purple-600">24.8%</p>
            <p className="text-sm text-gray-500">+1.3% so với tháng trước</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;