/**
 * Express app (no listen). Used by Vite dev middleware and by server/index.js standalone.
 */
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

  /** Same base as Task Manager AuthService:BaseUrl / REACT_APP_AUTH_API_URL */
  const hubBase = (
    process.env.AUTH_SERVICE_BASE_URL ||
    process.env.AuthService__BaseUrl ||
    process.env.VITE_AUTH_API_URL ||
    process.env.VITE_PRODUCT_HUB_API_URL ||
    process.env.PRODUCT_HUB_API_URL ||
    ""
  ).replace(/\/$/, "");

  /** Task Manager workflow API (create task). Default matches Task Manager ALB / production host. */
  const workflowApiBase = (
    process.env.WORKFLOW_API_BASE_URL ||
    process.env.VITE_WORKFLOW_API_BASE_URL ||
    "https://api.workflowautomation.enginuo.com"
  ).replace(/\/$/, "");

  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    process.env.CLIENT_ORIGIN,
  ]
    .filter(Boolean)
    .concat(
      (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Do not use app.options("*", …) — Express 5 / path-to-regexp rejects bare "*".
  // app.use(cors(...)) above already answers CORS preflight (OPTIONS).

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      authServiceConfigured: Boolean(hubBase),
      workflowApiConfigured: Boolean(workflowApiBase),
    });
  });

  app.post("/api/auth/lookup-tenant", async (req, res) => {
    const email = req.body?.email;
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!hubBase) {
      return res.status(500).json({
        error:
          "Auth service URL not set. Use VITE_AUTH_API_URL (Task Manager: REACT_APP_AUTH_API_URL) or AUTH_SERVICE_BASE_URL.",
      });
    }
    const url = `${hubBase}/api/auth/tenant/${encodeURIComponent(email.trim())}`;
    try {
      const r = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).type(ct).send(text);
    } catch (e) {
      console.error("[api] lookup-tenant:", e);
      res.status(502).json({ error: "Upstream request failed", message: e?.message || String(e) });
    }
  });

  /**
   * Proxy: GET → upstream GET /api/tasks/user/:userId (member-scoped; forward Authorization).
   * userId matches Firebase JWT `sub` / `uid` unless your API documents otherwise.
   */
  app.get("/api/tasks/user/:userId", async (req, res) => {
    if (!workflowApiBase) {
      return res.status(500).json({ error: "WORKFLOW_API_BASE_URL not set" });
    }
    const userId = req.params.userId;
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({ error: "userId is required" });
    }
    const url = `${workflowApiBase}/api/tasks/user/${encodeURIComponent(userId.trim())}`;
    try {
      const r = await fetch(url, {
        headers: {
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        },
      });
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).type(ct).send(text);
    } catch (e) {
      console.error("[api] tasks/user GET:", e);
      res.status(502).json({ error: "Upstream request failed", message: e?.message || String(e) });
    }
  });

  /** Proxy: GET → upstream GET /api/tasks (org tasks; forward Authorization). */
  app.get("/api/tasks", async (req, res) => {
    if (!workflowApiBase) {
      return res.status(500).json({ error: "WORKFLOW_API_BASE_URL not set" });
    }
    const url = `${workflowApiBase}/api/tasks`;
    try {
      const r = await fetch(url, {
        headers: {
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        },
      });
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).type(ct).send(text);
    } catch (e) {
      console.error("[api] tasks GET:", e);
      res.status(502).json({ error: "Upstream request failed", message: e?.message || String(e) });
    }
  });

  /**
   * Proxy: POST → upstream POST /api/task-service/complete-stage/:taskId
   * Forwards Authorization; optional JSON body forwarded as-is (defaults to {}).
   */
  app.post("/api/task-service/complete-stage/:taskId", async (req, res) => {
    if (!workflowApiBase) {
      return res.status(500).json({ error: "WORKFLOW_API_BASE_URL not set" });
    }
    const taskId = req.params.taskId;
    if (!taskId || typeof taskId !== "string" || !taskId.trim()) {
      return res.status(400).json({ error: "taskId is required" });
    }
    const url = `${workflowApiBase}/api/task-service/complete-stage/${encodeURIComponent(taskId.trim())}`;
    const payload =
      req.body && typeof req.body === "object" && !Array.isArray(req.body) && Object.keys(req.body).length > 0
        ? req.body
        : {};
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        },
        body: JSON.stringify(payload),
      });
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).type(ct).send(text);
    } catch (e) {
      console.error("[api] complete-stage:", e);
      res.status(502).json({ error: "Upstream request failed", message: e?.message || String(e) });
    }
  });

  /** Proxy: POST body { taskName, description } → upstream POST /api/task-service */
  app.post("/api/task-service", async (req, res) => {
    if (!workflowApiBase) {
      return res.status(500).json({ error: "WORKFLOW_API_BASE_URL not set" });
    }
    const taskName = req.body?.taskName ?? req.body?.title;
    if (!taskName || typeof taskName !== "string" || !taskName.trim()) {
      return res.status(400).json({ error: "taskName is required" });
    }
    const description = typeof req.body?.description === "string" ? req.body.description : "";
    const payload = { taskName: taskName.trim(), description };
    const url = `${workflowApiBase}/api/task-service`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        },
        body: JSON.stringify(payload),
      });
      const text = await r.text();
      const ct = r.headers.get("content-type") || "application/json";
      res.status(r.status).type(ct).send(text);
    } catch (e) {
      console.error("[api] task-service:", e);
      res.status(502).json({ error: "Upstream request failed", message: e?.message || String(e) });
    }
  });

  return app;
}
