import React, { useState } from 'react';
import { Star, Image as ImageIcon } from 'lucide-react';
import { formatDateTime } from '../services/api';

const ReviewItem = ({ review }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getImageUrl = (url) => {
    // If URL starts with http, return as is
    if (url.startsWith('http')) {
      return url;
    }
    // Otherwise, prepend backend URL
    return `http://localhost:3001${url}`;
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
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
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm text-gray-500">
                  {formatDateTime(review.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 mb-3">{review.comment}</p>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {review.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verified Purchase Badge */}
          {review.is_verified_purchase && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Đã mua hàng
            </span>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getImageUrl(selectedImage)}
              alt="Review"
              className="max-w-full max-h-screen object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
