const express = require("express");
const router = express.Router();
const { getHealthStatus } = require("../../controller/healthController");

// Public health endpoint (no authentication)
router.get("/", getHealthStatus);

module.exports = router;
