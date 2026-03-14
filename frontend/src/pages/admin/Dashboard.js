import { useQuery } from 'react-query';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Eye
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery(
    'admin-dashboard',
    () => adminAPI.getDashboard(),
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) return <LoadingSpinner />;

  const { overview, recentOrders, topProducts } = dashboardData?.data || {};

  const stats = [
    {
      title: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Products',
      value: overview?.totalProducts || 0,
      icon: Package,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Total Orders',
      value: overview?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      change: '+18%'
    },
    {
      title: 'Total Revenue',
      value: `${(overview?.totalRevenue || 0).toLocaleString('vi-VN')} ₫`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+25%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
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
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders?.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">{order.users?.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img
                    src={item.products?.image_url || 'https://via.placeholder.com/40'}
                    alt={item.products?.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.products?.name}</p>
                    <p className="text-sm text-gray-600">
                      {parseFloat(item.products?.price).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.quantity} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Package className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900">Add Product</h3>
            <p className="text-sm text-gray-600">Add new product to inventory</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Eye className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-900">View Reports</h3>
            <p className="text-sm text-gray-600">Generate sales and analytics reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;