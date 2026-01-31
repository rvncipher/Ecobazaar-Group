import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, Clock, CheckCircle, XCircle, Filter, BarChart3, Users, Ban, Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getAllProducts, approveProduct, unapproveProduct } from '../../features/products/productAPI';
import { getAllSellers, getRegularUsers, getUserStatistics, banUser, unbanUser, deleteUser } from './adminAPI';
import { STORAGE_KEYS, PRODUCT_CATEGORIES } from '../../utils/constants';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // User management state
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'users', 'sellers'
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [userFilter, setUserFilter] = useState('all'); // 'all', 'active', 'banned'

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    fetchProducts();
    fetchUsers();
    fetchSellers();
    fetchUserStats();
  }, [navigate]);

  useEffect(() => {
    // Apply filters
    let filtered = products;
    
    // Status filter
    if (statusFilter === 'pending') {
      filtered = filtered.filter(p => !p.approved);
    } else if (statusFilter === 'approved') {
      filtered = filtered.filter(p => p.approved);
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [statusFilter, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getRegularUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSellers = async () => {
    try {
      const data = await getAllSellers();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await getUserStatistics();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId);
      toast.success('Product approved successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    }
  };

  const handleUnapprove = async (productId) => {
    try {
      await unapproveProduct(productId);
      toast.success('Product unapproved successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error unapproving product:', error);
      toast.error('Failed to unapprove product');
    }
  };

  const handleBanUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to ban ${userName}?`)) {
      try {
        await banUser(userId);
        toast.success(`${userName} has been banned successfully!`);
        fetchUsers();
        fetchSellers();
        fetchUserStats();
      } catch (error) {
        console.error('Error banning user:', error);
        toast.error(error.response?.data || 'Failed to ban user');
      }
    }
  };

  const handleUnbanUser = async (userId, userName) => {
    try {
      await unbanUser(userId);
      toast.success(`${userName} has been unbanned successfully!`);
      fetchUsers();
      fetchSellers();
      fetchUserStats();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone!`)) {
      try {
        await deleteUser(userId);
        toast.success(`${userName} has been deleted successfully!`);
        fetchUsers();
        fetchSellers();
        fetchUserStats();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data || 'Failed to delete user');
      }
    }
  };

  const pendingCount = products.filter(p => !p.approved).length;
  const approvedCount = products.filter(p => p.approved).length;

  // Category statistics
  const getCategoryStats = () => {
    const stats = {};
    PRODUCT_CATEGORIES.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat.value);
      stats[cat.value] = {
        total: catProducts.length,
        pending: catProducts.filter(p => !p.approved).length,
        approved: catProducts.filter(p => p.approved).length
      };
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  // Filter users based on status
  const getFilteredUsers = (userList) => {
    if (userFilter === 'banned') {
      return userList.filter(u => u.banned);
    } else if (userFilter === 'active') {
      return userList.filter(u => !u.banned);
    }
    return userList;
  };

  const filteredUsers = getFilteredUsers(users);
  const filteredSellers = getFilteredUsers(sellers);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
          <p className="text-gray-600">Manage product approvals, users, and monitor platform activity</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'products'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              Product Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'users'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'sellers'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Seller Management
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                <p className="text-4xl font-bold mt-1">{products.length}</p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('pending')}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Approval</p>
                <p className="text-4xl font-bold mt-1">{pendingCount}</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('approved')}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved</p>
                <p className="text-4xl font-bold mt-1">{approvedCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Approval Rate</p>
                <p className="text-4xl font-bold mt-1">
                  {products.length > 0 ? Math.round((approvedCount / products.length) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>
        )}

        {/* User Stats Overview */}
        {(activeTab === 'users' || activeTab === 'sellers') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-1">{userStats.totalUsers || 0}</p>
              </div>
              <Users className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Sellers</p>
                <p className="text-4xl font-bold mt-1">{userStats.totalSellers || 0}</p>
              </div>
              <BarChart3 className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Accounts</p>
                <p className="text-4xl font-bold mt-1">{userStats.activeCount || 0}</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Banned Accounts</p>
                <p className="text-4xl font-bold mt-1">{userStats.bannedCount || 0}</p>
              </div>
              <Ban className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>
        )}

        {/* Product Management View */}
        {activeTab === 'products' && (
        <>
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRODUCT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(categoryFilter === category.value ? 'all' : category.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  categoryFilter === category.value
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm mb-1">{category.label}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600">Total: {categoryStats[category.value]?.total || 0}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-yellow-600 font-medium text-xs">
                      ⏳ {categoryStats[category.value]?.pending || 0}
                    </span>
                    <span className="text-green-600 font-medium text-xs">
                      ✓ {categoryStats[category.value]?.approved || 0}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'approved'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
          
          {categoryFilter !== 'all' && (
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {/* Products List View */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{product.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-green-600">Rs {product.price}</span>
                      </td>
                      <td className="px-4 py-3">
                        {product.approved ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {product.approved ? (
                            <button
                              onClick={() => handleUnapprove(product.id)}
                              className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-xs flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(product.id)}
                              className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-xs flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>
                {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => (
                    <span key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-lg text-gray-500">Loading products...</div>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No products found in this category</p>
          </div>
        )}
        </>
        )}

        {/* User Management View */}
        {activeTab === 'users' && (
        <>
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setUserFilter('all')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              userFilter === 'all'
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setUserFilter('active')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              userFilter === 'active'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Active ({users.filter(u => !u.banned).length})
          </button>
          <button
            onClick={() => setUserFilter('banned')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              userFilter === 'banned'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Banned ({users.filter(u => u.banned).length})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Eco Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-600">{user.ecoScore}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.banned ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {user.banned ? (
                          <button
                            onClick={() => handleUnbanUser(user.id, user.name || user.email)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-xs"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user.id, user.name || user.email)}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium text-xs flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" /> Ban
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No users found</p>
            </div>
          )}
        </div>
        </>
        )}

        {/* Seller Management View */}
        {activeTab === 'sellers' && (
        <>
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setUserFilter('all')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              userFilter === 'all'
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            All ({sellers.length})
          </button>
          <button
            onClick={() => setUserFilter('active')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              userFilter === 'active'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Active ({sellers.filter(s => !s.banned).length})
          </button>
          <button
            onClick={() => setUserFilter('banned')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              userFilter === 'banned'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Banned ({sellers.filter(s => s.banned).length})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Verified</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">{seller.name || 'Seller'}</p>
                        <p className="text-xs text-gray-500">ID: {seller.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{seller.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      {seller.verified ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {seller.banned ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {seller.banned ? (
                          <button
                            onClick={() => handleUnbanUser(seller.id, seller.name || seller.email)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-xs"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(seller.id, seller.name || seller.email)}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium text-xs flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" /> Ban
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(seller.id, seller.name || seller.email)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSellers.length === 0 && (
            <div className="text-center py-16">
              <BarChart3 className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No sellers found</p>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
