import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchAPI } from '../services/api';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length > 1) {
      debounceRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const response = await searchAPI.getSuggestions(query);
          setSuggestions(response.data.data || { products: [], categories: [] });
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions({ products: [], categories: [] });
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions({ products: [], categories: [] });
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setQuery('');
      onSearch && onSearch();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion, type = 'product') => {
    if (type === 'product') {
      navigate(`/products/${suggestion.id}`);
    } else if (type === 'category') {
      navigate(`/category/${suggestion.slug}`);
    } else {
      setQuery(suggestion);
      handleSearch(suggestion);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions({ products: [], categories: [] });
    setShowSuggestions(false);
  };

  const hasResults = suggestions.products?.length > 0 || suggestions.categories?.length > 0;

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length > 1 && setShowSuggestions(true)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="loading-spinner mx-auto"></div>
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {/* Product Suggestions */}
              {suggestions.products?.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Products
                  </div>
                  <ul>
                    {suggestions.products.map((product) => (
                      <li key={product.id}>
                        <button
                          onClick={() => handleSuggestionClick(product, 'product')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{product.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Suggestions */}
              {suggestions.categories?.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-t">
                    Categories
                  </div>
                  <ul>
                    {suggestions.categories.map((category) => (
                      <li key={category.slug}>
                        <button
                          onClick={() => handleSuggestionClick(category, 'category')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : query.trim().length > 1 ? (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;