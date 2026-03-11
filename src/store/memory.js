const { HttpError } = require("../utils/http");

const state = {
  roleSeq: 1,
  userSeq: 1,
  roles: [],
  users: [],
};

function nowIso() {
  return new Date().toISOString();
}

function isDeleted(row) {
  return row.isDeleted === true;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pickRoleSafe(role) {
  return clone(role);
}

function pickUserSafe(user) {
  const u = clone(user);
  delete u.password;
  return u;
}

function findRoleById(id) {
  const role = state.roles.find((r) => r.id === id && !isDeleted(r));
  return role || null;
}

function findUserById(id) {
  const user = state.users.find((u) => u.id === id && !isDeleted(u));
  return user || null;
}

function requireUniqueRoleName(name, excludeId) {
  const exists = state.roles.some(
    (r) => !isDeleted(r) && r.name === name && (excludeId === undefined || r.id !== excludeId)
  );
  if (exists) throw new HttpError(409, "Duplicate key", { keys: ["name"] });
}

function requireUniqueUser(username, email, excludeId) {
  const un = username ?? null;
  const em = email ?? null;
  if (un !== null) {
    const existsUsername = state.users.some(
      (u) => !isDeleted(u) && u.username === un && (excludeId === undefined || u.id !== excludeId)
    );
    if (existsUsername) throw new HttpError(409, "Duplicate key", { keys: ["username"] });
  }
  if (em !== null) {
    const existsEmail = state.users.some(
      (u) => !isDeleted(u) && u.email === em && (excludeId === undefined || u.id !== excludeId)
    );
    if (existsEmail) throw new HttpError(409, "Duplicate key", { keys: ["email"] });
  }
}

function attachRole(user) {
  const role = user.roleId ? findRoleById(user.roleId) : null;
  return { ...pickUserSafe(user), role: role ? pickRoleSafe(role) : null };
}

// ROLE
function createRole({ name, description }) {
  requireUniqueRoleName(name);
  const role = {
    id: state.roleSeq++,
    name,
    description: description ?? "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDeleted: false,
    deletedAt: null,
  };
  state.roles.push(role);
  return pickRoleSafe(role);
}

function listRoles() {
  return state.roles.filter((r) => !isDeleted(r)).map(pickRoleSafe);
}

function getRole(id) {
  const role = findRoleById(id);
  if (!role) throw new HttpError(404, "Role not found");
  return pickRoleSafe(role);
}

function updateRole(id, updates) {
  const role = findRoleById(id);
  if (!role) throw new HttpError(404, "Role not found");

  if (updates.name !== undefined) {
    requireUniqueRoleName(updates.name, id);
    role.name = updates.name;
  }
  if (updates.description !== undefined) role.description = updates.description ?? "";

  role.updatedAt = nowIso();
  return pickRoleSafe(role);
}

function deleteRole(id) {
  const role = findRoleById(id);
  if (!role) throw new HttpError(404, "Role not found");
  role.isDeleted = true;
  role.deletedAt = nowIso();
  role.updatedAt = nowIso();
  return pickRoleSafe(role);
}

// USER
function createUser({ username, password, email, fullName, avatarUrl, status, roleId, loginCount }) {
  requireUniqueUser(username, email);
  const user = {
    id: state.userSeq++,
    username,
    password,
    email,
    fullName: fullName ?? "",
    avatarUrl: avatarUrl ?? "https://i.sstatic.net/l60Hf.png",
    status: status ?? false,
    roleId: roleId ?? null,
    loginCount: loginCount ?? 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    isDeleted: false,
    deletedAt: null,
  };

  if (user.loginCount < 0) throw new HttpError(400, "loginCount must be >= 0");
  if (user.roleId !== null && !findRoleById(user.roleId)) {
    throw new HttpError(400, "Invalid roleId");
  }

  state.users.push(user);
  return attachRole(user);
}

function listUsers() {
  return state.users.filter((u) => !isDeleted(u)).map(attachRole);
}

function getUser(id) {
  const user = findUserById(id);
  if (!user) throw new HttpError(404, "User not found");
  return attachRole(user);
}

function updateUser(id, updates) {
  const user = findUserById(id);
  if (!user) throw new HttpError(404, "User not found");

  const nextUsername = updates.username !== undefined ? updates.username : user.username;
  const nextEmail = updates.email !== undefined ? updates.email : user.email;
  requireUniqueUser(nextUsername, nextEmail, id);

  if (updates.username !== undefined) user.username = updates.username;
  if (updates.email !== undefined) user.email = updates.email;
  if (updates.fullName !== undefined) user.fullName = updates.fullName ?? "";
  if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl ?? "https://i.sstatic.net/l60Hf.png";
  if (updates.status !== undefined) user.status = Boolean(updates.status);
  if (updates.loginCount !== undefined) {
    if (Number(updates.loginCount) < 0) throw new HttpError(400, "loginCount must be >= 0");
    user.loginCount = Number(updates.loginCount);
  }
  if (updates.roleId !== undefined) {
    const rid = updates.roleId === null ? null : Number(updates.roleId);
    if (rid !== null && !findRoleById(rid)) throw new HttpError(400, "Invalid roleId");
    user.roleId = rid;
  }

  user.updatedAt = nowIso();
  return attachRole(user);
}

function deleteUser(id) {
  const user = findUserById(id);
  if (!user) throw new HttpError(404, "User not found");
  user.isDeleted = true;
  user.deletedAt = nowIso();
  user.updatedAt = nowIso();
  return attachRole(user);
}

function setUserStatusByEmailUsername({ email, username, status }) {
  const em = String(email).toLowerCase().trim();
  const un = String(username).trim();
  const user = state.users.find((u) => !isDeleted(u) && u.email === em && u.username === un);
  if (!user) throw new HttpError(404, "User not found or info not match");
  user.status = Boolean(status);
  user.updatedAt = nowIso();
  return attachRole(user);
}

function listUsersByRoleId(roleId) {
  const role = findRoleById(roleId);
  if (!role) throw new HttpError(404, "Role not found");
  const users = state.users.filter((u) => !isDeleted(u) && u.roleId === roleId).map(attachRole);
  return { role: pickRoleSafe(role), users };
}

module.exports = {
  // role
  createRole,
  listRoles,
  getRole,
  updateRole,
  deleteRole,
  // user
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  setUserStatusByEmailUsername,
  listUsersByRoleId,
};


