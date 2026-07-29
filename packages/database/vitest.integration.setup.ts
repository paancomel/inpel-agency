import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

// A package-local integration file wins; the repository .env is a convenient
// fallback for the public URL/key already used by the portal applications.
for (const candidate of [
  resolve(import.meta.dirname, ".env.integration.local"),
  resolve(import.meta.dirname, "../../.env"),
]) {
  if (existsSync(candidate)) loadEnvFile(candidate);
}

process.env.NEXT_PUBLIC_SUPABASE_URL ??= process.env.VITE_SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??=
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
