import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowRight, Star, TrendingUp, Users } from 'lucide-react';
import { productsAPI, categoriesAPI, recommendationsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  // Fetch featured products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    'featured-products',
    () => productsAPI.getProducts({ limit: 8, is_featured: true }),
    { staleTime: 5 * 60 * 1000 }
  );

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => categoriesAPI.getCategories(),
    { staleTime: 10 * 60 * 1000 }
  );

  // Fetch trending products
  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    'trending-products',
    () => recommendationsAPI.getTrendingProducts({ limit: 6 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];
  const trendingProducts = trendingData?.data?.data || [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative">
        <div className="banner-container">
          <img
            src="/banner.png"
            alt="E-commerce Banner"
            className="w-full h-auto object-cover"
          />
          {/* Optional overlay content */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 drop-shadow-lg">
                Discover Amazing Products
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 drop-shadow-lg max-w-3xl mx-auto">
                Smart search, honest reviews, and personalized recommendations 
                to help you find exactly what you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="btn bg-white text-gray-900 hover:bg-gray-100 px-6 md:px-8 py-2 md:py-3 text-base md:text-lg">
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <Link to="/search" className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 md:px-8 py-2 md:py-3 text-base md:text-lg">
                  Explore Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose E-Store?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built the perfect shopping experience with cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find products instantly with our ElasticSearch-powered search engine
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Honest Reviews</h3>
              <p className="text-gray-600">
                Real reviews from verified customers to help you make informed decisions
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600">
                Get product recommendations tailored to your preferences and history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Categories
              <ArrowRight className="inline ml-1 w-4 h-4" />
            </Link>
          </div>
          
          {categoriesLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group text-center hover-lift"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={category.image_url || 'https://via.placeholder.com/200'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Products
              <ArrowRight className="inline ml-1 w-4 h-4" />
            </Link>
          </div>
          
          {productsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="product-grid">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
            <Link to="/products?sort_by=trending" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Trending
              <ArrowRight className="inline ml-1 w-4 h-4" />
            </Link>
          </div>
          
          {trendingLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="product-grid">
              {trendingProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new products, 
            special offers, and exclusive deals.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
            />
            <button className="btn bg-white text-blue-600 hover:bg-gray-100 px-6 py-3">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;