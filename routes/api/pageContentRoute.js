const express = require("express");
const {
  getPageContent,
  postPageContents,
  updatePageContents,
  updatePageContentsWithImage,
  getCarouselItems,
  addCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
  reorderCarouselSlides,
} = require("../../controller/pageContentController");

const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const { checkPermission } = require("../../middlewares/checkPermission");
const { Permission } = require("../../middlewares/rbac.utils");
const upload = require("../../middlewares/fileUpload");

// Create page content - EDIT_CONTENT permission required
router.post(
  "/",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single("image"),
  postPageContents
);

// Get page content by id - PUBLIC (no auth required)
router.get("/:id", getPageContent);

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
  upload.single("image"),
  updatePageContentsWithImage
);

// Get carousel items - PUBLIC (no auth required)
router.get("/:id/carousel", getCarouselItems);

// Add carousel item - EDIT_CONTENT permission required
router.post(
  "/:id/carousel",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single("image"),
  addCarouselItem
);

// Batch reorder carousel items - EDIT_CONTENT permission required
router.patch(
  "/:id/carousel/reorder",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  reorderCarouselSlides
);

// Update carousel item - EDIT_CONTENT permission required
router.patch(
  "/:id/carousel/:carouselItemId",
  verifyJWT,
  checkPermission(Permission.EDIT_CONTENT),
  upload.single("image"),
  updateCarouselItem
);

// Delete carousel item - DELETE_CONTENT permission required
router.delete(
  "/:id/carousel/:carouselItemId",
  verifyJWT,
  checkPermission(Permission.DELETE_CONTENT),
  deleteCarouselItem
);

module.exports = router;
