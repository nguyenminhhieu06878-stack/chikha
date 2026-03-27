import React, { useState } from 'react';
import { Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const ReviewForm = ({ productId, onSuccess, onCancel, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(existingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of images
    if (images.length + files.length > 5) {
      setError('Bạn chỉ có thể upload tối đa 5 hình ảnh');
      return;
    }

    // Validate file size (5MB max)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Mỗi hình ảnh phải nhỏ hơn 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidTypes = files.filter(file => !validTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      setError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
      return;
    }

    setError('');
    setImages([...images, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('rating', rating);
      formData.append('comment', comment);

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      // Send request
      await api.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đánh giá của bạn *
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {rating} sao
          </span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhận xét của bạn *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          minLength={10}
          className="input"
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (tối thiểu 10 ký tự)..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/10 ký tự tối thiểu
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh (tùy chọn)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Tối đa 5 hình ảnh, mỗi ảnh không quá 5MB
        </p>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {imagePreviews.length < 5 && (
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click để chọn ảnh
              </p>
              <p className="text-xs text-gray-500">
                hoặc kéo thả ảnh vào đây
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || comment.length < 10}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
