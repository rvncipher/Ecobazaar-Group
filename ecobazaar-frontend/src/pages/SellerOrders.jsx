import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerOrders, updateOrderStatusBySeller, approveReturn, rejectReturn } from '../features/orders/orderAPI';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { Package, Calendar, DollarSign, Leaf, CheckCircle, Clock, Truck, Ban, AlertTriangle, ArrowRight } from 'lucide-react';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingOrder, setProcessingOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!newStatus || newStatus === '') {
      return;
    }
    
    if (!window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) {
      return;
    }

    try {
      setProcessingOrder(orderId);
      await updateOrderStatusBySeller(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleApproveReturn = async (orderId) => {
    if (!window.confirm('Approve this return request? Stock will be restored and user eco score will be adjusted.')) {
      return;
    }

    try {
      setProcessingOrder(orderId);
      await approveReturn(orderId);
      await fetchOrders();
      alert('Return approved successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve return');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleRejectReturn = async (orderId) => {
    if (!window.confirm('Reject this return request?')) {
      return;
    }

    try {
      setProcessingOrder(orderId);
      await rejectReturn(orderId);
      await fetchOrders();
      alert('Return rejected successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject return');
    } finally {
      setProcessingOrder(null);
    }
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

  const getAvailableStatuses = (currentStatus) => {
    // Don't allow changing status if already delivered or cancelled
    if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
      return [];
    }
    
    const allStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    // Filter out current status
    return allStatuses.filter(status => status !== currentStatus);
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

  const canUpdateStatus = (status) => {
    return status !== 'DELIVERED' && status !== 'CANCELLED';
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Manage Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and update order status for your products</p>
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
            <p className="text-gray-500">Orders containing your products will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
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
                      {canUpdateStatus(order.status) && (
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={processingOrder === order.id}
                            className="px-4 py-2 pr-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer font-medium appearance-none"
                          >
                            <option value="" disabled>Change Status</option>
                            {getAvailableStatuses(order.status).map((status) => (
                              <option key={status} value={status} className="bg-white text-gray-900">
                                {status}
                              </option>
                            ))}
                          </select>
                          <ArrowRight className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Return Request Banner */}
                {order.returnRequested && (
                  <div className={`p-4 ${
                    order.returnStatus === 'PENDING' ? 'bg-yellow-50 border-b border-yellow-200' :
                    order.returnStatus === 'APPROVED' ? 'bg-green-50 border-b border-green-200' :
                    'bg-red-50 border-b border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <AlertTriangle className="w-5 h-5" />
                          <span>Return Request {order.returnStatus}</span>
                        </div>
                        <p className="text-sm mt-1"><strong>Reason:</strong> {order.returnReason}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Requested on: {formatDate(order.returnRequestDate)}
                        </p>
                      </div>
                      {order.returnStatus === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveReturn(order.id)}
                            disabled={processingOrder === order.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleRejectReturn(order.id)}
                            disabled={processingOrder === order.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">Customer: {order.user.name}</h3>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>

                  {/* Order Items */}
                  <div className="grid gap-3 mt-4">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 border rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.imageUrl || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Price:</span> ₹{item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600">Subtotal</div>
                          <div className="text-lg font-bold text-gray-900">
                            ₹{item.subtotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                            <Leaf className="w-3 h-3" />
                            {item.totalCarbon.toFixed(2)} kg CO₂
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Total Carbon:</span>
                          <span className="text-orange-600 font-semibold">{order.totalCarbon.toFixed(2)} kg CO₂</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span>Total: ₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Status */}
                  {order.deliveredDate && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Delivered on {formatDate(order.deliveredDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default SellerOrders;
