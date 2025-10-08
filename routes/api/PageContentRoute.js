const express = require("express");
const {
  getAllPageContents,
  postPageContents,
  updatePageContents,
} = require("../../controller/pageContentController");

const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT')
const verifyRoles = require('../../middlewares/verifyRoles')
const roles = require('../../config/roles');

router.route("")
      .get(getAllPageContents)
      .post(verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), postPageContents);

router.put("/:id", verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updatePageContents);

module.exports = router;
