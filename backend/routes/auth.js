const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/CreateNewAccessCode', authController.createNewAccessCode);
router.post('/ValidateAccessCode', authController.validateAccessCode);

// GitHub user routes
router.get('/searchGithubUsers', authController.searchGithubUsers);
router.get('/findGithubUserProfile/:id', authController.findGithubUserProfile);
router.post('/likeGithubUser', authController.likeGithubUser);
router.get('/getUserProfile/:phoneNumber', authController.getUserProfile);

module.exports = router; 