import axiosInstance from '../../services/axiosInstance';
import { API_ENDPOINTS } from '../../utils/constants';

// Get user's cart
export const getCart = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CART.BASE);
  return response.data;
};

// Add product to cart
export const addToCart = async (productId, quantity = 1) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CART.ITEMS, {
    productId,
    quantity,
  });
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await axiosInstance.put(
    API_ENDPOINTS.CART.UPDATE_ITEM(cartItemId),
    { quantity }
  );
  return response.data;
};

// Remove item from cart
export const removeCartItem = async (cartItemId) => {
  const response = await axiosInstance.delete(
    API_ENDPOINTS.CART.REMOVE_ITEM(cartItemId)
  );
  return response.data;
};

// Clear cart
export const clearCart = async () => {
  const response = await axiosInstance.delete(API_ENDPOINTS.CART.BASE);
  return response.data;
};

// Get cart item count
export const getCartItemCount = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CART.COUNT);
  return response.data.count;
};
