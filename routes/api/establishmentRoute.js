const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

// Import controllers
const {
  createEstablishment,
  getAllEstablishments,
  getEstablishmentById,
  updateEstablishment,
  deleteEstablishment,
} = require("../../controller/establishmentController");

// Get all establishments - VIEW_GREEN_PAGES permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_GREEN_PAGES),
  getAllEstablishments
);

// Get establishment by ID - VIEW_GREEN_PAGES permission required
router.get(
  "/:id",
  verifyJWT,
  checkPermission(Permission.VIEW_GREEN_PAGES),
  getEstablishmentById
);

// Create establishment - MANAGE_GREEN_PAGES permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_GREEN_PAGES),
  createEstablishment
);

// Update establishment - MANAGE_GREEN_PAGES permission required
router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_GREEN_PAGES),
  updateEstablishment
);

// Delete establishment - MANAGE_GREEN_PAGES permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_GREEN_PAGES),
  deleteEstablishment
);

module.exports = router;
