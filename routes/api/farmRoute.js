const express = require('express');
const router = express.Router();
const { getFarms, addFarm } = require('../../controller/farmController');
const verifyJWT = require('../../middlewares/verifyJWT');
const { checkPermission } = require('../../middlewares/checkPermission');
const { Permission } = require('../../middlewares/rbac.utils');
const upload = require('../../middlewares/fileUpload');

// Get all farms - VIEW_GREEN_PAGES permission required
router.get(
  '/',
  verifyJWT,
  checkPermission(Permission.VIEW_GREEN_PAGES),
  getFarms
);

// Add farm - MANAGE_GREEN_PAGES permission required
router.post(
  '/',
  verifyJWT,
  checkPermission(Permission.MANAGE_GREEN_PAGES),
  upload.single("image"),
  addFarm
);

module.exports = router;