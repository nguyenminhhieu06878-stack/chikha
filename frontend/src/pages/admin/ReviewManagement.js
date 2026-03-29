import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Filter, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

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
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter
      };

      const response = await adminAPI.getReviews(params);
      const reviewsData = response.data.data || [];
      
      // Transform data to match component expectations
      const transformedReviews = reviewsData.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        status: review.status || 'approved',
        created_at: review.created_at,
        user: { 
          full_name: review.user_name,
          email: review.user_email || 'N/A'
        },
        product: { 
          name: review.product_name,
          image_url: review.image_url || 'https://via.placeholder.com/60'
        }
      }));
      
      setReviews(transformedReviews);
      setTotalPages(response.data.pagination?.total_pages || 1);
      setError(null);
    } catch (err) {
      setError('Unable to load review list');
      console.error('Error fetching reviews:', err);
      toast.error('Unable to load review list');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, statusFilter, currentPage]);

  const handleApproveReview = async (reviewId) => {
    try {
      await adminAPI.updateReviewStatus(reviewId, 'approved');
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status: 'approved' } : review
      ));
      toast.success('Review has been approved');
    } catch (err) {
      setError('Unable to approve review');
      toast.error('Unable to approve review');
      console.error('Error approving review:', err);
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      await adminAPI.updateReviewStatus(reviewId, 'rejected');
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status: 'rejected' } : review
      ));
      toast.success('Review has been rejected');
    } catch (err) {
      setError('Unable to reject review');
      toast.error('Unable to reject review');
      console.error('Error rejecting review:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await adminAPI.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      toast.success('Review has been deleted');
    } catch (err) {
      setError('Unable to delete review');
      toast.error('Unable to delete review');
      console.error('Error deleting review:', err);
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
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      flagged: 'Flagged'
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
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/6 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="flex space-x-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
            <p className="text-gray-600 mt-1">Manage and moderate product reviews from customers</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Stats
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-yellow-50 px-3 py-2 rounded-lg">
                <div className="font-semibold text-yellow-800">
                  {reviews.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-yellow-600">Pending</div>
              </div>
              <div className="bg-red-50 px-3 py-2 rounded-lg">
                <div className="font-semibold text-red-800">
                  {reviews.filter(r => r.status === 'flagged').length}
                </div>
                <div className="text-red-600">Flagged</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={review.product?.image_url || 'https://via.placeholder.com/80'}
                    alt={review.product?.name}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                  />
                </div>
                
                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {review.product?.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <span className="font-medium">{review.user?.full_name}</span>
                        <span>•</span>
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>
                  
                  {/* Comment */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveReview(review.id)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectReview(review.id)}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {review.status === 'flagged' && (
                        <>
                          <button
                            onClick={() => handleApproveReview(review.id)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Keep
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </button>
                        </>
                      )}

                      {(review.status === 'approved' || review.status === 'rejected') && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      )}
                    </div>
                    
                    {/* Review ID for reference */}
                    <span className="text-xs text-gray-400">
                      ID: {review.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? 'No reviews in the system yet'
                : `No reviews found with status "${getStatusText(statusFilter)}"`
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span> pages
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;