import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { formatPrice, getProductImageUrl } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && product?.id) {
      checkWishlist();
    }
  }, [isAuthenticated, product?.id]);

  // Guard clause for invalid product
  if (!product || !product.id) {
    return null;
  }

  const checkWishlist = async () => {
    try {
      const response = await api.get(`/wishlist/check/${product.id}`);
      setInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ProductCard: Adding to cart', { productId: product.id, isAuthenticated });
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product.id, 1);
    console.log('ProductCard: Add to cart result', result);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/product/${product.id}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist', { product_id: product.id });
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Unable to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }

    return stars;
  };

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const finalPrice = product.discount_price || product.price;

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="card hover-lift transition-all duration-200 group-hover:shadow-lg h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={getProductImageUrl(product)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`}
            />
          </button>

          {/* Stock Status */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm sm:text-base">Out of Stock</span>
            </div>
          )}

          {/* Quick Add to Cart */}
          {product.stock_quantity > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-primary-600 text-white p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary-700 disabled:opacity-50"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
              <div className="flex items-center">
                {renderStars(product.average_rating)}
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                ({product.total_reviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {product.discount_price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Category */}
          {product.categories && (
            <div className="text-xs text-gray-500 mb-1 sm:mb-2">
              {product.categories.name}
            </div>
          )}

          {/* Stock Info - Push to bottom */}
          <div className="flex items-center justify-between mt-auto">
            <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
              product.stock_quantity > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock_quantity > 0 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock_quantity > 10 
                ? 'In Stock' 
                : product.stock_quantity > 0 
                ? `Only ${product.stock_quantity} left`
                : 'Out of Stock'
              }
            </span>
            
            {product.is_featured && (
              <span className="text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;