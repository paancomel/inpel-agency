export default {
  test: {
    environment: "node",
    // Supplying `exclude` replaces Vitest's defaults. Keep dependencies out
    // of this package's suite while the staging-only audit remains separate.
    exclude: ["audit-flow.test.ts", "**/node_modules/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
};
