const express = require('express');
const router = express.Router();
const { handleLogin, handleCreateAccount, handleRefreshToken, handleLogout } = require('../controller/authController');

router.post('/signup', handleCreateAccount);
router.post('/login', handleLogin);
router.post("/refreshToken", handleRefreshToken);
router.post("/logout", handleLogout);

module.exports = router