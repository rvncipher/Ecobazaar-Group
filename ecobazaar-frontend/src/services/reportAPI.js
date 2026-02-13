import axiosInstance from './axiosInstance';

/**
 * Get user purchase report - items BOUGHT by user
 */
export const getUserPurchaseReport = async (userId, month) => {
  const response = await axiosInstance.get(
    `/api/reports/user/${userId}/purchases`,
    { params: { month } }
  );
  return response.data;
};

/**
 * Get seller sales report - items SOLD by seller
 */
export const getSellerSalesReport = async (sellerId, month) => {
  const response = await axiosInstance.get(
    `/api/reports/seller/${sellerId}/sales`,
    { params: { month } }
  );
  return response.data;
};

/**
 * Check reports service health
 */
export const checkReportsHealth = async () => {
  const response = await axiosInstance.get('/api/reports/health');
  return response.data;
};
