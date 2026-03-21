const SESSION_ROLE_KEY = "workflow_demo_app_role";

function roleKeyForUid(uid) {
  return `workflow_demo_role_${uid}`;
}

/** @param {"admin" | "member"} appRole @param {string | undefined} uid Firebase user id */
export function persistSessionRole(appRole, uid) {
  sessionStorage.setItem(SESSION_ROLE_KEY, appRole);
  if (uid) {
    localStorage.setItem(roleKeyForUid(uid), appRole);
  }
}

/** Prefer per-uid localStorage so refresh survives; fall back to session key for older sessions. */
export function readSessionRole(uid) {
  if (uid) {
    const fromLs = localStorage.getItem(roleKeyForUid(uid));
    if (fromLs === "admin" || fromLs === "member") return fromLs;
  }
  const r = sessionStorage.getItem(SESSION_ROLE_KEY);
  return r === "admin" || r === "member" ? r : null;
}

/** Call from logout with the current Firebase uid. */
export function clearSessionRole(uid) {
  sessionStorage.removeItem(SESSION_ROLE_KEY);
  if (uid) {
    localStorage.removeItem(roleKeyForUid(uid));
  }
}
