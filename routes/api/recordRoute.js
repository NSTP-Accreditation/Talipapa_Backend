const express = require('express');
const router = express.Router();
const { getRecords, createRecord, updateRecord, getSingleRecord, searchRecords } = require('../../controller/recordController');
const verifyJWT = require('../../middlewares/verifyJWT');
const verifyRoles = require('../../middlewares/verifyRoles');
const roles = require('../../config/roles');

router.route('/')
  .all(verifyJWT, verifyRoles(roles.Admin, roles.SuperAdmin))
  .get(getRecords)
  .post(createRecord)

router.get('/search', verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), searchRecords)
router.patch('/:record_id', verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), updateRecord)
router.get('/:record_id', verifyJWT, verifyRoles(roles.SuperAdmin, roles.Admin), getSingleRecord)

module.exports = router;