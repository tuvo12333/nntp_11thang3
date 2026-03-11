const express = require("express");
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  softDeleteRole,
  getUsersByRole,
} = require("../controllers/roles.controller");

const router = express.Router();

// CRUD
router.post("/", createRole);
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.put("/:id", updateRole);
router.delete("/:id", softDeleteRole);

// requirement: /roles/id/users
router.get("/:id/users", getUsersByRole);

module.exports = router;


