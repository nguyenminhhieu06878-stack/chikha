import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Star, ShoppingCart, Heart, Share2, Plus, Minus } from 'lucide-react';
import { productsAPI, recommendationsAPI, reviewsAPI, formatPrice } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { PLACEHOLDER_IMAGES } from '../utils/placeholder';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch product details
  const { data: productData, isLoading: productLoading, error: productError } = useQuery(
    ['product', id],
    () => productsAPI.getProduct(id),
    {
      enabled: !!id, // Only fetch when id exists
      retry: 1, // Only retry once on failure
      refetchOnMount: false, // Don't refetch on component mount
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      onSuccess: (data) => {
        console.log('Product API Success - Full Response:', data);
        console.log('Product API Success - Data:', data?.data);
        
        // Track view for recommendations
        if (data?.data?.id) {
          recommendationsAPI.trackView(data.data.id).catch(() => {});
        }
      },
      onError: (error) => {
        console.error('Product API Error:', error);
      }
    }
  );

  // Similar products are now included in product data
  // const { data: similarData, isLoading: similarLoading } = useQuery(
  //   ['similar-products', id],
  //   () => recommendationsAPI.getSimilarProducts(id, { limit: 4 }),
  //   { enabled: !!id }
  // );

  // Fetch reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    ['reviews', id, ratingFilter],
    () => reviewsAPI.getProductReviews(id, { 
      page: 1, 
      limit: 10,
      rating_filter: ratingFilter 
    }),
    { enabled: !!id }
  );

  const product = productData?.data?.data || productData?.data;
  const similarProducts = product?.related_products || [];
  const reviews = React.useMemo(() => {
    return reviewsData?.data?.data || reviewsData?.data || [];
  }, [reviewsData]);
  
  // Debug logging for reviews
  console.log('=== Reviews Debug ===');
  console.log('reviewsData:', reviewsData);
  console.log('reviews:', reviews);
  console.log('reviews length:', reviews.length);
  
  // Calculate review summary from reviews data
  const reviewSummary = React.useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { total_reviews: 0, average_rating: 0, rating_counts: {} };
    }

    const total_reviews = reviews.length;
    const total_rating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average_rating = total_rating / total_reviews;
    
    const rating_counts = {};
    for (let i = 1; i <= 5; i++) {
      rating_counts[i] = reviews.filter(review => review.rating === i).length;
    }

    console.log('Calculated reviewSummary:', {
      total_reviews,
      average_rating,
      rating_counts
    });

    return {
      total_reviews,
      average_rating,
      rating_counts
    };
  }, [reviews]);

  // Debug logging
  console.log('=== ProductDetail Debug ===');
  console.log('1. productData:', productData);
  console.log('2. productData?.data:', productData?.data);
  console.log('3. product:', product);
  console.log('4. product?.name:', product?.name);
  console.log('5. product?.price:', product?.price);
  console.log('6. product?.stock_quantity:', product?.stock_quantity);
  console.log('7. Type of product:', typeof product);
  console.log('8. Product keys:', product ? Object.keys(product) : 'no product');
  console.log('9. Product values:', product ? Object.values(product) : 'no values');
  console.log('10. Full product object:', JSON.stringify(product));
  console.log('Loading:', productLoading);
  console.log('Error:', productError);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }

    if (quantity > stockQuantity) {
      toast.error(`Only ${stockQuantity} items left`);
      return;
    }

    await addToCart(product.id, quantity);
  };

  // Create review mutation
  const createReviewMutation = useMutation(
    (data) => reviewsAPI.createReview(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', id]);
        queryClient.invalidateQueries(['product', id]);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        toast.success('Your review has been submitted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Unable to submit review');
      }
    }
  );

  // Update review mutation
  const updateReviewMutation = useMutation(
    ({ id, data }) => reviewsAPI.updateReview(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', id]);
        queryClient.invalidateQueries(['product', id]);
        setEditingReview(null);
        setReviewForm({ rating: 5, comment: '' });
        toast.success('Review has been updated!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Unable to update review');
      }
    }
  );

  // Delete review mutation
  const deleteReviewMutation = useMutation(
    (reviewId) => reviewsAPI.deleteReview(reviewId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', id]);
        queryClient.invalidateQueries(['product', id]);
        toast.success('Review has been deleted!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Unable to delete review');
      }
    }
  );

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }

    if (reviewForm.comment.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    if (editingReview) {
      updateReviewMutation.mutate({
        id: editingReview.id,
        data: reviewForm
      });
    } else {
      createReviewMutation.mutate({
        product_id: id,
        ...reviewForm
      });
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false);
    setReviewForm({ rating: 5, comment: '' });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-gray-300" />
        );
      }
    }

    return stars;
  };

  if (productLoading) {
    return <LoadingSpinner />;
  }

  if (productError) {
    console.error('Product Error:', productError);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error Loading Product</h1>
          <p className="text-gray-600 mt-2">Unable to load product information. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!product || !product.id) {
    console.warn('Product is null, undefined, or missing id:', product);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.location.href = '/products'} 
            className="mt-4 btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Ensure all values have safe fallbacks
  const images = product?.image_url 
    ? [product.image_url] 
    : product?.images && product.images.length > 0 
    ? product.images 
    : [PLACEHOLDER_IMAGES.large];
  
  const productName = product?.name || 'Product';
  const productPrice = typeof product?.price === 'number' 
    ? product.price 
    : parseFloat(product?.price) || 0;
  
  const discountPrice = product?.discount_price 
    ? (typeof product.discount_price === 'number' ? product.discount_price : parseFloat(product.discount_price))
    : null;
  
  const discountPercentage = discountPrice && productPrice > 0
    ? Math.round(((productPrice - discountPrice) / productPrice) * 100)
    : 0;
  
  const finalPrice = discountPrice || productPrice;
  
  // Ensure stock_quantity is a number
  const stockQuantity = typeof product?.stock_quantity === 'number' 
    ? product.stock_quantity 
    : parseInt(product?.stock_quantity) || 0;
  
  console.log('=== Render Values ===');
  console.log('Product Name:', productName);
  console.log('Product Price (raw):', product?.price);
  console.log('Product Price (parsed):', productPrice);
  console.log('Discount Price:', discountPrice);
  console.log('Final Price:', finalPrice);
  console.log('Stock Quantity:', stockQuantity);
  console.log('Images:', images);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGES.large;
              }}
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-primary-600 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGES.small;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{productName}</h1>
            {product?.category_name && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Category:</span>
                <span className="text-primary-600 font-medium">{product.category_name}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 pb-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(product.average_rating || 0)}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {(product.average_rating || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm sm:text-base">
              <span className="text-gray-600">
                <span className="font-medium">{product.review_count || 0}</span> reviews
              </span>
              {product.sold_count > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">
                    Sold: <span className="font-medium">{product.sold_count}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-3xl sm:text-4xl font-bold text-primary-600">
                {formatPrice(finalPrice)}
              </span>
              {discountPrice && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    {formatPrice(productPrice)}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md text-sm font-bold">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stockQuantity > 10 
                ? 'bg-green-100 text-green-800' 
                : stockQuantity > 0 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {stockQuantity > 10 
                ? `In Stock (${stockQuantity} items)` 
                : stockQuantity > 0 
                ? `Only ${stockQuantity} left`
                : 'Out of Stock'
              }
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Product Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">{product.description}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {stockQuantity > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), stockQuantity));
                    }}
                    className="w-16 px-2 py-2 text-center border-x border-gray-300 focus:outline-none"
                    min="1"
                    max={stockQuantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition"
                    disabled={quantity >= stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  (Max: {stockQuantity})
                </span>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
                >
                  {cartLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                
                <div className="flex space-x-3 sm:space-x-2">
                  <button 
                    className="btn-outline p-3 hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition flex-1 sm:flex-none"
                    title="Add to Wishlist"
                  >
                    <Heart className="w-5 h-5 mx-auto sm:mx-0" />
                  </button>
                  
                  <button 
                    className="btn-outline p-3 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 transition flex-1 sm:flex-none"
                    title="Chia sẻ"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: product.description,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Product link copied!');
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5 mx-auto sm:mx-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="bg-white border rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Details</h3>
            <dl className="space-y-0">
              {product.category_name && (
                <div className="flex flex-col sm:flex-row py-3 border-b hover:bg-gray-50 px-2 -mx-2">
                  <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-1 sm:mb-0">Category:</dt>
                  <dd className="text-sm text-gray-900 font-medium">{product.category_name}</dd>
                </div>
              )}
              {product.sku && (
                <div className="flex flex-col sm:flex-row py-3 border-b hover:bg-gray-50 px-2 -mx-2">
                  <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-1 sm:mb-0">SKU:</dt>
                  <dd className="text-sm text-gray-900">{product.sku}</dd>
                </div>
              )}
              <div className="flex flex-col sm:flex-row py-3 border-b hover:bg-gray-50 px-2 -mx-2">
                <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-1 sm:mb-0">Status:</dt>
                <dd className="text-sm">
                  <span className={`font-medium ${
                    stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row py-3 border-b hover:bg-gray-50 px-2 -mx-2">
                <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-1 sm:mb-0">Stock:</dt>
                <dd className="text-sm text-gray-900">{stockQuantity} items</dd>
              </div>
              {product.weight && (
                <div className="flex flex-col sm:flex-row py-3 border-b hover:bg-gray-50 px-2 -mx-2">
                  <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-1 sm:mb-0">Weight:</dt>
                  <dd className="text-sm text-gray-900">{product.weight} kg</dd>
                </div>
              )}
              {product.brand && (
                <div className="flex flex-col sm:flex-row py-3 border-b hover:bg-gray-50 px-2 -mx-2">
                  <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-1 sm:mb-0">Brand:</dt>
                  <dd className="text-sm text-gray-900">{product.brand}</dd>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-col sm:flex-row py-3 hover:bg-gray-50 px-2 -mx-2">
                  <dt className="text-sm text-gray-600 sm:w-40 font-medium mb-2 sm:mb-0">Tags:</dt>
                  <dd className="text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, idx) => (
                        <span key={idx} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && (() => {
        try {
          const specs = typeof product.specifications === 'string' 
            ? JSON.parse(product.specifications) 
            : product.specifications;
          
          if (Object.keys(specs).length === 0) return null;
          
          return (
            <div className="bg-white border rounded-lg p-4 sm:p-6 mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Specifications</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-1">
                {Object.entries(specs).map(([key, value], idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row py-3 border-b border-gray-200 hover:bg-gray-50 px-2 -mx-2">
                    <dt className="text-sm font-medium text-gray-700 sm:w-40 lg:w-48 flex-shrink-0 mb-1 sm:mb-0">{key}:</dt>
                    <dd className="text-sm text-gray-900 flex-1">{value}</dd>
                  </div>
                ))}
              </div>
            </div>
          );
        } catch (error) {
          console.error('Error parsing specifications:', error);
          return null;
        }
      })()}

      {/* Reviews Section */}
      <div className="border-t pt-8 sm:pt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Product Reviews</h2>
        
        {/* Review Summary */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                {reviewSummary.average_rating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(reviewSummary.average_rating)}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {reviewSummary.total_reviews} reviews
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = reviewSummary.rating_counts?.[rating] || 0;
                const percentage = reviewSummary.total_reviews > 0 
                  ? (count / reviewSummary.total_reviews) * 100 
                  : 0;
                
                return (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                    className={`flex items-center space-x-2 w-full hover:bg-gray-100 p-2 rounded text-sm sm:text-base ${
                      ratingFilter === rating ? 'bg-gray-200' : ''
                    }`}
                  >
                    <span className="font-medium w-12 text-left">{rating} stars</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-8 sm:w-12 text-right">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Write Review Button */}
        {isAuthenticated && !showReviewForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              Write a Review
            </button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {editingReview ? 'Edit Review' : 'Write Your Review'}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {reviewForm.rating} stars
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  rows={4}
                  required
                  minLength={10}
                  className="input"
                  placeholder="Share your experience with this product (minimum 10 characters)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewForm.comment.length}/10 minimum characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={createReviewMutation.isLoading || updateReviewMutation.isLoading || reviewForm.comment.length < 10}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createReviewMutation.isLoading || updateReviewMutation.isLoading 
                    ? 'Submitting...' 
                    : editingReview ? 'Update Review' : 'Submit Review'
                  }
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsLoading ? (
            <LoadingSpinner />
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {ratingFilter 
                ? `No ${ratingFilter} star reviews` 
                : 'No reviews yet. Be the first to review this product!'
              }
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {review.user_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    {/* User Name and Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Edit/Delete buttons for own reviews */}
                      {user && user.id === review.user_id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}

                    {/* Verified Purchase Badge */}
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="border-t pt-8 sm:pt-12 mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Related Products</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Similar products you might like</p>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {similarProducts.length} products
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {similarProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;