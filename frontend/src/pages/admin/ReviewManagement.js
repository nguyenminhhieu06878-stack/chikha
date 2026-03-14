import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Flag, Filter } from 'lucide-react';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      // Note: This would need to be implemented in the backend
      // For now, we'll use a mock implementation
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          comment: 'Sản phẩm rất tốt, chất lượng cao',
          status: 'approved',
          created_at: new Date().toISOString(),
          user: { full_name: 'Nguyễn Văn A', email: 'user1@example.com' },
          product: { name: 'iPhone 15 Pro', image_url: 'https://via.placeholder.com/60' }
        },
        {
          id: '2',
          rating: 4,
          comment: 'Giao hàng nhanh, đóng gói cẩn thận',
          status: 'pending',
          created_at: new Date().toISOString(),
          user: { full_name: 'Trần Thị B', email: 'user2@example.com' },
          product: { name: 'Samsung Galaxy S24', image_url: 'https://via.placeholder.com/60' }
        },
        {
          id: '3',
          rating: 2,
          comment: 'Sản phẩm không như mong đợi',
          status: 'flagged',
          created_at: new Date().toISOString(),
          user: { full_name: 'Lê Văn C', email: 'user3@example.com' },
          product: { name: 'MacBook Air M2', image_url: 'https://via.placeholder.com/60' }
        }
      ];
      
      setReviews(mockReviews);
      setTotalPages(1);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách đánh giá');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApproveReview = async (reviewId) => {
    try {
      // TODO: Implement approve review API
      console.log('Approving review:', reviewId);
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status: 'approved' } : review
      ));
    } catch (err) {
      setError('Không thể phê duyệt đánh giá');
      console.error('Error approving review:', err);
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      // TODO: Implement reject review API
      console.log('Rejecting review:', reviewId);
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status: 'rejected' } : review
      ));
    } catch (err) {
      setError('Không thể từ chối đánh giá');
      console.error('Error rejecting review:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      approved: 'Đã duyệt',
      pending: 'Chờ duyệt',
      rejected: 'Đã từ chối',
      flagged: 'Bị báo cáo'
    };
    return statusMap[status] || status;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
              <option value="flagged">Bị báo cáo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={review.product?.image_url || 'https://via.placeholder.com/60'}
                  alt={review.product?.name}
                  className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {review.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        bởi {review.user?.full_name} • {formatDate(review.created_at)}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating}/5
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4">
                    {review.comment}
                  </p>
                  
                  {review.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Từ chối
                      </button>
                    </div>
                  )}
                  
                  {review.status === 'flagged' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Giữ lại
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Xóa bỏ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy đánh giá nào
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;