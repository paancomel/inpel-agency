import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  fileURLToPath(new URL("../../supabase/migrations/20260816130100_inpolor_review_declaration_audit.sql", import.meta.url)),
  "utf8",
);

describe("INPOLOR review declaration audit contract", () => {
  it("requires the explicit current declarations before accepting a review", () => {
    expect(migration).toContain("v_declarations->'age18OrOlder' is distinct from 'true'::jsonb");
    expect(migration).toContain("v_declarations->'termsAccepted' is distinct from 'true'::jsonb");
    expect(migration).toContain("v_declarations->'privacyAcknowledged' is distinct from 'true'::jsonb");
    expect(migration).toContain("v_declarations->'contentRightsConfirmed' is distinct from 'true'::jsonb");
    expect(migration).toContain("p.date_of_birth <= current_date - interval '18 years'");
  });

  it("stores a private timestamped receipt without changing the public projection", () => {
    expect(migration).toContain("create table private.inpolor_review_declaration_receipts");
    expect(migration).toContain("declared_at timestamptz not null default current_timestamp");
    expect(migration).toContain("age_eligibility_verified_at timestamptz not null");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table private.inpolor_review_declaration_receipts from public, anon, authenticated");
    expect(migration).not.toContain("create or replace view public.published_reviews");
  });
});
