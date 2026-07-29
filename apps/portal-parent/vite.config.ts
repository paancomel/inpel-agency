import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(
        environment.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(
        environment.NEXT_PUBLIC_SUPABASE_URL ?? "",
      ),
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      css: true,
      pool: "threads",
      maxWorkers: 1,
      fileParallelism: false,
      testTimeout: 15_000,
      hookTimeout: 5_000,
      teardownTimeout: 5_000,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
      },
    },
  };
});
