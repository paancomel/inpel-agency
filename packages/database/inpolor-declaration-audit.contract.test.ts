import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  fileURLToPath(new URL("../../supabase/migrations/20260817111334_inpolor_review_declaration_audit.sql", import.meta.url)),
  "utf8",
);

describe("INPOLOR review declaration audit contract", () => {
  it("requires the explicit current declarations before accepting a review", () => {
    expect(migration).toContain("v_declarations ->> 'adult'");
    expect(migration).toContain("v_declarations ->> 'rights'");
    expect(migration).toContain("v_declarations ->> 'terms'");
    expect(migration).toContain("v_declarations ->> 'privacy'");
    expect(migration).toContain("v_version <> 'inpolor-launch-2026-08-16'");
    expect(migration).toContain("All current review declarations are required.");
  });

  it("stores a private timestamped receipt without changing the public projection", () => {
    expect(migration).toContain("create table private.review_declaration_receipts");
    expect(migration).toContain("accepted_at timestamptz not null default now()");
    expect(migration).toContain("declaration_version text not null");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table private.review_declaration_receipts from public, anon, authenticated");
    expect(migration).toContain("revoke all on function public.submit_inpolor_review(jsonb) from public, anon");
    expect(migration).toContain("grant execute on function public.submit_inpolor_review(jsonb) to authenticated");
    expect(migration).not.toContain("create or replace view public.published_reviews");
  });
});
