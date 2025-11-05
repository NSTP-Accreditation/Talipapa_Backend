const express = require("express");
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteAllMaterial,
} = require("../../controller/materialController");
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");
const upload = require('../../middlewares/fileUpload');

// Get all materials - VIEW_INVENTORY permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_INVENTORY),
  getMaterials
);

// Create material - MANAGE_INVENTORY permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_INVENTORY),
  upload.single('image'),
  createMaterial
);

// Delete all materials - MANAGE_INVENTORY permission required
router.delete(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_INVENTORY),
  deleteAllMaterial
);

// Update material - MANAGE_INVENTORY permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_INVENTORY),
  upload.single('image'),
  updateMaterial
);

router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_INVENTORY),
  upload.single('image'),
  updateMaterial
);

// Delete material - MANAGE_INVENTORY permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_INVENTORY),
  deleteMaterial
);

module.exports = router;
