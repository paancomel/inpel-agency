import { defineConfig } from "vitest/config";

export default defineConfig({
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
