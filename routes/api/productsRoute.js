const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../../controller/productController');
const verifyJWT = require('../../middlewares/verifyJWT');
const { checkPermission } = require('../../middlewares/checkPermission');
const { Permission } = require('../../middlewares/rbac.utils');
const upload = require('../../middlewares/fileUpload');

// Get all products - VIEW_TRADING permission required
router.get(
  '/',
  verifyJWT,
  checkPermission(Permission.VIEW_TRADING),
  getProducts
);

// Create product - MANAGE_TRADING permission required
router.post(
  '/',
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single('image'),
  createProduct
);

// Update product - MANAGE_TRADING permission required
router.patch(
  '/:id',
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  upload.single('image'),
  updateProduct
);

// Delete product - MANAGE_TRADING permission required
router.delete(
  '/:id',
  verifyJWT,
  checkPermission(Permission.MANAGE_TRADING),
  deleteProduct
);

module.exports = router;