import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Leaf, Package } from 'lucide-react';
import { STORAGE_KEYS } from '../utils/constants';
import { getCart } from '../features/cart/cartAPI';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

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

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    navigate('/');
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

                {/* Seller Links */}
                {user.role === 'SELLER' && (
                  <Link
                    to="/seller/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" /> My Products
                  </Link>
                )}

                {/* Admin Links */}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition"
                  >
                    ⚙️ Admin Panel
                  </Link>
                )}

                {/* Common User Links */}
                <Link
                  to="/profile"
                  className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition"
                >
                  👤 Profile
                </Link>

                {/* User Info & Logout */}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                  >
                    Logout
                  </button>
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
