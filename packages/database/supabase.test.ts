import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createSupabaseClient,
  getSupabaseConfig,
  supabase,
  SupabaseConfigurationError,
  type TypedSupabaseClient,
} from "./supabase.js";

describe("getSupabaseConfig", () => {
  it("returns trimmed public Supabase configuration", () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: "  https://project.supabase.co/  ",
        VITE_SUPABASE_PUBLISHABLE_KEY: "  publishable-key  ",
      }),
    ).toEqual({
      url: "https://project.supabase.co/",
      anonKey: "publishable-key",
    });
  });

  it("supports the legacy public environment names during migration", () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon-key",
      }),
    ).toEqual({ url: "https://project.supabase.co", anonKey: "legacy-anon-key" });
  });

  it.each([
    [
      { NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key" },
      "Missing VITE_SUPABASE_URL. Add it to the environment before importing @repo/database.",
    ],
    [
      { NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co" },
      "Missing VITE_SUPABASE_PUBLISHABLE_KEY. Add it to the environment before importing @repo/database.",
    ],
    [
      {
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      },
      "VITE_SUPABASE_URL must be a valid HTTP(S) URL.",
    ],
  ])("rejects invalid environment configuration", (environment, expectedMessage) => {
    expect(() => getSupabaseConfig(environment)).toThrowError(
      new SupabaseConfigurationError(expectedMessage),
    );
  });

  it.each([
    "sb_secret_do-not-expose",
    `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`,
  ])("rejects privileged keys in the browser key variable", (privilegedKey) => {
    expect(() =>
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: privilegedKey,
      }),
    ).toThrowError(
      new SupabaseConfigurationError(
        "The browser Supabase key must not contain a service-role or secret key.",
      ),
    );
  });
});

describe("Supabase client", () => {
  it("exports an initialized, schema-typed singleton", () => {
    expect(supabase).toBeDefined();
    expectTypeOf(supabase).toEqualTypeOf<TypedSupabaseClient>();
  });

  it("creates additional typed clients for isolated environments", () => {
    const client = createSupabaseClient({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-anon-key",
    });

    expect(client).not.toBe(supabase);
    expectTypeOf(client).toEqualTypeOf<TypedSupabaseClient>();
  });
});
