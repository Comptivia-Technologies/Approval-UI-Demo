import { authService } from "./authService.js";
import { getClientApiBase } from "../lib/apiBase.js";

/**
 * @param {Record<string, unknown>} raw
 */
function normalizeTask(raw) {
  return {
    id: String(raw.taskId ?? raw.id ?? ""),
    taskName: typeof raw.taskName === "string" ? raw.taskName : "",
    description: typeof raw.description === "string" ? raw.description : "",
    status: typeof raw.status === "string" ? raw.status : "",
    stageName: typeof raw.stageName === "string" ? raw.stageName : "",
    priority: typeof raw.priority === "string" ? raw.priority : "",
    assigneeName:
      raw.assignedToMemberName == null || raw.assignedToMemberName === ""
        ? null
        : String(raw.assignedToMemberName),
  };
}

/** @param {string} text */
function normalizedTasksFromResponseBody(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) {
    return [];
  }

  let parsed = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid tasks response");
  }

  let rows;
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.data)) {
      rows = parsed.data;
    } else if (parsed.data === null || parsed.data === undefined) {
      rows = [];
    } else {
      rows = null;
    }
  } else {
    rows = null;
  }
  if (rows === null) {
    throw new Error("Invalid tasks response");
  }
  return rows.map(normalizeTask).filter((t) => t.id);
}

async function loadTasksFromUrl(url, errorVerb) {
  const token = await authService.getIdToken();
  const res = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  /** Many task APIs return 404/204 when there is nothing to list — treat as empty, not an error. */
  if (res.status === 404 || res.status === 204) {
    return [];
  }
  if (!res.ok) {
    let msg = `${errorVerb} (${res.status})`;
    try {
      const j = JSON.parse(text);
      if (j.message || j.error) msg = String(j.message || j.error);
    } catch {
      if (text) msg = text.slice(0, 300);
    }
    throw new Error(msg);
  }

  return normalizedTasksFromResponseBody(text);
}

/**
 * List organization tasks (proxied GET /api/tasks, Bearer token).
 * @returns {Promise<Array<{ id: string; taskName: string; description: string; status: string; priority: string; assigneeName: string | null }>>}
 */
export async function fetchOrganizationTasks() {
  const base = getClientApiBase();
  return loadTasksFromUrl(`${base}/api/tasks`, "Could not load tasks");
}

/**
 * Tasks assigned to the signed-in user (Firebase uid = JWT `sub`).
 * Proxied GET /api/tasks/user/:userId
 */
export async function fetchMemberTasksForCurrentUser() {
  const uid = authService.getCurrentUser()?.uid;
  if (!uid) {
    throw new Error("Not signed in");
  }
  const base = getClientApiBase();
  const path = `/api/tasks/user/${encodeURIComponent(uid)}`;
  return loadTasksFromUrl(`${base}${path}`, "Could not load tasks");
}

/**
 * Create task via workflow API (proxied at POST /api/task-service).
 * @param {{ taskName: string; description?: string }} params
 */
export async function createTaskRemote({ taskName, description = "" }) {
  const base = getClientApiBase();
  const token = await authService.getIdToken();
  const res = await fetch(`${base}/api/task-service`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      taskName: taskName.trim(),
      description: typeof description === "string" ? description.trim() : "",
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `Could not create task (${res.status})`;
    try {
      const j = JSON.parse(text);
      if (j.message || j.error) msg = String(j.message || j.error);
    } catch {
      if (text) msg = text.slice(0, 300);
    }
    throw new Error(msg);
  }

  let raw = null;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = null;
  }
  const id =
    raw?.id ??
    raw?.taskId ??
    raw?.data?.id ??
    raw?.task?.id ??
    null;
  return { id, raw };
}

/**
 * Complete current workflow stage for a task (proxied POST).
 * @param {string} taskId
 * @param {Record<string, unknown>} [body] optional payload for upstream
 */
export async function completeTaskStage(taskId, body = {}) {
  const base = getClientApiBase();
  const token = await authService.getIdToken();
  if (!token) {
    throw new Error("Not signed in");
  }
  const id = String(taskId ?? "").trim();
  if (!id) {
    throw new Error("Task ID is required");
  }

  const res = await fetch(`${base}/api/task-service/complete-stage/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body && typeof body === "object" ? body : {}),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `Could not complete stage (${res.status})`;
    try {
      const j = JSON.parse(text);
      if (j.message || j.error) msg = String(j.message || j.error);
    } catch {
      if (text) msg = text.slice(0, 300);
    }
    throw new Error(msg);
  }

  let raw = null;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = text || null;
  }
  return { raw };
}
