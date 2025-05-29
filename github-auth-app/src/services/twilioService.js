import axios from 'axios';

// Use environment variables if available, otherwise fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper function to safely handle errors
const safeApiCall = async (apiFunc, errorMessage = 'API request failed') => {
  try {
    return await apiFunc();
  } catch (error) {
    console.error('API error:', error);
    if (error.response?.data?.error) {
      throw String(error.response.data.error);
    } else if (error.message) {
      throw String(error.message);
    } else {
      throw errorMessage;
    }
  }
};

export const sendVerificationCode = async (phoneNumber) => {
  return safeApiCall(async () => {
    const response = await axios.post(`${API_BASE_URL}/CreateNewAccessCode`, { phoneNumber });
    return response.data;
  }, 'Failed to send verification code');
};

export const verifyCode = async (phoneNumber, accessCode) => {
  return safeApiCall(async () => {
    const response = await axios.post(`${API_BASE_URL}/ValidateAccessCode`, { 
      phoneNumber, 
      accessCode 
    });
    return response.data;
  }, 'Failed to verify access code');
}; 