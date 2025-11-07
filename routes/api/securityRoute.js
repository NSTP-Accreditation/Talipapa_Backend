const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { requireSuperAdmin } = require("../../middlewares/checkPermission");
const { SecurityLog, getSecurityLogs, getFailedLoginAttempts } = require("../../utils/securityLogger");

/**
 * Get recent security logs
 * SuperAdmin only
 */
router.get(
  "/logs",
  verifyJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { event, username, limit = 100 } = req.query;
      
      const filters = {};
      if (event) filters.event = event;
      if (username) filters.username = username;
      
      const logs = await getSecurityLogs(filters, parseInt(limit));
      
      res.json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (error) {
      console.error('[SECURITY API] Error fetching logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security logs',
      });
    }
  }
);

/**
 * Get failed login attempts for a user
 * SuperAdmin only
 */
router.get(
  "/failed-logins/:username",
  verifyJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { username } = req.params;
      const { minutes = 60 } = req.query;
      
      const count = await getFailedLoginAttempts(username, parseInt(minutes));
      
      res.json({
        success: true,
        username,
        failedAttempts: count,
        timeWindow: `${minutes} minutes`,
      });
    } catch (error) {
      console.error('[SECURITY API] Error fetching failed logins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch failed login attempts',
      });
    }
  }
);

/**
 * Get security statistics
 * SuperAdmin only
 */
router.get(
  "/stats",
  verifyJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const [
        totalLogs,
        failedLogins,
        successfulLogins,
        rateLimitExceeded,
        accountsLocked,
      ] = await Promise.all([
        SecurityLog.countDocuments({ timestamp: { $gte: last24Hours } }),
        SecurityLog.countDocuments({ event: 'LOGIN_FAILED', timestamp: { $gte: last24Hours } }),
        SecurityLog.countDocuments({ event: 'LOGIN_SUCCESS', timestamp: { $gte: last24Hours } }),
        SecurityLog.countDocuments({ event: 'RATE_LIMIT_EXCEEDED', timestamp: { $gte: last24Hours } }),
        SecurityLog.countDocuments({ event: 'ACCOUNT_LOCKED', timestamp: { $gte: last24Hours } }),
      ]);
      
      res.json({
        success: true,
        timeRange: 'Last 24 hours',
        statistics: {
          totalEvents: totalLogs,
          failedLogins,
          successfulLogins,
          rateLimitExceeded,
          accountsLocked,
          successRate: totalLogs > 0 
            ? ((successfulLogins / (successfulLogins + failedLogins)) * 100).toFixed(2) + '%'
            : 'N/A',
        },
      });
    } catch (error) {
      console.error('[SECURITY API] Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security statistics',
      });
    }
  }
);

/**
 * Get top suspicious IPs
 * SuperAdmin only
 */
router.get(
  "/suspicious-ips",
  verifyJWT,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const suspiciousIPs = await SecurityLog.aggregate([
        {
          $match: {
            event: { $in: ['LOGIN_FAILED', 'RATE_LIMIT_EXCEEDED'] },
            timestamp: { $gte: last24Hours },
          },
        },
        {
          $group: {
            _id: '$ip',
            count: { $sum: 1 },
            events: { $push: '$event' },
            usernames: { $addToSet: '$username' },
          },
        },
        {
          $match: {
            count: { $gte: 5 }, // 5 or more failed attempts
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 20,
        },
      ]);
      
      res.json({
        success: true,
        count: suspiciousIPs.length,
        ips: suspiciousIPs.map(ip => ({
          ip: ip._id,
          failedAttempts: ip.count,
          targetedUsers: ip.usernames,
        })),
      });
    } catch (error) {
      console.error('[SECURITY API] Error fetching suspicious IPs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suspicious IPs',
      });
    }
  }
);

module.exports = router;
