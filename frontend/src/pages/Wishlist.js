import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Không thể xóa khỏi wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.product_id, 1);
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-600 mb-6">
          Bạn cần đăng nhập để xem danh sách yêu thích
        </p>
        <Link to="/login" className="btn-primary">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Danh sách yêu thích
          </h1>
        </div>
        <span className="text-gray-600">
          {wishlist.length} sản phẩm
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có sản phẩm yêu thích
          </h2>
          <p className="text-gray-600 mb-6">
            Thêm sản phẩm vào danh sách yêu thích để xem sau
          </p>
          <Link to="/products" className="btn-primary">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="card group">
              <div className="relative">
                <Link to={`/products/${item.product_id}`}>
                  <img
                    src={item.image_url || 'https://via.placeholder.com/300'}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Xóa khỏi wishlist"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <Link to={`/products/${item.product_id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {item.price?.toLocaleString('vi-VN')}₫
                  </span>
                  {item.category_name && (
                    <span className="text-sm text-gray-500">
                      {item.category_name}
                    </span>
                  )}
                </div>

                {item.stock_quantity > 0 ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Thêm vào giỏ</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn-outline w-full opacity-50 cursor-not-allowed"
                  >
                    Hết hàng
                  </button>
                )}

                <p className="text-xs text-gray-500 mt-2 text-center">
                  Đã thêm: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
