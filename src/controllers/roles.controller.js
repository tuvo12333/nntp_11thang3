const store = require("../store/memory");
const { requireFields, ensureId } = require("../utils/http");

async function createRole(req, res, next) {
  try {
    requireFields(req.body, ["name"]);
    const role = store.createRole({
      name: String(req.body.name).trim(),
      description: req.body.description,
    });
    return res.status(201).json(role);
  } catch (err) {
    return next(err);
  }
}

async function getRoles(_req, res, next) {
  try {
    const roles = store.listRoles();
    return res.json(roles);
  } catch (err) {
    return next(err);
  }
}

async function getRoleById(req, res, next) {
  try {
    ensureId(req.params.id);
    const role = store.getRole(Number(req.params.id));
    return res.json(role);
  } catch (err) {
    return next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    ensureId(req.params.id);
    const updates = { ...req.body };
    if (updates.name !== undefined) updates.name = String(updates.name).trim();
    const role = store.updateRole(Number(req.params.id), updates);
    return res.json(role);
  } catch (err) {
    return next(err);
  }
}

async function softDeleteRole(req, res, next) {
  try {
    ensureId(req.params.id);
    const role = store.deleteRole(Number(req.params.id));
    return res.json({ message: "Role soft-deleted", role });
  } catch (err) {
    return next(err);
  }
}

async function getUsersByRole(req, res, next) {
  try {
    ensureId(req.params.id, "role id");
    const data = store.listUsersByRoleId(Number(req.params.id));
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  softDeleteRole,
  getUsersByRole,
};


