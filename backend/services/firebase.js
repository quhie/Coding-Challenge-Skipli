const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Firebase Firestore connected successfully!');

// Save access code to Firestore
exports.saveAccessCode = async (phoneNumber, accessCode) => {
  try {
    await db.collection('access_codes').doc(phoneNumber).set({
      code: accessCode,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Verification code saved for ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error saving access code:', error);
    throw error;
  }
};

// Validate access code
exports.validateAccessCode = async (phoneNumber, accessCode) => {
  try {
    const doc = await db.collection('access_codes').doc(phoneNumber).get();
    if (!doc.exists) {
      console.log(`No verification code found for ${phoneNumber}`);
      return false;
    }
    
    const data = doc.data();
    const isValid = data.code === accessCode;
    console.log(`Verification code validation for ${phoneNumber}: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error('Error validating access code:', error);
    return false;
  }
};

// Clear access code after successful validation
exports.clearAccessCode = async (phoneNumber) => {
  try {
    await db.collection('access_codes').doc(phoneNumber).delete();
    console.log(`Verification code cleared for ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error clearing access code:', error);
    throw error;
  }
};

// Save liked GitHub user
exports.likeGithubUser = async (phoneNumber, githubUserId) => {
  try {
    console.log(`Adding GitHub user ${githubUserId} to favorites for ${phoneNumber}`);
    
    const userRef = db.collection('users').doc(phoneNumber);
    const doc = await userRef.get();
    
    if (doc.exists) {
      // User exists, update favorites
      const userData = doc.data();
      let favorites = userData.favorite_github_users || [];
      
      // Check if already in favorites
      if (!favorites.includes(githubUserId)) {
        favorites.push(githubUserId);
        console.log(`Added ${githubUserId} to favorites list:`, favorites);
        await userRef.update({
          favorite_github_users: favorites
        });
      } else {
        console.log(`User ${githubUserId} already in favorites list:`, favorites);
      }
    } else {
      // User doesn't exist, create new document
      console.log(`Creating new user profile with first favorite: ${githubUserId}`);
      await userRef.set({
        phone_number: phoneNumber,
        favorite_github_users: [githubUserId]
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error liking GitHub user:', error);
    throw error;
  }
};

// Get user profile
exports.getUserProfile = async (phoneNumber) => {
  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const doc = await userRef.get();
    
    if (doc.exists) {
      const userData = doc.data();
      console.log(`Retrieved profile for ${phoneNumber}, favorites:`, userData.favorite_github_users || []);
      return userData;
    } else {
      console.log(`No profile found for ${phoneNumber}, returning empty data`);
      return { favorite_github_users: [] };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}; 