const express = require("express");
const router = express.Router();
const { getAllLogsPaginated, getAllLogs } = require("../../controller/logsController");
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

router.get('/all', verifyJWT, verifyRoles(roles.Admin), getAllLogs)
router.get('/', verifyJWT, verifyRoles(roles.Admin), getAllLogsPaginated)

module.exports = router;