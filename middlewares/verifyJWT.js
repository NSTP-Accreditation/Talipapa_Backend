const jwt = require('jsonwebtoken');
const User = require('../model/User');

/**
 * Middleware to verify JWT token and attach full user object to request
 * The user object includes roles which are needed for RBAC permission checks
 */
const verifyJWT = async (request, response, next) => {
  try {
    const authHeader = request.headers.Authorization || request.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      return response.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (error, decoded) => {
        if (error) {
          console.error('[Auth] JWT verification failed:', error.message);
          return response.status(403).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }
        
        // Fetch full user from database (includes roles)
        const user = await User.findById(decoded.userInfo._id).select('-password');
        
        if (!user) {
          return response.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        // Attach full user object to request (needed for RBAC)
        request.user = user;
        
        // Also keep legacy properties for backward compatibility
        request.userId = decoded.userInfo._id;
        request.username = decoded.userInfo.username;
        request.roles = decoded.userInfo.roles;
        
        next();
      }
    );
  } catch (error) {
    console.error('[Auth] Error in verifyJWT middleware:', error);
    return response.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = verifyJWT;