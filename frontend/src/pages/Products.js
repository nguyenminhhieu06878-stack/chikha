import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Products = () => {
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', filters, page],
    () => productsAPI.getProducts({ ...filters, page, limit: 12 }),
    { keepPreviousData: true }
  );

  // Fetch categories for filter
  const { data: categoriesData } = useQuery(
    'categories',
    () => categoriesAPI.getCategories(),
    { staleTime: 10 * 60 * 1000 }
  );

  const products = productsData?.data?.data || [];
  const pagination = productsData?.data?.pagination || {};
  const categories = categoriesData?.data?.data || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      min_rating: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setPage(1);
  };

  const sortOptions = [
    { value: 'created_at:desc', label: 'Newest First' },
    { value: 'created_at:asc', label: 'Oldest First' },
    { value: 'price:asc', label: 'Price: Low to High' },
    { value: 'price:desc', label: 'Price: High to Low' },
    { value: 'average_rating:desc', label: 'Highest Rated' },
    { value: 'name:asc', label: 'Name: A to Z' },
  ];

  const handleSortChange = (value) => {
    const [sort_by, sort_order] = value.split(':');
    setFilters(prev => ({ ...prev, sort_by, sort_order }));
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {pagination.total ? `${pagination.total} products found` : 'Loading products...'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Sort */}
          <div className="relative">
            <select
              value={`${filters.sort_by}:${filters.sort_order}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input pr-8 appearance-none cursor-pointer text-sm sm:text-base w-full sm:w-auto"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 flex-1 sm:flex-none ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 flex-1 sm:flex-none ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5 mx-auto" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center justify-center space-x-2 py-2"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm sm:text-base">Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input w-full text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="input flex-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="input flex-1 text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => handleFilterChange('min_rating', e.target.value)}
                  className="input w-full text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {productsLoading ? (
            <LoadingSpinner />
          ) : products.length > 0 ? (
            <>
              <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-2 mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1 order-first sm:order-none">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.total_pages}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <button
                onClick={clearFilters}
                className="btn-primary mt-4"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;