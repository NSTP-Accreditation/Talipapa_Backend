const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");

const {
  getAllFarmInventory,
  getFarmInventoryById,
  createFarmInventory,
  updateFarmInventory,
  updateFarmInventoryStocks,
  deleteFarmInventory,
  searchFarmInventory,
  getFarmInventoryBySubCategory,
  getLowStockFarmInventory,
} = require("../../controller/farmInventoryController");
const upload = require('../../middlewares/fileUpload');

// Get all farm inventory - VIEW_FARM_INVENTORY permission required
router.get(
  "/",
  verifyJWT,
  checkPermission(Permission.VIEW_FARM_INVENTORY),
  getAllFarmInventory
);

// Get low stock items - VIEW_FARM_INVENTORY permission required
router.get(
  "/low-stock",
  verifyJWT,
  checkPermission(Permission.VIEW_FARM_INVENTORY),
  getLowStockFarmInventory
);

// Search farm inventory - VIEW_FARM_INVENTORY permission required
router.get(
  "/search/:query",
  verifyJWT,
  checkPermission(Permission.VIEW_FARM_INVENTORY),
  searchFarmInventory
);

// Get by subcategory - VIEW_FARM_INVENTORY permission required
router.get(
  "/subcategory/:subCategory",
  verifyJWT,
  checkPermission(Permission.VIEW_FARM_INVENTORY),
  getFarmInventoryBySubCategory
);

// Get single item - VIEW_FARM_INVENTORY permission required
router.get(
  "/:id",
  verifyJWT,
  checkPermission(Permission.VIEW_FARM_INVENTORY),
  getFarmInventoryById
);

// Create farm inventory - MANAGE_FARM_INVENTORY permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_FARM_INVENTORY),
  upload.single("image"),
  createFarmInventory
);

// Update farm inventory - MANAGE_FARM_INVENTORY permission required
router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_FARM_INVENTORY),
  upload.single("image"),
  updateFarmInventory
);

// Update stocks - MANAGE_FARM_INVENTORY permission required
router.patch(
  "/:id/stocks",
  verifyJWT,
  checkPermission(Permission.MANAGE_FARM_INVENTORY),
  updateFarmInventoryStocks
);

// Delete farm inventory - MANAGE_FARM_INVENTORY permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_FARM_INVENTORY),
  deleteFarmInventory
);

module.exports = router;
