import axios from '../../services/axiosInstance';

const API_BASE_URL = '/api/admin';

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/role/${role}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${role} users:`, error);
    throw error;
  }
};

/**
 * Get all sellers
 */
export const getAllSellers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sellers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    throw error;
  }
};

/**
 * Get all regular users
 */
export const getRegularUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/regular-users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching regular users:', error);
    throw error;
  }
};

/**
 * Get banned users
 */
export const getBannedUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/banned`);
    return response.data;
  } catch (error) {
    console.error('Error fetching banned users:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

/**
 * Ban a user
 */
export const banUser = async (userId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}/ban`);
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

/**
 * Unban a user
 */
export const unbanUser = async (userId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
