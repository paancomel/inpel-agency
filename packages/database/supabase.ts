import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types.js";

export interface SupabaseEnvironment {
  NEXT_PUBLIC_SUPABASE_URL?: string | undefined;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string | undefined;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export type TypedSupabaseClient = SupabaseClient<Database>;

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

function readJwtRole(key: string): unknown {
  const payload = key.split(".")[1];

  if (!payload) {
    return undefined;
  }

  try {
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decodedPayload: unknown = JSON.parse(globalThis.atob(paddedBase64));

    if (typeof decodedPayload === "object" && decodedPayload !== null && "role" in decodedPayload) {
      return decodedPayload.role;
    }
  } catch {
    // Publishable keys are not necessarily JWTs, so an undecodable key is valid here.
  }

  return undefined;
}

/**
 * Validates the public environment values before a client is created.
 * The anon key is designed for browser use; never place a service-role key here.
 */
export function getSupabaseConfig(environment: SupabaseEnvironment): SupabaseConfig {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new SupabaseConfigurationError(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to the environment before importing @repo/database.",
    );
  }

  if (!anonKey) {
    throw new SupabaseConfigurationError(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to the environment before importing @repo/database.",
    );
  }

  if (anonKey.startsWith("sb_secret_") || readJwtRole(anonKey) === "service_role") {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must not contain a service-role or secret key.",
    );
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new TypeError("Unsupported Supabase URL protocol");
    }
  } catch {
    throw new SupabaseConfigurationError(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL.",
    );
  }

  return { url, anonKey };
}

/** Creates a strongly typed client, with optional environment injection for tests. */
export function createSupabaseClient(
  environment: SupabaseEnvironment = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
): TypedSupabaseClient {
  const { url, anonKey } = getSupabaseConfig(environment);

  return createClient<Database>(url, anonKey, {
    db: { schema: "public" },
  });
}

/** Shared browser-safe Supabase client for all portal applications. */
export const supabase: TypedSupabaseClient = createSupabaseClient();
