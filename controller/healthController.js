const mongoose = require("mongoose");

/**
 * Basic health check endpoint
 * - Returns uptime, node env, process memory usage, and DB connection state
 * - Responds 200 when service is running (DB may be disconnected)
 * - Responds 500 when critical failures are detected (optional enhancement)
 */
const getHealthStatus = async (req, res) => {
  try {
    const dbStateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    // Decide whether to check DB state
    // - If process.env.HEALTH_CHECK_DB is set to 'true', always include DB state
    // - If query param db=true is provided, include DB state for this request
    // - Otherwise do not check DB to keep health endpoint light for uptime bots
    const shouldCheckDB =
      String(process.env.HEALTH_CHECK_DB || "").toLowerCase() === "true" ||
      String(req.query.db || "").toLowerCase() === "true" ||
      req.query.db === "1";

    const dbState = shouldCheckDB
      ? dbStateMap[mongoose.connection.readyState] || "unknown"
      : "not-checked";
    // Minimal health payload
    const payload = {
      status: "ok",
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      db: dbState,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    // If DB is disconnected, we still return 200 to avoid false negative checks
    // but include information about the DB state for monitoring.
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(500).json({ status: "error", error: error.message });
  }
};

module.exports = { getHealthStatus };
