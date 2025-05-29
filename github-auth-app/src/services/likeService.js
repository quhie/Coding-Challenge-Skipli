import axios from 'axios';

// Use environment variables if available, otherwise fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Helper function to safely handle errors
const safeApiCall = async (apiFunc) => {
  try {
    return await apiFunc();
  } catch (error) {
    console.error('API error:', error);
    // Convert any error to a simple string message
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export const likeGithubProfile = async (phoneNumber, githubUsername) => {
  return safeApiCall(async () => {
    await axios.post(`${API_BASE_URL}/likeGithubUser`, {
      phone_number: phoneNumber,
      github_user_id: githubUsername
    });
    
    // Update local storage
    const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
    if (!likedProfiles.includes(githubUsername)) {
      likedProfiles.push(githubUsername);
      localStorage.setItem('likedProfiles', JSON.stringify(likedProfiles));
    }
    
    return true;
  });
};

export const getLikedProfiles = async (phoneNumber, options = {}) => {
  return safeApiCall(async () => {
    // Pagination parameters and basic option to reduce API load
    const { page, limit, basic } = options;
    let url = `${API_BASE_URL}/getUserProfile/${phoneNumber}`;
    
    // Add query parameters if present
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (basic) params.append('basic', true);
    
    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
    
    const response = await axios.get(url);
    
    // Update local storage with the latest data from server
    if (response.data && response.data.favorite_github_users) {
      const likedUsernames = response.data.favorite_github_users.map(user => user.login);
      localStorage.setItem('likedProfiles', JSON.stringify(likedUsernames));
      
      return response.data.favorite_github_users;
    }
    
    return [];
  });
};

export const isProfileLiked = (githubUsername) => {
  try {
    const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
    return likedProfiles.includes(githubUsername);
  } catch (error) {
    console.error('Error checking if profile is liked:', error);
    return false;
  }
}; 