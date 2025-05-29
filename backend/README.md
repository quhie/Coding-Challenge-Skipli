# GitHub User Authentication Backend

This backend service provides authentication and GitHub user management functionality.

## Project Overview

This Express-based backend allows users to:
- Authenticate via SMS verification codes
- Search for GitHub users
- View detailed GitHub user profiles
- Save favorite GitHub users
- Retrieve user profiles with their favorited GitHub users

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Configure environment variables:
   - Create a `.env` file in the project root with:
```
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
GITHUB_ACCESS_TOKEN=your_github_personal_access_token (optional)
```
4. Set up Firebase:
   - Create a Firebase project
   - Generate a service account key
   - Save it as `config/firebase-service-account.json`

## Running the Project

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### `POST /CreateNewAccessCode`
Generates a random 6-digit access code for a given phone number.

**Parameters:**
- `phoneNumber`: The user's phone number

**Response:**
- Returns the generated access code
- Saves the code in the database, associated with the phone number
- Sends the code via SMS (or mocks sending if Twilio is not configured)

#### `POST /ValidateAccessCode`
Validates a provided access code for a given phone number.

**Parameters:**
- `phoneNumber`: The user's phone number
- `accessCode`: The 6-digit code to validate

**Response:**
- `{ success: true }` if valid
- Sets the access code to an empty string after successful validation

### GitHub User Management

#### `GET /searchGithubUsers`
Searches for GitHub users matching the given query.

**Parameters:**
- `q`: Search term
- `page`: Page number (optional, default: 1)
- `per_page`: Results per page (optional, default: 30)

**Response:**
- Array of GitHub users matching the search term

#### `GET /findGithubUserProfile/:id`
Fetches detailed profile information for a specific GitHub user.

**Parameters:**
- `github_user_id`: GitHub user ID or username

**Response:**
```json
{
  "login": "",
  "id": "",
  "avatar_url": "",
  "html_url": "",
  "public_repos": 0,
  "followers": 0
}
```

#### `POST /likeGithubUser`
Adds a GitHub user to a user's favorites list.

**Parameters:**
- `phone_number`: User's phone number
- `github_user_id`: GitHub user ID to favorite

**Response:**
- Status code 200 on success

#### `GET /getUserProfile/:phoneNumber`
Retrieves a user's profile including their favorite GitHub users.

**Parameters:**
- `phoneNumber`: User's phone number
- `page`: Page number (optional)
- `limit`: Results per page (optional)
- `basic`: Return basic information only (optional)

**Response:**
```json
{
  "favorite_github_users": [user_object, user_object, user_object]
}
```

## Implementation Notes

- Firebase Firestore is used for data storage
- Twilio is used for SMS verification (with optional mock mode)
- In-memory caching is implemented to reduce GitHub API calls 