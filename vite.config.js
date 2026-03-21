import { defineConfig } from "vite";
import { createApp } from "./server/app.js";

/**
 * Dev / preview: Express mounted on Vite for `/api/*` — one process, one port (3000).
 * Production: build SPA + run `node server/index.js` (or host API separately, set VITE_API_URL).
 */
function apiPlugin() {
  let apiApp;
  return {
    name: "workflow-demo-api",
    configureServer(server) {
      apiApp = createApp();
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split("?")[0] || "";
        if (!pathOnly.startsWith("/api")) return next();
        apiApp(req, res, next);
      });
    },
    configurePreviewServer(server) {
      apiApp = createApp();
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split("?")[0] || "";
        if (!pathOnly.startsWith("/api")) return next();
        apiApp(req, res, next);
      });
    },
  };
}

export default defineConfig({
  plugins: [apiPlugin()],
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
  },
});
