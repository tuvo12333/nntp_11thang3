const store = require("../store/memory");
const { requireFields, ensureId } = require("../utils/http");

async function createUser(req, res, next) {
  try {
    requireFields(req.body, ["username", "password", "email"]);
    const user = store.createUser({
      username: String(req.body.username).trim(),
      password: req.body.password,
      email: String(req.body.email).toLowerCase().trim(),
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      roleId: req.body.roleId ?? req.body.role,
      loginCount: req.body.loginCount,
    });
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = store.listUsers();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    ensureId(req.params.id);
    const user = store.getUser(Number(req.params.id));
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    ensureId(req.params.id);
    const updates = { ...req.body };
    delete updates.password; // optional: do not allow update password here
    if (updates.email !== undefined) updates.email = String(updates.email).toLowerCase().trim();
    if (updates.username !== undefined) updates.username = String(updates.username).trim();
    if (updates.role !== undefined && updates.roleId === undefined) updates.roleId = updates.role;
    delete updates.role;

    const user = store.updateUser(Number(req.params.id), updates);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function softDeleteUser(req, res, next) {
  try {
    ensureId(req.params.id);
    const user = store.deleteUser(Number(req.params.id));
    return res.json({ message: "User soft-deleted", user });
  } catch (err) {
    return next(err);
  }
}

async function enableUser(req, res, next) {
  try {
    requireFields(req.body, ["email", "username"]);
    const { email, username } = req.body;
    const user = store.setUserStatusByEmailUsername({ email, username, status: true });
    return res.json({ message: "Enabled", user });
  } catch (err) {
    return next(err);
  }
}

async function disableUser(req, res, next) {
  try {
    requireFields(req.body, ["email", "username"]);
    const { email, username } = req.body;
    const user = store.setUserStatusByEmailUsername({ email, username, status: false });
    return res.json({ message: "Disabled", user });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  enableUser,
  disableUser,
};


