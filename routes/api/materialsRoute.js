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
const upload = require("../../middlewares/fileUpload");

// Get all materials - PUBLIC (no auth required)
router.get("/", getMaterials);

// Create material - MANAGE_TRADING permission required (Materials are part of Trading section)
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single("image"),
  createMaterial
);

// Delete all materials - MANAGE_TRADING permission required
router.delete(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  deleteAllMaterial
);

// Update material - MANAGE_TRADING permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single("image"),
  updateMaterial
);

router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single("image"),
  updateMaterial
);

// Delete material - MANAGE_TRADING permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  deleteMaterial
);

module.exports = router;
