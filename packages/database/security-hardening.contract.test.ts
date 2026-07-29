import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260726030646_harden_public_review_projection_and_storage.sql", import.meta.url),
  "utf8",
);

describe("public review and storage hardening migration", () => {
  it("removes the legacy storage listing policy and keeps only a safe public projection", () => {
    expect(migration).toContain('drop policy if exists "university assets are publicly readable" on storage.objects;');
    expect(migration).toContain('drop policy if exists "representatives upload owned university assets" on storage.objects;');
    expect(migration).toContain("create table public.published_reviews");
    expect(migration).not.toContain("create or replace view public.published_reviews");
    expect(migration).toContain("create policy published_reviews_public_read");
    expect(migration).toContain("create trigger reviews_sync_published_projection");
    expect(migration).toContain("create or replace function private.sync_published_review_projection()");
  });
});
