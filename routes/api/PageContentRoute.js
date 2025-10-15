const express = require("express");
const {
  getPageContent,
  postPageContents,
  updatePageContents,
} = require("../../controller/pageContentController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');

router.route("")
  .post(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), postPageContents);

// Get page content by id
router.get("/:id", getPageContent);

router.put("/:id", verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updatePageContents);

module.exports = router;
