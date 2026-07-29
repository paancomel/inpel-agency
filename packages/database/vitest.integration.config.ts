import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Portal contract sources are compiled inside this isolated database audit.
  // Resolve their Zod import from the audit runner, not from an uncommitted portal package.
  resolve: {
    alias: {
      zod: fileURLToPath(new URL("./node_modules/zod/index.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
    hookTimeout: 120_000,
    include: ["audit-flow.test.ts"],
    maxWorkers: 1,
    passWithNoTests: false,
    pool: "threads",
    setupFiles: ["./vitest.integration.setup.ts"],
    testTimeout: 120_000,
  },
});
