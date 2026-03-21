/**
 * Standalone API (default port 5000). For local dev you usually only need: npm run dev (API is inside Vite on :3000).
 */
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT} (standalone — or use npm run dev for API + UI on :3000)`);
});
