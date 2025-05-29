# GitHub Authentication App

A React application that allows users to authenticate using phone verification and search for GitHub users.

## Project Overview

This project implements a React frontend for a GitHub user search application with phone-based authentication. The application allows users to authenticate with a phone number and verification code, search for GitHub users, view detailed profiles, and save favorite profiles.

## Features

- **Phone Authentication Flow**
  - Enter phone number to receive a 6-digit access code
  - Verify the access code to authenticate
  - Save authentication state in localStorage

- **GitHub User Search**
  - Search GitHub users by username
  - Display user information in a responsive grid
  - Pagination support with customizable results per page

- **User Profile Management**
  - Like/favorite GitHub profiles
  - View all favorited profiles in a user profile modal
  - Persistent favorites across sessions

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd github-auth-app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory (optional)
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```

4. Start the development server
   ```
   npm start
   ```

5. The application will be available at `http://localhost:3000`

## Usage

### Authentication

1. Enter your phone number and click "Send Code"
2. Enter the 6-digit code received (in a real environment, this would be sent via SMS)
3. After successful verification, you'll be redirected to the search page

### Searching GitHub Users

1. Enter a GitHub username in the search field
2. Use the pagination controls to navigate through results
3. Click on the heart icon to like a profile
4. Click on the profile icon in the top right to see your liked profiles

## Code Structure

```
src/
├── components/             # React components
│   ├── Login.js            # Authentication component
│   ├── Search.js           # GitHub user search component
│   ├── UserCard.js         # Card to display a GitHub user
│   ├── ProfileModal.js     # Modal to show user profile and favorites
│   ├── PrivateRoute.js     # Protected route component
│   └── ui/                 # Reusable UI components
├── context/
│   └── AuthContext.js      # Authentication context provider
├── services/
│   ├── githubService.js    # GitHub API service functions
│   ├── likeService.js      # Functions for managing favorite profiles
│   └── twilioService.js    # Authentication service functions
├── App.js                  # Main application component
└── index.js                # Entry point
```

## API Integration

The frontend communicates with the backend using the following API endpoints:

### Authentication Endpoints

- **POST /CreateNewAccessCode**
  ```javascript
  // Request
  {
    "phoneNumber": "+1234567890"
  }
  // Response: 6-digit access code
  ```

- **POST /ValidateAccessCode**
  ```javascript
  // Request
  {
    "phoneNumber": "+1234567890",
    "accessCode": "123456"
  }
  // Response
  {
    "success": true
  }
  ```

### GitHub User Endpoints

- **GET /searchGithubUsers**
  ```javascript
  // Parameters
  q: "username",
  page: 1,
  per_page: 10
  // Response: Array of GitHub users matching the search term
  ```

- **GET /findGithubUserProfile/:id**
  ```javascript
  // Response
  {
    "login": "username",
    "id": "123456",
    "avatar_url": "https://avatars.githubusercontent.com/u/123456",
    "html_url": "https://github.com/username",
    "public_repos": 10,
    "followers": 20
  }
  ```

- **POST /likeGithubUser**
  ```javascript
  // Request
  {
    "phone_number": "+1234567890",
    "github_user_id": "username"
  }
  // Response: Status code 200
  ```

- **GET /getUserProfile/:phoneNumber**
  ```javascript
  // Response
  {
    "favorite_github_users": [
      {
        "login": "username",
        "id": "123456",
        "avatar_url": "https://avatars.githubusercontent.com/u/123456",
        "html_url": "https://github.com/username",
        "public_repos": 10,
        "followers": 20
      }
    ]
  }
  ```

## Screenshots

![Login Screen](/path/to/login-screen.png)
![Search Screen](/path/to/search-screen.png)
![Profile Modal](/path/to/profile-modal.png)

## Implementation Notes

- The application uses React Router for navigation
- Authentication state is managed through React Context API
- Liked profiles are stored both in the backend and in localStorage for persistence
- The UI is built with modern, responsive design principles
