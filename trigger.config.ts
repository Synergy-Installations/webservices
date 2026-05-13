import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF! || "proj_lhpldvpiqdnqtlssnzgm", // e.g. "proj_abc123"
  runtime: "node",
  logLevel: "info",
  // Default duration for tasks; overridable per-task
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: { maxAttempts: 3, factor: 2, minTimeoutInMs: 2_000 },
  },
  dirs: ["./packages/frontend/backend/dashboard/src/trigger"],
  // Build dependencies into the worker bundle.
  // pdf-parse and pdfjs-dist sometimes trip over Trigger.dev's bundler;
  // mark them external so the runtime resolves them from node_modules.
  build: {
    external: ["pdf-parse", "tesseract.js"],
  },
});
