import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, cancelOrder, requestReturn } from '../features/orders/orderAPI';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import EcoRatingBadge from '../components/EcoRatingBadge';
import CarbonBadge from '../components/CarbonBadge';
import { Package, Calendar, DollarSign, XCircle, CheckCircle, Clock, Truck, Ban, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight, Award, Trophy, Info } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [showEcoCalculation, setShowEcoCalculation] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(orderId);
      await cancelOrder(orderId);
      await fetchOrders(); // Refresh orders list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const handleRequestReturn = async (orderId) => {    const reason = prompt('Please enter the reason for return:');
    
    if (!reason || reason.trim() === '') {
      alert('Return reason is required');
      return;
    }

    try {
      setReturningOrder(orderId);
      await requestReturn(orderId, reason);
      await fetchOrders();
      alert('Return request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request return');
    } finally {
      setReturningOrder(null);
    }
  };

  const canRequestReturn = (order) => {
    if (order.status !== 'DELIVERED') return false;
    if (order.returnRequested) return false;
    
    // Check if within 7 days of delivery
    const deliveredDate = new Date(order.deliveredDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return deliveredDate > sevenDaysAgo;
  };

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrdersPerPageChange = (e) => {
    setOrdersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <Ban className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate eco score for an order (matches backend logic)
  const calculateOrderEcoScore = (order) => {
    // Only calculate for DELIVERED orders
    if (order.status !== 'DELIVERED') {
      return null;
    }

    let score = 10; // Base points per order

    // Convert eco rating to score
    const convertEcoRatingToScore = (ecoRating) => {
      switch (ecoRating) {
        case 'ECO_FRIENDLY': return 5;
        case 'MODERATE': return 3;
        case 'HIGH_IMPACT': return 1;
        default: return 2;
      }
    };

    let avgEcoRatingScore = 0;
    let avgCarbon = 0;
    let ecoCertifiedCount = 0;

    order.orderItems.forEach(item => {
      avgEcoRatingScore += convertEcoRatingToScore(item.product.ecoRating) * item.quantity;
      avgCarbon += item.totalCarbon;
      if (item.product.ecoCertified) {
        ecoCertifiedCount += item.quantity;
      }
    });

    avgEcoRatingScore = avgEcoRatingScore / order.totalItems;
    avgCarbon = avgCarbon / order.totalItems;

    // Eco rating bonus (max 25 points)
    score += Math.floor(avgEcoRatingScore * 5);

    // Carbon reduction bonus (20 points if avg < 5kg per item)
    if (avgCarbon < 5.0) {
      score += 20;
    }

    // Eco-certified bonus (15 points per certified product)
    score += ecoCertifiedCount * 15;

    return score;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-green-600" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Your order history will appear here</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Orders Per Page Selector */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Orders per page:</label>
                <select
                  value={ordersPerPage}
                  onChange={handleOrdersPerPageChange}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
            {currentOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(order.orderDate)}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        Order #{order.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-xl font-bold text-green-600">
                          ₹{order.totalPrice.toFixed(2)}
                        </div>
                      </div>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelling === order.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          {cancelling === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="grid gap-4">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/products/${item.product.id}`)}
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.imageUrl || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.product.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <EcoRatingBadge ecoRating={item.product.ecoRating} />
                            {item.product.ecoCertified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                ✓ Eco-Certified
                              </span>
                            )}
                            <CarbonBadge carbonImpact={item.carbonImpact} ecoRating={item.product.ecoRating} size="small" />
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Price:</span> ₹{item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="flex flex-col items-end justify-between">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Subtotal</div>
                            <div className="text-lg font-bold text-gray-900">
                              ₹{item.subtotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}</span>
                        </div>
                        {calculateOrderEcoScore(order) !== null && (
                          <div className="flex items-center gap-2 text-gray-600 relative">
                            <Trophy className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">Eco Points Earned:</span>
                            <span className="text-green-600 font-semibold">
                              +{calculateOrderEcoScore(order)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEcoCalculation(prev => ({...prev, [order.id]: !prev[order.id]}));
                              }}
                              className="ml-1 text-blue-500 hover:text-blue-700 transition"
                              title="View calculation details"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            
                            {/* Calculation Details Tooltip */}
                            {showEcoCalculation[order.id] && (
                              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-96 text-sm">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold text-gray-900">Eco Points Calculation</h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowEcoCalculation(prev => ({...prev, [order.id]: false}));
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="space-y-2 text-gray-700">
                                  <div className="flex justify-between border-b pb-1">
                                    <span>Base Points (per order):</span>
                                    <span className="font-semibold">+10</span>
                                  </div>
                                  <div className="flex justify-between border-b pb-1">
                                    <span>Eco Rating Bonus:</span>
                                    <span className="font-semibold">
                                      +{(() => {
                                        let avgScore = 0;
                                        order.orderItems.forEach(item => {
                                          const score = item.product.ecoRating === 'ECO_FRIENDLY' ? 5 : 
                                                       item.product.ecoRating === 'MODERATE' ? 3 : 1;
                                          avgScore += score * item.quantity;
                                        });
                                        avgScore = avgScore / order.totalItems;
                                        return Math.floor(avgScore * 5);
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b pb-1">
                                    <span>Carbon Reduction Bonus:</span>
                                    <span className="font-semibold">
                                      {(order.totalCarbon / order.totalItems) < 5 ? '+20' : '+0'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b pb-1">
                                    <span>Eco-Certified Products:</span>
                                    <span className="font-semibold">
                                      +{order.orderItems.reduce((sum, item) => 
                                        sum + (item.product.ecoCertified ? item.quantity * 15 : 0), 0
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 font-bold text-green-600">
                                    <span>Total Points:</span>
                                    <span>+{calculateOrderEcoScore(order)}</span>
                                  </div>
                                </div>
                                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-600">
                                  <strong>Note:</strong> Points are awarded only when order is delivered.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <span>Total: ₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Status */}
                  {order.deliveredDate && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Delivered on {formatDate(order.deliveredDate)}</span>
                        </div>
                        {canRequestReturn(order) && (
                          <button
                            onClick={() => handleRequestReturn(order.id)}
                            disabled={returningOrder === order.id}
                            className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {returningOrder === order.id ? 'Processing...' : 'Request Return'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Return Status */}
                  {order.returnRequested && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      order.returnStatus === 'PENDING' ? 'bg-yellow-50 border border-yellow-200' :
                      order.returnStatus === 'APPROVED' ? 'bg-green-50 border border-green-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          order.returnStatus === 'PENDING' ? 'text-yellow-600' :
                          order.returnStatus === 'APPROVED' ? 'text-green-600' :
                          'text-red-600'
                        }`} />
                        <div className="flex-grow">
                          <div className="font-semibold">
                            Return Request {order.returnStatus}
                          </div>
                          <p className="text-sm mt-1"><strong>Reason:</strong> {order.returnReason}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Requested on: {formatDate(order.returnRequestDate)}
                          </p>
                          {order.returnResolvedDate && (
                            <p className="text-xs text-gray-600">
                              Resolved on: {formatDate(order.returnResolvedDate)}
                            </p>
                          )}
                          {order.returnStatus === 'APPROVED' && (
                            <p className="text-sm text-green-700 font-medium mt-2">
                              ✓ Your return has been approved. Refund will be processed soon.
                            </p>
                          )}
                          {order.returnStatus === 'REJECTED' && (
                            <p className="text-sm text-red-700 font-medium mt-2">
                              ✗ Your return request was rejected.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg transition ${
                          currentPage === pageNumber
                            ? 'bg-green-600 text-white font-semibold'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
