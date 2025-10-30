const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../../config/awsConfig");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

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

// Public routes (no authentication required for viewing)
router.get("/", getAllFarmInventory);
router.get("/low-stock", getLowStockFarmInventory);
router.get("/search/:query", searchFarmInventory);
router.get("/subcategory/:subCategory", getFarmInventoryBySubCategory);
router.get("/:id", getFarmInventoryById);

// Protected routes (require authentication and admin role)
router.post(
  "/",
  verifyJWT,
  verifyRoles(roles.SuperAdmin),
  upload.single("image"),
  createFarmInventory
);

router.patch(
  "/:id",
  verifyJWT,
  verifyRoles(roles.SuperAdmin),
  upload.single("image"),
  updateFarmInventory
);

router.patch(
  "/:id/stocks",
  verifyJWT,
  verifyRoles(roles.SuperAdmin),
  updateFarmInventoryStocks
);

router.delete(
  "/:id",
  verifyJWT,
  verifyRoles(roles.SuperAdmin),
  deleteFarmInventory
);

module.exports = router;
