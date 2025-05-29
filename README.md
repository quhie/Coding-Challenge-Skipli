# GitHub Authentication and User Search App

A full-stack application that allows users to authenticate using phone verification and search for GitHub users.

## Project Overview

This project demonstrates a comprehensive solution for phone-based authentication and GitHub user search functionality. Built with modern web technologies, it provides a seamless user experience from authentication to searching and managing favorite GitHub profiles.

### Technologies Used

**Frontend:**
- React with React Router
- Context API for state management
- Tailwind CSS for styling
- Axios for API communication

**Backend:**
- Express.js
- Firebase Firestore for database
- Twilio for SMS verification
- GitHub API integration

## Screenshots

### Login Screen
![Login Screen](./screenshots/ScreenShot%20Tool%20-20250529152004.png)

### Verification Code Entry
![Verification Code](./screenshots/ScreenShot%20Tool%20-20250529152101.png)

### GitHub Search Screen
![GitHub Search](./screenshots/ScreenShot%20Tool%20-20250529152128.png)

### Search Results
![Search Results](./screenshots/ScreenShot%20Tool%20-20250529152143.png)

### User Profile Modal
![User Profile](./screenshots/ScreenShot%20Tool%20-20250529152152.png)

## User Guide

### How to Use the App

#### 1. Authentication
1. **Login with Phone Number:**
   - On the home page, enter your phone number in the format required (e.g., 10 digits without spaces or special characters)
   - Click "Send Code" to receive a verification code
   - In development mode, the code will be displayed in the backend console

2. **Enter Verification Code:**
   - On the verification screen, enter the 6-digit code you received
   - Click "Verify" to authenticate
   - If the code is correct, you'll be redirected to the search page

#### 2. Searching GitHub Users
1. **Search for Users:**
   - Enter a username or keyword in the search box
   - Click the search button or press Enter
   - The app will display matching GitHub users
   - Scroll through results or use pagination if available

2. **View User Details:**
   - Click on any user card to see detailed information
   - The modal shows additional information like:
     - Profile picture
     - Bio
     - Number of repositories
     - Followers/Following count
     - GitHub profile link

3. **Managing Favorites:**
   - To add a user to favorites, click the "Like" button on their profile
   - To view your favorites, click the "Favorites" or profile icon in the navigation bar
   - Your favorites are saved and will be available when you log in again using the same phone number

#### 3. Navigation
- Use the navigation bar to switch between search and favorites
- The app maintains your session until you log out
- You can log out by clicking on the "Log Out" button, typically found in the profile menu

#### 4. Tips for Best Experience
- For efficient searching, use specific usernames rather than generic terms
- The app implements caching to speed up repeated searches
- GitHub API has rate limits, so you may see limited results if many searches are performed

## Local Development Only

This project is configured for local development purposes only. Features to note:

- **Mock SMS Delivery**: No actual SMS messages are sent. In development mode, verification codes are returned directly from the API
- **Local Database**: Firebase is configured to store data locally without requiring a production setup
- **No Authentication**: GitHub API is used without authentication tokens, which has lower rate limits (60 requests/hour)
- **No Production Build**: The setup instructions are for development environment only

## Project Structure

```
test_skipli/
├── README.md                  # Main project documentation
├── screenshots/               # Screenshots of the application
│   └── ...                    # Various application screenshots
│
├── backend/                   # Backend Express application
│   ├── config/                # Configuration files (Firebase, etc.)
│   ├── controllers/           # Request handlers
│   │   └── authController.js  # Authentication and GitHub API controllers
│   ├── routes/                # API routes definitions
│   │   └── auth.js           # Authentication and GitHub routes
│   ├── services/              # Business logic services
│   │   ├── firebase.js       # Firebase database service
│   │   └── twilio.js         # SMS service
│   ├── server.js             # Express server entry point
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend documentation
│
└── github-auth-app/          # Frontend React application
    ├── public/               # Static files
    ├── src/                  # React source code
    │   ├── components/       # React components
    │   │   ├── ui/           # UI components
    │   │   ├── Login.js      # Authentication components
    │   │   ├── Search.js     # GitHub search components
    │   │   └── ...           # Other components
    │   ├── context/          # React contexts
    │   ├── services/         # API services
    │   ├── App.js            # Main React component
    │   └── index.js          # React entry point
    ├── package.json          # Frontend dependencies
    └── README.md             # Frontend documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Twilio account (optional, mock mode available)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=3000
   
   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CLIENT_CERT_URL=your-cert-url
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # GitHub API Configuration (increases API rate limit)
   GITHUB_ACCESS_TOKEN=your_github_personal_access_token
   ```

4. Configure Firebase:
   - Create a Firebase project
   - Generate a service account key
   - Save it as `config/firebase-service-account.json`
   - **Important**: Add this file to `.gitignore` to prevent committing sensitive credentials

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd github-auth-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`

## Core API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/CreateNewAccessCode` | POST | Generate a 6-digit verification code |
| `/ValidateAccessCode` | POST | Validate the verification code |
| `/searchGithubUsers` | GET | Search for GitHub users |
| `/findGithubUserProfile/:id` | GET | Get details about a specific GitHub user |
| `/likeGithubUser` | POST | Add a GitHub user to favorites |
| `/getUserProfile/:phoneNumber` | GET | Get user profile with favorite GitHub users |

## Troubleshooting

### Common Issues and Solutions

1. **"Cannot find module 'firebase-service-account.json'"**:
   - Make sure you've created the Firebase service account file at `backend/config/firebase-service-account.json`
   - Alternatively, set up environment variables as described in the setup section

2. **"react-scripts: command not found"**:
   - Run `npm install` in the github-auth-app directory to install dependencies

3. **GitHub API Rate Limiting**:
   - If you see fewer results or errors related to GitHub API, you may have hit the rate limit
   - Wait an hour or add your GitHub token to increase the limit

4. **Verification Code Not Working**:
   - In development mode, check the backend console for the actual code sent
   - Ensure you're entering the exact code shown in the console

### Security Notes

- **Firebase Service Account**: 
  - Always keep your Firebase service account file secure and never commit it to public repositories
  - After completing development, consider revoking and creating new credentials
  - Use environment variables in production

## Running the Complete Stack

For convenience, you can use the following command to run both backend and frontend concurrently:

```bash
# From the project root directory
npm run dev
```

This requires adding a script to the root package.json:
```json
"scripts": {
  "dev": "concurrently \"cd backend && npm start\" \"cd github-auth-app && npm start\""
}
```

## Notes

- The GitHub API has rate limits (60 requests/hour for unauthenticated requests, 5000 requests/hour with authentication)
- Twilio SMS functionality will work in mock mode if credentials are not provided
- Firebase is required for data persistence


