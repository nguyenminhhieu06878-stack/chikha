import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import TimeRangeSelector from '../../components/TimeRangeSelector';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartTimeRange, setChartTimeRange] = useState('7d');
  const [categoryTimeRange, setCategoryTimeRange] = useState('30d');

  // Helper function to get date range
  const getDateRange = (range) => {
    const now = new Date();
    let startDate, groupBy;
    
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = 'hour';
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'week';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      groupBy
    };
  };
  // Fetch dashboard data with time range
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    ['admin-dashboard', timeRange],
    () => adminAPI.getDashboard(timeRange),
    { 
      staleTime: 30000, // Cache for 30 seconds
      cacheTime: 60000, // Keep in cache for 1 minute
    }
  );

  // Fetch analytics data for charts
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'admin-analytics',
    () => adminAPI.analytics(),
    { 
      staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    }
  );

  // Fetch sales report for revenue chart with separate time range
  const { data: salesData, isLoading: salesLoading } = useQuery(
    ['admin-sales-report', chartTimeRange],
    () => {
      const { startDate, endDate, groupBy } = getDateRange(chartTimeRange);
      return adminAPI.getSalesReport({ startDate, endDate, groupBy });
    },
    { 
      staleTime: 2 * 60 * 1000 // Cache for 2 minutes
    }
  );

  if (dashboardLoading || analyticsLoading || salesLoading) {
    return <LoadingSpinner />;
  }

  if (dashboardError) {
    console.error('Dashboard errors:', { dashboardError });
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-2">Unable to load dashboard data</p>
          <p className="text-sm text-gray-500">
            {dashboardError?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Extract data safely
  const overview = dashboardData?.data?.data?.overview || dashboardData?.data?.overview || {};

  console.log('Dashboard API response:', dashboardData);
  console.log('Overview extracted:', overview);
  console.log('Full response structure:', JSON.stringify(dashboardData, null, 2));

  // Process analytics data for charts
  const analytics = analyticsData?.data?.data || {};
  const revenueByMonth = analytics.revenueByMonth || [];
  const topProducts = analytics.topProducts || [];

  // Process sales data for revenue chart
  const salesReport = salesData?.data?.data || {};
  const revenueData = salesReport.salesData || [];

  // Sample data for charts if no real data
  const sampleRevenueData = [
    { period: '2024-02-01', revenue: 15000000, orders: 25 },
    { period: '2024-02-02', revenue: 18000000, orders: 30 },
    { period: '2024-02-03', revenue: 22000000, orders: 35 },
    { period: '2024-02-04', revenue: 19000000, orders: 28 },
    { period: '2024-02-05', revenue: 25000000, orders: 40 },
    { period: '2024-02-06', revenue: 28000000, orders: 45 },
    { period: '2024-02-07', revenue: 32000000, orders: 50 }
  ];

  const sampleCategoryData = [
    { name: 'Phones', value: 35, color: '#3B82F6' },
    { name: 'Laptop', value: 25, color: '#10B981' },
    { name: 'Accessories', value: 20, color: '#F59E0B' },
    { name: 'Tablet', value: 15, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#8B5CF6' }
  ];

  // Use real data if available, otherwise use sample data
  const chartRevenueData = revenueData.length > 0 ? revenueData : sampleRevenueData;

  // Stats cards data - use dashboard data with time range info
  const stats = [
    {
      title: 'Total Users',
      value: overview.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${overview.recentUsers || 0} new`,
      period: getTimeRangeLabel(timeRange)
    },
    {
      title: 'Total Products',
      value: overview.totalProducts || 0,
      icon: Package,
      color: 'bg-green-500',
      change: '+5%',
      period: 'vs last month'
    },
    {
      title: `Orders (${getTimeRangeLabel(timeRange)})`,
      value: overview.recentOrders || 0,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      change: `${overview.totalOrders || 0} total`,
      period: 'all time'
    },
    {
      title: `Revenue (${getTimeRangeLabel(timeRange)})`,
      value: `${(overview.recentRevenue || 0).toLocaleString('en-US')} ₫`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: `${(overview.totalRevenue || 0).toLocaleString('en-US')} ₫ total`,
      period: 'all time'
    }
  ];

  // Helper function to get time range label
  function getTimeRangeLabel(range) {
    switch (range) {
      case '1d': return 'Today';
      case '7d': return '7 days';
      case '30d': return '30 days';
      case '3m': return '3 months';
      default: return '7 days';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Admin system overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
            size="md"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500 font-medium">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">{stat.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
              <p className="text-sm text-gray-600">{getTimeRangeLabel(chartTimeRange)}</p>
            </div>
            <TimeRangeSelector
              value={chartTimeRange}
              onChange={setChartTimeRange}
              size="sm"
            />
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (chartTimeRange === '1d') {
                      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    } else if (chartTimeRange === '3m') {
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${value.toLocaleString('en-US')} ₫` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    if (chartTimeRange === '1d') {
                      return date.toLocaleString('en-US');
                    }
                    return date.toLocaleDateString('en-US');
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Category Distribution</h2>
              <p className="text-sm text-gray-600">Sales ratio by category</p>
            </div>
            <TimeRangeSelector
              value={categoryTimeRange}
              onChange={setCategoryTimeRange}
              options={[
                { value: '7d', label: '7 days' },
                { value: '30d', label: '30 days' },
                { value: '3m', label: '3 months' },
                { value: 'all', label: 'All' }
              ]}
              size="sm"
            />
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sampleCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sampleCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Orders and Revenue</h2>
            <p className="text-sm text-gray-600">Combined chart over time</p>
          </div>
          <TimeRangeSelector
            value={chartTimeRange}
            onChange={setChartTimeRange}
            size="sm"
          />
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (chartTimeRange === '1d') {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  } else if (chartTimeRange === '3m') {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `${value.toLocaleString('en-US')} ₫` : `${value} orders`,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  if (chartTimeRange === '1d') {
                    return date.toLocaleString('en-US');
                  }
                  return date.toLocaleDateString('en-US');
                }}
              />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" fill="#10B981" name="Orders" />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simple Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-medium text-gray-900">{overview.totalUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Products</span>
                <span className="font-medium text-gray-900">{overview.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium text-gray-900">{overview.totalOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recent Orders</span>
                <span className="font-medium text-gray-900">{overview.recentOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tỷ lệ chuyển đổi</span>
                <span className="font-medium text-gray-900">{overview.conversionRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hiệu suất</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-medium text-green-600">
                  {(overview.totalRevenue || 0).toLocaleString('en-US')} ₫
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-medium text-gray-900">
                  {overview.totalOrders > 0 
                    ? ((overview.totalRevenue || 0) / overview.totalOrders).toLocaleString('en-US') 
                    : 0} ₫
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Đơn hàng/Người dùng</span>
                <span className="font-medium text-gray-900">
                  {overview.totalUsers > 0 
                    ? ((overview.totalOrders || 0) / overview.totalUsers).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">System Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Running well
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Package className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900">Product Management</h3>
              <p className="text-sm text-gray-600">Add, edit, delete products</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <Users className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">View and manage accounts</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <ShoppingCart className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-medium text-gray-900">Order Management</h3>
              <p className="text-sm text-gray-600">Process and track orders</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;