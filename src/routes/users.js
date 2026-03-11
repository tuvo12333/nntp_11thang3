const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  enableUser,
  disableUser,
} = require("../controllers/users.controller");

const router = express.Router();

// special actions
router.post("/enable", enableUser);
router.post("/disable", disableUser);

// CRUD
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", softDeleteUser);

module.exports = router;


