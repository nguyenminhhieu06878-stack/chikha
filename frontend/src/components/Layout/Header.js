import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import SearchBar from '../SearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const cartCount = getCartCount();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-40 w-auto object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="text-xl sm:text-2xl font-bold text-blue-600 hidden">E-Store</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
            <SearchBar />
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/products" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="p-2 text-gray-700 hover:text-blue-600 transition-colors" title="Wishlist">
                  <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors" title="Cart">
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                    <User className="w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="hidden lg:block text-sm">{user?.full_name || 'User'}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Orders
                      </Link>
                      <Link to="/addresses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Addresses
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-3 py-1.5 lg:px-4 lg:py-2">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart Icon */}
          {isAuthenticated && (
            <Link to="/cart" className="md:hidden relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-gray-200">
            <SearchBar />
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="py-2 space-y-1">
              <Link
                to="/products"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/addresses"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Addresses
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-blue-600 hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;