const express = require("express");
const {
  getPageContent,
  postPageContents,
  updatePageContents,
  updatePageContentsWithImage,
} = require("../../controller/pageContentController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');
const upload = require('../../middlewares/fileUpload');

router.route("")
  .post(verifyJWT, verifyRoles(roles.Admin), upload.single('image'), postPageContents);

// Get page content by id
router.get("/:id", getPageContent);

router.patch("/:id", verifyJWT, verifyRoles(roles.Admin), updatePageContents);

router.patch("/:id/withImage",verifyJWT, verifyRoles(roles.Admin), upload.single('image'), updatePageContentsWithImage)

module.exports = router;
