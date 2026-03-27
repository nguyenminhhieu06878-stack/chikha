import React from 'react';
import { useQuery } from 'react-query';
import { Search, TrendingUp, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const SearchAnalytics = () => {
  // Fetch search analytics
  const { data, isLoading } = useQuery('search-analytics', async () => {
    const response = await api.get('/admin/search-analytics');
    return response.data;
  });

  const analytics = data?.data || {};
  const topSearches = analytics.top_searches || [];
  const recentSearches = analytics.recent_searches || [];
  const stats = analytics.stats || {};

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Analytics</h1>
          <p className="text-gray-600 mt-1">
            Phân tích từ khóa tìm kiếm và xu hướng người dùng
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng tìm kiếm</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total_searches?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Từ khóa duy nhất</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.unique_queries?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trung bình kết quả</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.avg_results?.toFixed(1) || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Searches */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">
            Top 20 từ khóa phổ biến
          </h2>
        </div>
        <div className="card-content">
          {topSearches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu tìm kiếm
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Từ khóa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lần tìm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trung bình kết quả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xu hướng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topSearches.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Search className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.query}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.search_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.avg_results?.toFixed(1) || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min((item.search_count / topSearches[0].search_count) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Searches */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">
            Tìm kiếm gần đây
          </h2>
        </div>
        <div className="card-content">
          {recentSearches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu
            </div>
          ) : (
            <div className="space-y-3">
              {recentSearches.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{item.query}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{item.results_count} kết quả</span>
                    <span>{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;
