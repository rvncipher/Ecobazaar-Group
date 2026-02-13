import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ClipboardList, BarChart3, Package, User, ShoppingBag, Menu } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive(path)
        ? 'bg-green-600 text-white shadow-md'
        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
    }`;
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 bottom-0 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out w-72 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name || 'User'}</h3>
              <p className="text-xs text-gray-600">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2 pb-32 overflow-y-auto">
          {/* Profile */}
          <Link to="/profile" className={linkClass('/profile')} onClick={onClose}>
            <User size={20} />
            <span className="font-medium">My Profile</span>
          </Link>

          {/* My Orders */}
          <Link to="/orders" className={linkClass('/orders')} onClick={onClose}>
            <ClipboardList size={20} />
            <span className="font-medium">My Orders</span>
          </Link>

          {/* Monthly Report - conditional based on user role */}
          {user.role === 'SELLER' ? (
            <Link to="/seller/report" className={linkClass('/seller/report')} onClick={onClose}>
              <BarChart3 size={20} />
              <span className="font-medium">Sales Report</span>
            </Link>
          ) : (
            <Link to="/monthly-report" className={linkClass('/monthly-report')} onClick={onClose}>
              <BarChart3 size={20} />
              <span className="font-medium">Eco Report</span>
            </Link>
          )}

          {/* Seller Section */}
          {user.role === 'SELLER' && (
            <>
              <div className="border-t pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                  Seller Dashboard
                </p>
              </div>

              <Link to="/seller/dashboard" className={linkClass('/seller/dashboard')} onClick={onClose}>
                <ShoppingBag size={20} />
                <span className="font-medium">My Products</span>
              </Link>

              <Link to="/seller/orders" className={linkClass('/seller/orders')} onClick={onClose}>
                <Package size={20} />
                <span className="font-medium">Manage Orders</span>
              </Link>
            </>
          )}

          {/* Admin Section */}
          {user.role === 'ADMIN' && (
            <>
              <div className="border-t pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                  Admin Panel
                </p>
              </div>

              <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')} onClick={onClose}>
                <Package size={20} />
                <span className="font-medium">Admin Dashboard</span>
              </Link>
            </>
          )}
        </nav>

        {/* Eco Score Display */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Eco Score</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-green-600">{user.ecoScore || 0}</span>
              <span className="text-sm text-gray-500">points</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${Math.min((user.ecoScore || 0) / 10, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Sidebar Toggle Button Component
export const SidebarToggle = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 lg:hidden bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all z-30 hover:scale-110"
      aria-label="Toggle Menu"
    >
      <Menu size={24} />
    </button>
  );
};

export default Sidebar;
