const mongoose = require("mongoose");

/**
 * Security Log Schema
 * Tracks security-related events for audit purposes
 */
const securityLogSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: [
      "LOGIN_FAILED",
      "LOGIN_SUCCESS",
      "LOGOUT",
      "ACCOUNT_LOCKED",
      "RATE_LIMIT_EXCEEDED",
      "INVALID_TOKEN",
      "ACCOUNT_CREATED",
      "PASSWORD_CHANGED",
      "PERMISSION_DENIED",
    ],
  },
  username: {
    type: String,
    index: true,
  },
  ip: {
    type: String,
    index: true,
  },
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object,
    default: {},
  },
});

// Auto-delete logs older than 90 days
securityLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);

/**
 * Log a security event
 * @param {string} event - Event type (LOGIN_FAILED, LOGIN_SUCCESS, etc.)
 * @param {object} req - Express request object
 * @param {object} metadata - Additional metadata to log
 */
async function logSecurityEvent(event, req, metadata = {}) {
  try {
    await SecurityLog.create({
      event,
      username: req.body?.username || req.user?.username || "unknown",
      ip: req.ip || req.connection?.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      metadata,
    });

    console.info(
      `[SECURITY] ${event} - User: ${req.body?.username || "unknown"}, IP: ${
        req.ip
      }`
    );
  } catch (error) {
    console.error("[SECURITY] Failed to log security event:", error);
  }
}

/**
 * Get security logs with filters
 * @param {object} filters - MongoDB query filters
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Security log entries
 */
async function getSecurityLogs(filters = {}, limit = 100) {
  try {
    return await SecurityLog.find(filters)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error("[SECURITY] Failed to fetch security logs:", error);
    return [];
  }
}

/**
 * Get failed login attempts for a specific user
 * @param {string} username - Username to check
 * @param {number} minutes - Time window in minutes (default: 60)
 * @returns {Promise<number>} Number of failed attempts
 */
async function getFailedLoginAttempts(username, minutes = 60) {
  try {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const count = await SecurityLog.countDocuments({
      event: "LOGIN_FAILED",
      username,
      timestamp: { $gte: since },
    });
    return count;
  } catch (error) {
    console.error("[SECURITY] Failed to get failed login attempts:", error);
    return 0;
  }
}

module.exports = {
  SecurityLog,
  logSecurityEvent,
  getSecurityLogs,
  getFailedLoginAttempts,
};
