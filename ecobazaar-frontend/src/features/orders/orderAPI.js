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
