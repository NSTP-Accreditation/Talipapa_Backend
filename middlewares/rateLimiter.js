const rateLimit = require("express-rate-limit");
// IPv6-safe helper for extracting IPs from the request
const { ipKeyGenerator } = require("express-rate-limit");
const {
  getIdentifier,
  incrementFailedAttempt,
} = require("../utils/lockoutStore");

/**
 * Login Rate Limiter
 * - Tracks by IP address + username
 * - Prevents brute force attacks
 * - Cannot be bypassed from client-side
 */
const loginRateLimiter = rateLimit({
  // Rate limiting rules
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // Max 5 attempts per window
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false,

  // Custom key generator (IP + username for more granular tracking)
  keyGenerator: (req) => {
    // Use the built-in ipKeyGenerator to ensure IPv6 addresses are handled
    const ip = ipKeyGenerator(req) || "unknown";
    const username = req.body?.username || "unknown";
    return `${ip}_${username}`;
  },

  // Standard headers
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers

  // Custom handler for when limit is exceeded
  handler: async (req, res) => {
    const username = req.body?.username || "unknown";
    const ip = ipKeyGenerator(req) || req.ip || req.connection.remoteAddress;

    console.error(
      `[SECURITY] Rate limit exceeded for IP: ${ip}, Username: ${username}`
    );

    // Record lockout in persistent store
    try {
      const identifier = getIdentifier(req, username);
      // mark as locked by ensuring attempts are at max and set lockedUntil
      await incrementFailedAttempt(identifier, {
        windowMs: 15 * 60 * 1000,
        maxAttempts: 5,
        lockDurationMs: 15 * 60 * 1000,
      });
    } catch (e) {
      console.error("Failed to persist lockout record:", e);
    }

    res.status(429).json({
      error: "Too many login attempts",
      message: "Account temporarily locked. Please try again in 15 minutes.",
      retryAfter: 15 * 60, // seconds
      lockedUntil: Date.now() + 15 * 60 * 1000,
    });
  },

  // NOTE: onLimitReached was removed in express-rate-limit v7+; use `handler`
});

/**
 * General API Rate Limiter
 * Prevents API abuse and DDoS attacks
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please try again later.",
  },
});

/**
 * Strict Rate Limiter for sensitive operations
 * Used for password reset, account changes, etc.
 */
const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.error(`[SECURITY] Strict rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Account locked",
      message: "Too many failed attempts. Account locked for 1 hour.",
      retryAfter: 60 * 60,
    });
  },
});

/**
 * Status Check Rate Limiter
 * Prevents abuse of lockout status endpoint
 */
const statusCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many status check requests",
    message: "Please wait before checking status again.",
  },
});

module.exports = {
  loginRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
  statusCheckLimiter,
};
