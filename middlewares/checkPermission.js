const {
  hasPermission,
  hasAnyPermission,
  isSuperAdmin,
} = require("./rbac.utils");

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
          message: "Authentication required",
        });
      }

      // Check permission
      if (!hasPermission(req.user, permission)) {
        // Enhanced security logging for permission denials
        const denialLog = {
          event: "PERMISSION_DENIED",
          user: req.user.username,
          userId: req.user._id,
          role: req.user.roles,
          permission,
          endpoint: req.originalUrl || req.path,
          method: req.method,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("user-agent"),
          timestamp: new Date().toISOString(),
        };

        console.warn("[RBAC] Permission denied:", denialLog);

        // Log to security logger if available
        try {
          const { logSecurityEvent } = require("../utils/securityLogger");
          logSecurityEvent("PERMISSION_DENIED", req.user.username, {
            permission,
            endpoint: req.originalUrl || req.path,
            method: req.method,
            role: req.user.roles,
          });
        } catch (err) {
          // Security logger not critical, just log to console if it fails
          console.error(
            "[RBAC] Failed to log to security logger:",
            err.message
          );
        }

        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          required: permission,
        });
      }

      // Permission granted
      next();
    } catch (error) {
      console.error("[RBAC] Error checking permission:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
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
          message: "Authentication required",
        });
      }

      if (!hasAnyPermission(req.user, permissions)) {
        // Enhanced security logging for permission denials
        const denialLog = {
          event: "PERMISSION_DENIED_ANY",
          user: req.user.username,
          userId: req.user._id,
          role: req.user.roles,
          requiredAny: permissions,
          endpoint: req.originalUrl || req.path,
          method: req.method,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("user-agent"),
          timestamp: new Date().toISOString(),
        };

        console.warn("[RBAC] Permission denied (any):", denialLog);

        // Log to security logger if available
        try {
          const { logSecurityEvent } = require("../utils/securityLogger");
          logSecurityEvent("PERMISSION_DENIED", req.user.username, {
            requiredAny: permissions,
            endpoint: req.originalUrl || req.path,
            method: req.method,
            role: req.user.roles,
          });
        } catch (err) {
          console.error(
            "[RBAC] Failed to log to security logger:",
            err.message
          );
        }

        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          requiredAny: permissions,
        });
      }

      next();
    } catch (error) {
      console.error("[RBAC] Error checking permissions:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
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
        message: "Authentication required",
      });
    }

    if (!isSuperAdmin(req.user)) {
      // Enhanced security logging for SuperAdmin access attempts
      const denialLog = {
        event: "SUPERADMIN_ACCESS_DENIED",
        user: req.user.username,
        userId: req.user._id,
        role: req.user.roles,
        endpoint: req.originalUrl || req.path,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
        timestamp: new Date().toISOString(),
      };

      console.warn("[RBAC] SuperAdmin access denied:", denialLog);

      // Log to security logger if available
      try {
        const { logSecurityEvent } = require("../utils/securityLogger");
        logSecurityEvent("SUPERADMIN_ACCESS_DENIED", req.user.username, {
          endpoint: req.originalUrl || req.path,
          method: req.method,
          role: req.user.roles,
        });
      } catch (err) {
        console.error("[RBAC] Failed to log to security logger:", err.message);
      }

      return res.status(403).json({
        success: false,
        message: "Super Administrator access required",
      });
    }

    next();
  } catch (error) {
    console.error("[RBAC] Error checking SuperAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking permissions",
    });
  }
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  requireSuperAdmin,
};
