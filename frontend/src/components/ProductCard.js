import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

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
      <div className="card hover-lift transition-all duration-200 group-hover:shadow-lg">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock Status */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}

          {/* Quick Add to Cart */}
          {product.stock_quantity > 0 && (
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="absolute bottom-2 right-2 bg-primary-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary-700 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="card-content">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {renderStars(product.average_rating)}
              </div>
              <span className="text-sm text-gray-500">
                ({product.total_reviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {product.discount_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Category */}
          {product.categories && (
            <div className="text-xs text-gray-500 mb-2">
              {product.categories.name}
            </div>
          )}

          {/* Stock Info */}
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
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
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
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