const express = require("express");
const router = express.Router();
const verifyJWT = require("../../middlewares/verifyJWT");
const verifyRoles = require("../../middlewares/verifyRoles");
const roles = require("../../config/roles");

const {
    getAllProgram,
    postProgram,
    editProgram,
    deleteProgram,
    postProgramItem,
    deleteProgramItem,
    getProgramByTitle
} = require("../../controller/talipapanatinController");

router
    .route("/")
    .get(getAllProgram)
    .post(verifyJWT, verifyRoles(roles.SuperAdmin), postProgram);

router
    .route("/:id")
    .all(verifyJWT, verifyRoles(roles.SuperAdmin))
    .put(editProgram)
    .delete(deleteProgram);

router
    .route("/:id/items")
    .all(verifyJWT, verifyRoles(roles.SuperAdmin))
    .post(postProgramItem);

router
    .route("/:id/items/:itemId")
    .all(verifyJWT, verifyRoles(roles.SuperAdmin))
    .delete(deleteProgramItem);

router
    .route("/title/:title")
    .all(verifyJWT, verifyRoles(roles.SuperAdmin))
    .get(getProgramByTitle);

module.exports = router;