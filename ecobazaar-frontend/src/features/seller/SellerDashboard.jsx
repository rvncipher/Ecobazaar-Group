import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, CheckCircle, Clock, PlusCircle, Edit2, Trash2, BarChart3, Filter, FileText, ShoppingCart } from 'lucide-react';
import Layout from '../../components/Layout';
import ProductList from '../../features/products/ProductList';
import { getMyProducts, deleteProduct } from '../../features/products/productAPI';
import { STORAGE_KEYS, PRODUCT_CATEGORIES } from '../../utils/constants';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Check if user is seller
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'SELLER') {
      navigate('/');
      return;
    }

    setUser(parsedUser);
    fetchMyProducts();
  }, [navigate]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const data = await getMyProducts();
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

  const handleAddProduct = () => {
    navigate('/seller/product/new');
  };

  const handleEdit = (product) => {
    navigate(`/seller/product/edit/${product.id}`);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      toast.success('Product deleted successfully!');
      fetchMyProducts(); // Refresh list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const approvedCount = products.filter(p => p.approved).length;
  const pendingCount = products.filter(p => !p.approved).length;

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Stats Overview */}
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

          <div 
            onClick={() => setStatusFilter('pending')}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Awaiting Approval</p>
                <p className="text-4xl font-bold mt-1">{pendingCount}</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/seller/orders')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">View Orders</h3>
                <p className="text-sm text-gray-600">See all orders containing your products</p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>

          <button
            onClick={() => navigate('/seller/report')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">Monthly Report</h3>
                <p className="text-sm text-gray-600">View sales analytics and carbon impact</p>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">My Products by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRODUCT_CATEGORIES.map((category) => {
              const hasProducts = categoryStats[category.value]?.total > 0;
              return (
                <button
                  key={category.value}
                  onClick={() => hasProducts && setCategoryFilter(categoryFilter === category.value ? 'all' : category.value)}
                  disabled={!hasProducts}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    !hasProducts 
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : categoryFilter === category.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{category.label}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600">Total: {categoryStats[category.value]?.total || 0}</span>
                    </div>
                    {hasProducts && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-yellow-600 font-medium text-xs">
                          ⏳ {categoryStats[category.value]?.pending || 0}
                        </span>
                        <span className="text-green-600 font-medium text-xs">
                          ✓ {categoryStats[category.value]?.approved || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
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
              onClick={() => setStatusFilter('approved')}
              className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === 'approved'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Approved ({approvedCount})
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
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
                            <CheckCircle className="w-3 h-3" /> Live
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-xs flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-xs flex items-center gap-1"
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
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">
              {products.length === 0 
                ? "You haven't added any products yet" 
                : "No products match the selected filters"}
            </p>
            {products.length === 0 && (
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellerDashboard;
