const express = require("express");
const {
  getPageContent,
  postPageContents,
  updatePageContents,
  updatePageContentsWithImage,
  getCarouselItems,
  addCarouselItem,
  updateCarouselItem,
  deleteCarouselItem
} = require("../../controller/pageContentController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT');
const { checkPermission } = require('../../middlewares/checkPermission');
const { Permission } = require('../../middlewares/rbac.utils');
const upload = require('../../middlewares/fileUpload');

// Create page content - EDIT_CONTENT permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single('image'),
  postPageContents
);

// Get page content by id - VIEW_CONTENT permission required
router.get(
  "/:id",
  verifyJWT,
  checkPermission(Permission.VIEW_CONTENT),
  getPageContent
);

// Update page content - EDIT_CONTENT permission required
router.patch(
  "/:id",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  updatePageContents
);

// Update page content with image - EDIT_CONTENT permission required
router.patch(
  "/:id/withImage",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single('image'),
  updatePageContentsWithImage
);

// Get carousel items - VIEW_CONTENT permission required
router.get(
  '/:id/carousel',
  verifyJWT,
  checkPermission(Permission.VIEW_CONTENT),
  getCarouselItems
);

// Add carousel item - EDIT_CONTENT permission required
router.post(
  '/:id/carousel',
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single('image'),
  addCarouselItem
);

// Update carousel item - EDIT_CONTENT permission required
router.patch(
  '/:id/carousel/:carouselItemId',
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single('image'),
  updateCarouselItem
);

// Delete carousel item - DELETE_CONTENT permission required
router.delete(
  '/:id/carousel/:carouselItemId',
  verifyJWT,
  checkPermission(Permission.DELETE_CONTENT),
  deleteCarouselItem
);

module.exports = router;
