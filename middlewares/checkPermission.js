const { hasPermission, hasAnyPermission, isSuperAdmin } = require('./rbac.utils');

/**
 * Middleware to check if user has required permission
 * 
 * Usage:
 * router.delete('/users/:id', verifyJWT, checkPermission(Permission.DELETE_USERS), deleteUser);
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      // User should be attached by verifyJWT middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check permission
      if (!hasPermission(req.user, permission)) {
        // Log security event
        console.warn('[RBAC] Permission denied:', {
          user: req.user.username,
          permission,
          endpoint: req.path,
          method: req.method,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permission
        });
      }

      // Permission granted
      next();
    } catch (error) {
      console.error('[RBAC] Error checking permission:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if user has ANY of the required permissions
 * 
 * Usage:
 * router.get('/data', verifyJWT, checkAnyPermission([Permission.VIEW_USERS, Permission.VIEW_RECORDS]), getData);
 */
const checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!hasAnyPermission(req.user, permissions)) {
        console.warn('[RBAC] Permission denied (any):', {
          user: req.user.username,
          requiredAny: permissions,
          endpoint: req.path,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          requiredAny: permissions
        });
      }

      next();
    } catch (error) {
      console.error('[RBAC] Error checking permissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if user is SuperAdmin
 * 
 * Usage:
 * router.post('/auth/signup', verifyJWT, requireSuperAdmin, signupAdmin);
 */
const requireSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!isSuperAdmin(req.user)) {
      console.warn('[RBAC] SuperAdmin access denied:', {
        user: req.user.username,
        endpoint: req.path,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        message: 'Super Administrator access required'
      });
    }

    next();
  } catch (error) {
    console.error('[RBAC] Error checking SuperAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking permissions'
    });
  }
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  requireSuperAdmin
};
