export default {
  define: {
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(""),
    "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(""),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
};
