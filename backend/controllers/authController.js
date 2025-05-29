const axios = require('axios');
const firebaseService = require('../services/firebase');
const twilioService = require('../services/twilio');

// GitHub API authentication headers
const getGithubHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Auth-App/1.0'
  };
  
  console.log('Using GitHub API with public rate limits (no token provided)');
  
  // Add authentication if token exists - currently disabled
  /* 
  if (process.env.GITHUB_ACCESS_TOKEN) {
    console.log('Using GitHub API with auth token:', process.env.GITHUB_ACCESS_TOKEN.substring(0, 5) + '...' + process.env.GITHUB_ACCESS_TOKEN.substring(process.env.GITHUB_ACCESS_TOKEN.length - 5));
    headers['Authorization'] = `token ${process.env.GITHUB_ACCESS_TOKEN}`;
  } else {
    console.log('WARNING: No GitHub access token found in environment variables!');
  }
  */
  
  return headers;
};

// Simple in-memory cache for GitHub API requests
const cache = {
  users: new Map(),
  search: new Map(),
  getUser(username) {
    const cached = this.users.get(username);
    if (cached && cached.expiry > Date.now()) {
      return cached;
    }
    return null;
  },
  setUser(username, data, ttl = 7200000) { // Cache for 2 hours by default
    this.users.set(username, {
      data,
      expiry: Date.now() + ttl
    });
  },
  getSearch(query, page, perPage) {
    const key = `${query}_${page}_${perPage}`;
    const cached = this.search.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    return null;
  },
  setSearch(query, page, perPage, data, ttl = 600000) { // Cache for 10 minutes
    const key = `${query}_${page}_${perPage}`;
    this.search.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
};

// Generate a random 6-digit code
const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// CreateNewAccessCode - Generate and save new access code
exports.createNewAccessCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Generate a random 6-digit access code
    const accessCode = generateAccessCode();
    
    // Save the access code to Firebase
    await firebaseService.saveAccessCode(phoneNumber, accessCode);
    
    // Send the access code via SMS
    await twilioService.sendSMS(phoneNumber, `Your access code is: ${accessCode}`);
    
    // Return just the access code as per specification
    res.status(200).json(accessCode);
  } catch (error) {
    console.error('Error creating access code:', error);
    res.status(500).json({ error: 'Failed to create access code' });
  }
};

// ValidateAccessCode - Validate the provided access code
exports.validateAccessCode = async (req, res) => {
  try {
    const { phoneNumber, accessCode } = req.body;
    
    if (!phoneNumber || !accessCode) {
      return res.status(400).json({ error: 'Phone number and access code are required' });
    }
    
    // Validate the access code from Firebase
    const isValid = await firebaseService.validateAccessCode(phoneNumber, accessCode);
    
    if (isValid) {
      // Clear the access code after successful validation
      await firebaseService.clearAccessCode(phoneNumber);
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid access code' });
    }
  } catch (error) {
    console.error('Error validating access code:', error);
    res.status(500).json({ error: 'Failed to validate access code' });
  }
};

// SearchGithubUsers - Search for GitHub users
exports.searchGithubUsers = async (req, res) => {
  try {
    const { q, page = 1, per_page = 30 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    // Check cache first
    const cachedResult = cache.getSearch(q, page, per_page);
    if (cachedResult) {
      console.log(`[CACHE HIT] Search results for "${q}" (page ${page})`);
      return res.status(200).json({
        ...cachedResult,
        pagination: {
          current_page: Number(page),
          per_page: Number(per_page),
          total_pages: Math.ceil(cachedResult.total_count / per_page)
        }
      });
    }
    
    console.log(`[CACHE MISS] Fetching search results for "${q}" (page ${page})`);
    const response = await axios.get(`https://api.github.com/search/users`, {
      params: { q, page, per_page },
      headers: getGithubHeaders()
    });
    
    // Add pagination metadata
    const responseWithPagination = {
      ...response.data,
      pagination: {
        current_page: Number(page),
        per_page: Number(per_page),
        total_pages: Math.ceil(response.data.total_count / per_page)
      }
    };
    
    // Cache the result
    cache.setSearch(q, page, per_page, responseWithPagination);
    
    res.status(200).json(responseWithPagination);
  } catch (error) {
    console.error('Error searching GitHub users:', error);
    
    // Handle rate limiting specifically
    if (error.response && error.response.status === 403 && error.response.data.message.includes('API rate limit exceeded')) {
      const resetTime = error.response.headers['x-ratelimit-reset'] 
        ? new Date(error.response.headers['x-ratelimit-reset'] * 1000).toISOString()
        : 'unknown';
        
      return res.status(429).json({ 
        error: 'GitHub API rate limit exceeded. Please try again later.',
        reset_at: resetTime
      });
    }
    
    res.status(500).json({ error: 'Failed to search GitHub users' });
  }
};

// FindGithubUserProfile - Get details of a specific GitHub user
exports.findGithubUserProfile = async (req, res) => {
  try {
    const { id: github_user_id } = req.params;
    
    if (!github_user_id) {
      return res.status(400).json({ error: 'GitHub user ID is required' });
    }
    
    // Check cache first
    const cachedUser = cache.getUser(github_user_id);
    if (cachedUser) {
      console.log(`[CACHE HIT] User profile for "${github_user_id}"`);
      // Return only the required fields per spec
      const responseData = {
        login: cachedUser.data.login,
        id: cachedUser.data.id,
        avatar_url: cachedUser.data.avatar_url,
        html_url: cachedUser.data.html_url,
        public_repos: cachedUser.data.public_repos,
        followers: cachedUser.data.followers
      };
      return res.status(200).json(responseData);
    }
    
    console.log(`[CACHE MISS] Fetching user profile for "${github_user_id}"`);
    // Use the exact API endpoint as specified in requirements
    // Note: GitHub's actual API uses /users/ (plural) but we're following the requirements
    const response = await axios.get(`https://api.github.com/user/${github_user_id}`, {
      headers: getGithubHeaders()
    }).catch(error => {
      // If /user/{id} fails (which it likely will), fallback to the correct /users/{username} endpoint
      console.log(`API endpoint /user/ failed, falling back to /users/ endpoint for ${github_user_id}`);
      return axios.get(`https://api.github.com/users/${github_user_id}`, {
        headers: getGithubHeaders()
      });
    });
    
    // Return only the required fields per specification
    const userData = { 
      login: response.data.login, 
      id: response.data.id,
      avatar_url: response.data.avatar_url, 
      html_url: response.data.html_url, 
      public_repos: response.data.public_repos, 
      followers: response.data.followers 
    };
    
    // Cache the result
    cache.setUser(github_user_id, userData);
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error finding GitHub user profile:', error);
    
    // Handle rate limiting specifically
    if (error.response && error.response.status === 403 && error.response.data.message.includes('API rate limit exceeded')) {
      const resetTime = error.response.headers['x-ratelimit-reset'] 
        ? new Date(error.response.headers['x-ratelimit-reset'] * 1000).toISOString()
        : 'unknown';
        
      return res.status(429).json({ 
        error: 'GitHub API rate limit exceeded. Please try again later.',
        reset_at: resetTime
      });
    }
    
    res.status(500).json({ error: 'Failed to find GitHub user profile' });
  }
};

// LikeGithubUser - Add a GitHub user to favorites
exports.likeGithubUser = async (req, res) => {
  try {
    const { phone_number, github_user_id } = req.body;
    
    if (!phone_number || !github_user_id) {
      return res.status(400).json({ error: 'Phone number and GitHub user ID are required' });
    }
    
    // Save the liked GitHub user to Firebase
    await firebaseService.likeGithubUser(phone_number, github_user_id);
    
    res.status(200).json({ message: 'GitHub user liked successfully' });
  } catch (error) {
    console.error('Error liking GitHub user:', error);
    res.status(500).json({ error: 'Failed to like GitHub user' });
  }
};

// Get user profile including liked GitHub users
exports.getUserProfile = async (req, res) => {
  try {
    const { phoneNumber: phone_number } = req.params;
    const { page = 0, limit = 0, basic = false } = req.query;
    
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Get the user profile from Firebase
    const userProfile = await firebaseService.getUserProfile(phone_number);
    
    // If no favorites, return early with empty array in correct format
    if (!userProfile.favorite_github_users || userProfile.favorite_github_users.length === 0) {
      return res.status(200).json({ favorite_github_users: [] });
    }
    
    let favoriteUserIds = userProfile.favorite_github_users;
    
    // Apply pagination if specified
    if (page > 0 && limit > 0) {
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      favoriteUserIds = favoriteUserIds.slice(startIdx, endIdx);
    }
    
    // If client only wants basic information (without loading details from GitHub),
    // return array of IDs/usernames
    if (basic) {
      return res.status(200).json({
        favorite_github_users: favoriteUserIds.map(id => ({
          id,
          login: id,
        }))
      });
    }
    
    // Create parallel requests for all GitHub users
    const promises = favoriteUserIds.map(async (githubUserId) => {
      try {
        // Check cache first
        const cachedUser = cache.getUser(githubUserId);
        if (cachedUser) {
          return { success: true, data: cachedUser.data };
        }
        
        // Query GitHub API with ID or username
        const response = await axios.get(`https://api.github.com/user/${githubUserId}`, {
          headers: getGithubHeaders()
        }).catch(error => {
          // Fallback to /users/ endpoint if /user/ fails
          console.log(`API endpoint /user/ failed, falling back to /users/ endpoint for ${githubUserId}`);
          return axios.get(`https://api.github.com/users/${githubUserId}`, {
            headers: getGithubHeaders()
          });
        });
        
        // Include only the fields specified in findGithubUserProfile
        const userData = { 
          login: response.data.login, 
          id: response.data.id, 
          avatar_url: response.data.avatar_url, 
          html_url: response.data.html_url, 
          public_repos: response.data.public_repos, 
          followers: response.data.followers
        };
        
        // Cache the result
        cache.setUser(githubUserId, userData);
        cache.setUser(response.data.login, userData);
        
        return { success: true, data: userData };
      } catch (error) {
        console.error(`Error fetching GitHub user ${githubUserId}:`, error);
        return { success: false, id: githubUserId };
      }
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    // Filter successful profiles
    const favoriteGithubUsers = results
      .filter(result => result.success)
      .map(result => result.data);
    
    // Return in the format specified by the requirements
    res.status(200).json({ favorite_github_users: favoriteGithubUsers });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
}; 