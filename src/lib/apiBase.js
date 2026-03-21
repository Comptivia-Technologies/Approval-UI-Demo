/**
 * API origin (no path). Empty → same-origin `/api/...` (dev: API is mounted on Vite :3000).
 * Set VITE_API_URL when the SPA calls a separate API host (production or npm run dev:split).
 */
export function getClientApiBase() {
  return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
}
