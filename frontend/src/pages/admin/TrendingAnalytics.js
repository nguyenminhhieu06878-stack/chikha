import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, Eye, ShoppingCart, Star, BarChart3 } from 'lucide-react';
import { recommendationsAPI, adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const TrendingAnalytics = () => {
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch trending products
  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    ['admin-trending', timeRange],
    () => recommendationsAPI.getTrendingProducts({ limit: 20 }),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch top products by orders
  const { data: topProductsData, isLoading: topProductsLoading } = useQuery(
    'admin-top-products',
    () => adminAPI.analytics(),
    { refetchInterval: 60000 }
  );

  const trendingProducts = trendingData?.data?.data || [];
  const topProducts = topProductsData?.data?.data?.topProducts || [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (trendingLoading && topProductsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trending Analytics</h1>
          <p className="text-gray-600 mt-1">Trending and best-selling product analysis</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Top Trending</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingProducts[0]?.name?.substring(0, 15) || 'N/A'}...
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Highest Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingProducts[0]?.order_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Highest Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingProducts[0]?.view_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Highest Trending Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {trendingProducts[0]?.trending_score?.toFixed(1) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Trending Products */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Top Trending (24h)
              </h2>
              <span className="text-sm text-gray-500">Real-time</span>
            </div>
          </div>
          <div className="card-content">
            {trendingLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {trendingProducts.slice(0, 10).map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <img
                      src={product.image_url || 'https://via.placeholder.com/50'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-blue-600">{product.order_count}</p>
                          <p className="text-gray-500">Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-purple-600">{product.view_count}</p>
                          <p className="text-gray-500">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">{product.trending_score?.toFixed(1)}</p>
                          <p className="text-gray-500">Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products by Total Sales */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Best Sellers (All Time)
            </h2>
          </div>
          <div className="card-content">
            {topProductsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {topProducts.slice(0, 10).map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-green-500 text-white' :
                        index === 1 ? 'bg-blue-500 text-white' :
                        index === 2 ? 'bg-purple-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">Revenue: {formatPrice(product.revenue)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">{product.total_sold}</p>
                      <p className="text-sm text-gray-500">Sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Algorithm Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Trending Algorithm</h2>
        </div>
        <div className="card-content">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Trending Score Formula:</h3>
            <p className="text-blue-800 font-mono">
              Score = (Orders × 10) + (Views × 0.1) + (Rating × 2) + (Reviews × 1)
            </p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-blue-900">Orders:</span>
                <span className="text-blue-700"> Weight 10 (most important)</span>
              </div>
              <div>
                <span className="font-semibold text-blue-900">Views:</span>
                <span className="text-blue-700"> Weight 0.1</span>
              </div>
              <div>
                <span className="font-semibold text-blue-900">Rating:</span>
                <span className="text-blue-700"> Weight 2</span>
              </div>
              <div>
                <span className="font-semibold text-blue-900">Reviews:</span>
                <span className="text-blue-700"> Weight 1</span>
              </div>
            </div>
            <p className="text-blue-700 text-sm mt-2">
              * Only counts data from the last 24 hours to ensure real-time trending
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingAnalytics;