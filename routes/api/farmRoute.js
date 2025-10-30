const express = require('express');
const router = express.Router();
const { getFarms, addFarm } = require('../../controller/farmController');
const verifyJWT = require('../../middlewares/verifyJWT');
const verifyRoles = require('../../middlewares/verifyRoles');
const ROLES = require('../../config/roles');
const upload = require('../../middlewares/fileUpload');

router.route('/')
  .get(getFarms)
  .post(verifyJWT, verifyRoles(ROLES.SuperAdmin), upload.single("image"), addFarm)

module.exports = router;