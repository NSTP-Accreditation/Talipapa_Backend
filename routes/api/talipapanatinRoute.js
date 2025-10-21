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
    .post(verifyJWT, verifyRoles(roles.Admin), postProgram);

router
    .route("/:id")
    .all(verifyJWT, verifyRoles(roles.Admin))
    .put(editProgram)
    .delete(deleteProgram);

router
    .route("/:id/items")
    .all(verifyJWT, verifyRoles(roles.Admin))
    .post(postProgramItem);

router
    .route("/:id/items/:itemId")
    .all(verifyJWT, verifyRoles(roles.Admin))
    .delete(deleteProgramItem);

router
    .route("/title/:title")
    .all(verifyJWT, verifyRoles(roles.Admin))
    .get(getProgramByTitle);

module.exports = router;