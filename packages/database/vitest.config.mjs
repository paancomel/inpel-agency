export default {
  test: {
    environment: "node",
    exclude: ["audit-flow.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
};
