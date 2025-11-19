const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  updateProductStocks,
  deleteProduct,
} = require("../../controller/productController");
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");
const upload = require("../../middlewares/fileUpload");

// Get all products - PUBLIC (no auth required)
router.get("/", getProducts);

// Create product - MANAGE_TRADING permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single("image"),
  createProduct
);

// Update product with image - MANAGE_TRADING permission required
router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single("image"),
  updateProduct
);

// Update product stocks only (JSON) - MANAGE_TRADING permission required
router.put(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  updateProductStocks
);

// Delete product - MANAGE_TRADING permission required
router.delete(
  "/:id",
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  deleteProduct
);

module.exports = router;
