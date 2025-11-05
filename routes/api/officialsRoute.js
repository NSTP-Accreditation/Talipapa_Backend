const express = require("express");
const {
  getAllOfficials,
  postOfficials,
  updateOfficials,
  deleteOfficials,
  bulkUpdate,
} = require("../../controller/officialsController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT');
const { checkPermission } = require('../../middlewares/checkPermission');
const { Permission } = require('../../middlewares/rbac.utils');
const upload = require('../../middlewares/fileUpload');

// Get all officials - VIEW_CONTENT permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_CONTENT),
  getAllOfficials
);

// Create official - EDIT_CONTENT permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single('image'),
  postOfficials
);

// Bulk update officials - EDIT_CONTENT permission required
router.put(
  "/bulk-update",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  bulkUpdate
);

// Update official - EDIT_CONTENT permission required
router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single("image"),
  updateOfficials
);

// Delete official - DELETE_CONTENT permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.DELETE_CONTENT),
  deleteOfficials
);

module.exports = router;
