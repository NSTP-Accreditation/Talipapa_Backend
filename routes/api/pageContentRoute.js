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
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');
const upload = require('../../middlewares/fileUpload');

router.route("")
  .post(verifyJWT, verifyRoles(roles.SuperAdmin), upload.single('image'), postPageContents);

// Get page content by id
router.get("/:id", getPageContent);

router.patch("/:id", verifyJWT, verifyRoles(roles.SuperAdmin), updatePageContents);

router.patch("/:id/withImage",verifyJWT, verifyRoles(roles.SuperAdmin), upload.single('image'), updatePageContentsWithImage)


router.get('/:id/carousel', getCarouselItems);
router.post('/:id/carousel', upload.single('image'), addCarouselItem);
router.patch('/:id/carousel/:carouselItemId', upload.single('image'), updateCarouselItem);
router.delete('/:id/carousel/:carouselItemId', deleteCarouselItem);


module.exports = router;
