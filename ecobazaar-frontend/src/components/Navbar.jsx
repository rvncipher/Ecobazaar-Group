import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Leaf, ChevronDown, User, Package, BarChart3, ShoppingBag, Shield } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/constants';
import { getCart } from '../features/cart/cartAPI';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        try {
          const cart = await getCart();
          setCartItemCount(cart.totalItems || 0);
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      }
    };

    fetchCartCount();
    
    // Poll every 30 seconds to update cart count
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-green-600">
            <Leaf className="w-8 h-8" />
            EcoBazaar
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {/* User is NOT logged in */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-gray-700 hover:text-green-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* User is logged in */}
            {user && (
              <>
                {/* Products Link - Visible to all logged-in users */}
                <Link
                  to="/products"
                  className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Products
                </Link>

                {/* Cart Link with Badge */}
                <Link
                  to="/cart"
                  className="relative px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition flex items-center gap-2"
                >
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-600">Eco Score:</span>
                          <span className="text-sm font-bold text-green-600">{user.ecoScore || 0} pts</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                        >
                          <User size={18} />
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={closeDropdown}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                        >
                          <Package size={18} />
                          <span className="font-medium">My Orders</span>
                        </Link>

                        {/* Monthly Report - conditional based on user role */}
                        {user.role === 'SELLER' ? (
                          <Link
                            to="/seller/report"
                            onClick={closeDropdown}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                          >
                            <BarChart3 size={18} />
                            <span className="font-medium">Sales Report</span>
                          </Link>
                        ) : (
                          <Link
                            to="/monthly-report"
                            onClick={closeDropdown}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                          >
                            <BarChart3 size={18} />
                            <span className="font-medium">Eco Report</span>
                          </Link>
                        )}

                        {/* Seller Section */}
                        {user.role === 'SELLER' && (
                          <>
                            <div className="border-t border-gray-200 my-1"></div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Seller Dashboard
                            </div>
                            <Link
                              to="/seller/dashboard"
                              onClick={closeDropdown}
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                            >
                              <ShoppingBag size={18} />
                              <span className="font-medium">My Products</span>
                            </Link>

                            <Link
                              to="/seller/orders"
                              onClick={closeDropdown}
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                            >
                              <Package size={18} />
                              <span className="font-medium">Manage Orders</span>
                            </Link>
                          </>
                        )}

                        {/* Admin Section */}
                        {user.role === 'ADMIN' && (
                          <>
                            <div className="border-t border-gray-200 my-1"></div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Admin Panel
                            </div>
                            <Link
                              to="/admin/dashboard"
                              onClick={closeDropdown}
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition"
                            >
                              <Shield size={18} />
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>
                          </>
                        )}

                        {/* Logout */}
                        <div className="border-t border-gray-200 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium text-left"
                          >
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
