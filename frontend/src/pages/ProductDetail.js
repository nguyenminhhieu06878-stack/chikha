import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Star, ShoppingCart, Heart, Share2, Plus, Minus } from 'lucide-react';
import { productsAPI, recommendationsAPI } from '../services/api';
import { formatPrice } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  // Fetch product details
  const { data: productData, isLoading: productLoading } = useQuery(
    ['product', id],
    () => productsAPI.getProduct(id),
    {
      onSuccess: (data) => {
        // Track view for recommendations
        if (data?.data?.id) {
          recommendationsAPI.trackView(data.data.id).catch(() => {});
        }
      }
    }
  );

  // Fetch similar products
  const { data: similarData, isLoading: similarLoading } = useQuery(
    ['similar-products', id],
    () => recommendationsAPI.getSimilarProducts(id, { limit: 4 }),
    { enabled: !!id }
  );

  const product = productData?.data;
  const similarProducts = similarData?.data?.data || [];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available`);
      return;
    }

    await addToCart(product.id, quantity);
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const images = product.images || ['https://via.placeholder.com/600'];
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const finalPrice = product.discount_price || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.categories && (
              <p className="text-primary-600 mt-2">{product.categories.name}</p>
            )}
          </div>

          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(product.average_rating)}
              </div>
              <span className="text-lg font-medium">{product.average_rating}</span>
              <span className="text-gray-500">({product.total_reviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {product.discount_price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-semibold">
                  -{discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {product.stock_quantity > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
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
                
                <button className="btn-outline p-3">
                  <Heart className="w-5 h-5" />
                </button>
                
                <button className="btn-outline p-3">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <dl className="space-y-2">
              {product.sku && (
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">SKU:</dt>
                  <dd className="text-sm text-gray-900">{product.sku}</dd>
                </div>
              )}
              {product.weight && (
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">Weight:</dt>
                  <dd className="text-sm text-gray-900">{product.weight} kg</dd>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">Tags:</dt>
                  <dd className="text-sm text-gray-900">
                    {product.tags.join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Products</h2>
          {similarLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="product-grid">
              {similarProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;