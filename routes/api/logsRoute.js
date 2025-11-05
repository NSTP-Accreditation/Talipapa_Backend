const express = require("express");
const router = express.Router();
const {
  getAllLogsPaginated,
  getAllLogs,
} = require("../../controller/logsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Get all logs (unpaginated) - VIEW_ACTIVITY_LOGS permission required
router.get(
  "/all",
  verifyJWT,
  checkPermission(Permission.VIEW_ACTIVITY_LOGS),
  getAllLogs
);

// Get logs (paginated) - VIEW_ACTIVITY_LOGS permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_ACTIVITY_LOGS),
  getAllLogsPaginated
);

module.exports = router;
