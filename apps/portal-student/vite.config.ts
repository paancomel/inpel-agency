import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const workspaceEnvDir = resolve(process.cwd(), "../..");
  const environment = loadEnv(mode, workspaceEnvDir, "VITE_");
  const supabaseUrl = environment.VITE_SUPABASE_URL ?? "";
  const supabasePublishableKey = environment.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

  return {
    envDir: workspaceEnvDir,
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "process.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
      "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(supabasePublishableKey),
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
      },
    },
  };
});
