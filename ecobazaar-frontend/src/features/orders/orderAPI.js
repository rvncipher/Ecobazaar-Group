import axiosInstance from '../../services/axiosInstance';
import { API_ENDPOINTS } from '../../utils/constants';

// Create order from cart (Checkout)
export const createOrder = async () => {
  const response = await axiosInstance.post(API_ENDPOINTS.ORDERS.BASE);
  return response.data;
};

// Get user's orders
export const getMyOrders = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.MY_ORDERS);
  return response.data;
};

// Get order by ID
export const getOrderById = async (orderId) => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await axiosInstance.put(API_ENDPOINTS.ORDERS.CANCEL(orderId));
  return response.data;
};

// Get user's total carbon impact
export const getMyCarbonImpact = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.CARBON_IMPACT);
  return response.data;
};

// ========== SELLER ENDPOINTS ==========

// Get seller's orders
export const getSellerOrders = async () => {
  const response = await axiosInstance.get('/orders/seller/my-orders');
  return response.data;
};

// Update order status (SELLER)
export const updateOrderStatusBySeller = async (orderId, status) => {
  const response = await axiosInstance.put(`/orders/seller/${orderId}/status`, { status });
  return response.data;
};

// ========== RETURN ENDPOINTS ==========

// Request return for an order
export const requestReturn = async (orderId, reason) => {
  const response = await axiosInstance.post(`/orders/${orderId}/return`, { reason });
  return response.data;
};

// Approve return request (SELLER)
export const approveReturn = async (orderId) => {
  const response = await axiosInstance.put(`/orders/seller/${orderId}/return/approve`);
  return response.data;
};

// Reject return request (SELLER)
export const rejectReturn = async (orderId) => {
  const response = await axiosInstance.put(`/orders/seller/${orderId}/return/reject`);
  return response.data;
};
