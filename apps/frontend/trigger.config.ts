import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF!,
  runtime: "node",
  logLevel: "info",
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: { maxAttempts: 3, factor: 2, minTimeoutInMs: 2_000 },
  },
  dirs: ["../../packages/frontend/backend/dashboard/src/trigger"],
  build: {
    external: ["pdf-parse"],
  },
});
