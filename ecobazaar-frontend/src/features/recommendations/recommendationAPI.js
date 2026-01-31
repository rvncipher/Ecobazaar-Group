import axiosInstance from '../../services/axiosInstance';
import { API_ENDPOINTS } from '../../utils/constants';

// Get greener alternatives for a product
export const getGreenerAlternatives = async (productId) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.RECOMMENDATIONS.ALTERNATIVES(productId)
  );
  return response.data;
};

// Get similar products
export const getSimilarProducts = async (productId, limit = 5) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.RECOMMENDATIONS.SIMILAR(productId),
    { params: { limit } }
  );
  return response.data;
};

// Get eco-friendly recommendations
export const getEcoFriendlyRecommendations = async (limit = 10) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.RECOMMENDATIONS.ECO_FRIENDLY,
    { params: { limit } }
  );
  return response.data;
};

// Get best eco-value products
export const getBestEcoValueProducts = async (category = null, limit = 10) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.RECOMMENDATIONS.BEST_ECO_VALUE,
    { params: { category, limit } }
  );
  return response.data;
};

// Calculate carbon savings
export const calculateCarbonSavings = async (currentProductId, alternativeProductId, quantity) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.RECOMMENDATIONS.CARBON_SAVINGS,
    { params: { currentProductId, alternativeProductId, quantity } }
  );
  return response.data;
};
