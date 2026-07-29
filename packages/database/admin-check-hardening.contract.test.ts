import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260726032653_move_admin_check_to_private_schema.sql", import.meta.url),
  "utf8",
);

describe("admin authorization boundary hardening migration", () => {
  it("keeps the admin check private and removes its public RPC execution grant", () => {
    expect(migration).toContain("create or replace function private.is_portal_admin()");
    expect(migration).toContain("revoke all on function public.is_portal_admin() from public, anon, authenticated;");
    expect(migration).not.toContain("grant execute on function public.is_portal_admin() to authenticated;");
    expect(migration).not.toContain("(select public.is_portal_admin())");
  });
});
