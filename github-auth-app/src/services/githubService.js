import axios from 'axios';

// Use environment variables if available, otherwise fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper function to safely handle errors
const safeApiCall = async (apiFunc, errorMessage = 'API request failed') => {
  try {
    return await apiFunc();
  } catch (error) {
    console.error('API error:', error);
    // Ensure we always throw a string, not an object
    if (error.response?.data?.error) {
      throw String(error.response.data.error);
    } else if (error.message) {
      throw String(error.message);
    } else {
      throw errorMessage;
    }
  }
};

export const searchUsers = async (query, page = 1, perPage = 10) => {
  return safeApiCall(async () => {
    const response = await axios.get(`${API_BASE_URL}/searchGithubUsers`, {
      params: {
        q: query,
        page,
        per_page: perPage,
      }
    });
    return response.data;
  }, 'Failed to search users');
};

export const getUserDetails = async (username) => {
  return safeApiCall(async () => {
    const response = await axios.get(`${API_BASE_URL}/findGithubUserProfile/${username}`);
    return response.data;
  }, 'Failed to load user details');
};

export const getUserDetailsByIds = async (userIds) => {
  return safeApiCall(async () => {
    const promises = userIds.map(id => axios.get(`${API_BASE_URL}/findGithubUserProfile/${id}`));
    const responses = await Promise.all(promises);
    return responses.map(response => response.data);
  }, 'Failed to load user details');
}; 