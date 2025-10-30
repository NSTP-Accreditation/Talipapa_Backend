const express = require("express");
const router = express.Router();
const { getAllLogsPaginated, getAllLogs } = require("../../controller/logsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router.get('/all', verifyJWT, verifyRoles(roles.SuperAdmin), getAllLogs)
router.get('/', verifyJWT, verifyRoles(roles.SuperAdmin), getAllLogsPaginated)

module.exports = router;