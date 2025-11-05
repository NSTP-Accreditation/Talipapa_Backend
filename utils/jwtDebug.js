/**
 * JWT Debug Helper
 *
 * This file provides utilities to help debug JWT token issues.
 * Use these functions in your routes temporarily to diagnose token problems.
 */

/**
 * Express middleware to log incoming request headers
 * Add this BEFORE verifyJWT to see what's being sent
 *
 * Usage:
 * router.get('/test', debugAuthHeader, verifyJWT, controller)
 */
const debugAuthHeader = (req, res, next) => {
  console.log("\n[JWT DEBUG] Incoming Request:", {
    path: req.path,
    method: req.method,
    headers: {
      authorization: req.headers.authorization,
      Authorization: req.headers.Authorization,
    },
    hasAuthHeader: !!(req.headers.authorization || req.headers.Authorization),
  });
  next();
};

/**
 * Test if a token string is valid JWT format
 */
const isValidJWTFormat = (token) => {
  if (!token) return { valid: false, reason: "Token is empty or undefined" };
  if (token === "undefined")
    return { valid: false, reason: 'Token is literal string "undefined"' };
  if (token === "null")
    return { valid: false, reason: 'Token is literal string "null"' };

  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      valid: false,
      reason: `JWT should have 3 parts (header.payload.signature), found ${parts.length}`,
    };
  }

  // Check if parts are base64 encoded
  try {
    Buffer.from(parts[0], "base64");
    Buffer.from(parts[1], "base64");
  } catch (e) {
    return { valid: false, reason: "Token parts are not valid base64" };
  }

  return { valid: true, reason: "Token format looks valid" };
};

/**
 * Decode JWT without verification (for debugging only)
 */
const decodeTokenWithoutVerification = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return {
      payload,
      isExpired: payload.exp ? Date.now() >= payload.exp * 1000 : false,
      expiresAt: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : "N/A",
    };
  } catch (e) {
    return null;
  }
};

/**
 * Express route for testing JWT tokens
 * Add this route temporarily to test tokens:
 *
 * const { testTokenRoute } = require('./utils/jwtDebug');
 * router.post('/debug/test-token', testTokenRoute);
 */
const testTokenRoute = (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(400).json({
      success: false,
      message: "No Authorization header found",
      debug: {
        receivedHeaders: Object.keys(req.headers),
      },
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      success: false,
      message: 'Authorization header must start with "Bearer "',
      debug: {
        receivedHeader: authHeader.substring(0, 50),
      },
    });
  }

  const token = authHeader.split(" ")[1];

  const formatCheck = isValidJWTFormat(token);
  if (!formatCheck.valid) {
    return res.status(400).json({
      success: false,
      message: "Token format is invalid",
      debug: {
        reason: formatCheck.reason,
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 50) + "...",
      },
    });
  }

  const decoded = decodeTokenWithoutVerification(token);

  return res.json({
    success: true,
    message: "Token format is valid",
    debug: {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + "...",
      decoded: decoded
        ? {
            user: decoded.payload.userInfo?.username || "N/A",
            roles: decoded.payload.userInfo?.roles || [],
            isExpired: decoded.isExpired,
            expiresAt: decoded.expiresAt,
          }
        : "Could not decode",
    },
  });
};

module.exports = {
  debugAuthHeader,
  isValidJWTFormat,
  decodeTokenWithoutVerification,
  testTokenRoute,
};
