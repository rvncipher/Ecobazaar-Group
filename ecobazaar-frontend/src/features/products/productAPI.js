import axiosInstance from '../../services/axiosInstance';
import { API_ENDPOINTS } from '../../utils/constants';

// Get all approved products (PUBLIC)
export const getApprovedProducts = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.APPROVED);
  return response.data;
};

// Get product by ID (PUBLIC)
export const getProductById = async (id) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  return response.data;
};

// Search products (PUBLIC)
export const searchProducts = async (keyword) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
    params: { keyword },
  });
  return response.data;
};

// Get products by category (PUBLIC)
export const getProductsByCategory = async (category) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.CATEGORY(category));
  return response.data;
};

// Filter by eco-rating (PUBLIC)
export const getProductsByEcoRating = async (rating) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.ECO_RATING, {
    params: { rating },
  });
  return response.data;
};

// Get eco-certified products (PUBLIC)
export const getEcoCertifiedProducts = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.ECO_CERTIFIED);
  return response.data;
};

// Get products sorted by carbon impact (PUBLIC)
export const getEcoSortedProducts = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.ECO_SORTED);
  return response.data;
};

// Filter by price range (PUBLIC)
export const getProductsByPriceRange = async (min, max) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.PRICE_FILTER, {
    params: { min, max },
  });
  return response.data;
};

// Filter by max carbon impact (PUBLIC)
export const getProductsByMaxCarbon = async (max) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.CARBON_FILTER, {
    params: { max },
  });
  return response.data;
};

// Create product (SELLER)
export const createProduct = async (productData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.BASE, productData);
  return response.data;
};

// Get seller's own products (SELLER)
export const getMyProducts = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.MY_PRODUCTS);
  return response.data;
};

// Update product (SELLER)
export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData);
  return response.data;
};

// Delete product (SELLER)
export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  return response.data;
};

// Get all products including unapproved (ADMIN)
export const getAllProducts = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.ALL_PRODUCTS);
  return response.data;
};

// Get pending products (ADMIN)
export const getPendingProducts = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.PENDING_PRODUCTS);
  return response.data;
};

// Approve product (ADMIN)
export const approveProduct = async (id) => {
  const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.APPROVE(id));
  return response.data;
};

// Unapprove product (ADMIN)
export const unapproveProduct = async (id) => {
  const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.UNAPPROVE(id));
  return response.data;
};

// Set eco-certification (ADMIN)
export const setEcoCertification = async (id, certified) => {
  const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.ECO_CERTIFY(id), null, {
    params: { certified },
  });
  return response.data;
};
