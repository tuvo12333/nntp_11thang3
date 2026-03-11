function $(id) {
  return document.getElementById(id);
}

function baseUrl() {
  const raw = $("baseUrl").value.trim();
  return raw.replace(/\/+$/, "");
}

function setBaseUrl(url) {
  $("baseUrl").value = url;
  localStorage.setItem("apiBaseUrl", url);
}

async function api(path, options) {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options && options.headers) },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.message) || `HTTP ${res.status}`;
    throw new Error(typeof data === "string" ? data : msg);
  }
  return data;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusTag(status) {
  return status ? `<span class="tag ok">enabled</span>` : `<span class="tag off">disabled</span>`;
}

async function reloadRoles() {
  const roles = await api("/roles");

  const tbody = $("rolesTbody");
  tbody.innerHTML = roles
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.id)}</td>
        <td><span class="tag">${escapeHtml(r.name)}</span></td>
        <td class="muted">${escapeHtml(r.description)}</td>
        <td class="right">
          <button class="btn danger" data-role-del="${escapeHtml(r.id)}">Soft delete</button>
        </td>
      </tr>
    `
    )
    .join("");

  // update role dropdown
  const sel = $("userRoleId");
  const current = sel.value;
  sel.innerHTML =
    `<option value="">(none)</option>` +
    roles.map((r) => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} (#${escapeHtml(r.id)})</option>`).join("");
  if ([...sel.options].some((o) => o.value === current)) sel.value = current;

  // wire delete buttons
  [...document.querySelectorAll("[data-role-del]")].forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-role-del");
      if (!confirm(`Soft delete role #${id}?`)) return;
      await api(`/roles/${id}`, { method: "DELETE" });
      await reloadRoles();
      await reloadUsers();
    });
  });
}

async function reloadUsers() {
  const users = await api("/users");
  const tbody = $("usersTbody");
  tbody.innerHTML = users
    .map((u) => {
      const roleLabel = u.role ? `${u.role.name} (#${u.role.id})` : "(none)";
      return `
        <tr>
          <td>${escapeHtml(u.id)}</td>
          <td>
            <div><b>${escapeHtml(u.username)}</b></div>
            <div class="muted">${escapeHtml(u.fullName || "")}</div>
          </td>
          <td>${escapeHtml(u.email)}</td>
          <td class="muted">${escapeHtml(roleLabel)}</td>
          <td>${statusTag(u.status)}</td>
          <td class="right">
            <button class="btn danger" data-user-del="${escapeHtml(u.id)}">Soft delete</button>
          </td>
        </tr>
      `;
    })
    .join("");

  [...document.querySelectorAll("[data-user-del]")].forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-user-del");
      if (!confirm(`Soft delete user #${id}?`)) return;
      await api(`/users/${id}`, { method: "DELETE" });
      await reloadUsers();
    });
  });
}

async function createRole() {
  const name = $("roleName").value.trim();
  const description = $("roleDesc").value.trim();
  await api("/roles", { method: "POST", body: JSON.stringify({ name, description }) });
  $("roleName").value = "";
  $("roleDesc").value = "";
  await reloadRoles();
}

async function createUser() {
  const username = $("userUsername").value.trim();
  const email = $("userEmail").value.trim();
  const password = $("userPassword").value;
  const fullName = $("userFullName").value.trim();
  const avatarUrl = $("userAvatar").value.trim();
  const roleIdRaw = $("userRoleId").value;
  const loginCountRaw = $("userLoginCount").value.trim();

  const body = {
    username,
    email,
    password,
    fullName,
    avatarUrl,
    loginCount: Number(loginCountRaw || 0),
  };
  if (roleIdRaw) body.roleId = Number(roleIdRaw);

  await api("/users", { method: "POST", body: JSON.stringify(body) });
  $("userUsername").value = "";
  $("userEmail").value = "";
  $("userPassword").value = "";
  await reloadUsers();
}

async function enableDisable(status) {
  const email = $("toggleEmail").value.trim();
  const username = $("toggleUsername").value.trim();
  const path = status ? "/users/enable" : "/users/disable";
  await api(path, { method: "POST", body: JSON.stringify({ email, username }) });
  await reloadUsers();
}

async function queryUsersByRole() {
  const id = $("roleIdQuery").value.trim();
  const out = $("usersByRoleOut");
  out.textContent = "Loading...";
  try {
    const data = await api(`/roles/${encodeURIComponent(id)}/users`);
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = String(e.message || e);
  }
}

function toastError(err) {
  alert(err?.message || String(err));
}

async function boot() {
  const saved = localStorage.getItem("apiBaseUrl");
  if (saved) setBaseUrl(saved);
  else setBaseUrl(location.origin);

  $("btnUseCurrent").addEventListener("click", () => setBaseUrl(location.origin));
  $("btnCreateRole").addEventListener("click", () => createRole().catch(toastError));
  $("btnReloadRoles").addEventListener("click", () => reloadRoles().catch(toastError));
  $("btnCreateUser").addEventListener("click", () => createUser().catch(toastError));
  $("btnReloadUsers").addEventListener("click", () => reloadUsers().catch(toastError));
  $("btnEnable").addEventListener("click", () => enableDisable(true).catch(toastError));
  $("btnDisable").addEventListener("click", () => enableDisable(false).catch(toastError));
  $("btnQueryUsersByRole").addEventListener("click", () => queryUsersByRole().catch(toastError));

  await reloadRoles();
  await reloadUsers();
}

boot().catch(toastError);


