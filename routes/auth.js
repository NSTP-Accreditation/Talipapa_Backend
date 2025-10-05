const express = require('express');
const router = express.Router();
const { handleLogin, handleCreateAccount, handleRefreshToken } = require('../controller/authController');

router.post('/signup', handleCreateAccount);
router.post('/login', handleLogin);
router.post("/refreshToken", handleRefreshToken);

// Refresh access token needs a refresh token saved in http cookie only

// logout

module.exports = router