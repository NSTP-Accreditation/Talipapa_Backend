const express = require("express");
const router = express.Router();
const { getAllLogs, postLogs } = require("../../controller/logsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router.get('/', verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin),getAllLogs)

module.exports = router;