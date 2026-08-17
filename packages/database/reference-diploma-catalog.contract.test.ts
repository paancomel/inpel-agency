import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  Database,
  PortalCatalogVisibilityRow,
  ReferenceProgrammesRow,
} from "./types.js";

const migration = readFileSync(
  fileURLToPath(new URL("../../supabase/migrations/20260816120000_reference_diploma_catalog.sql", import.meta.url)),
  "utf8",
);

describe("reference diploma catalogue contract", () => {
  it("keeps source identity independent from repeated MQA reference numbers", () => {
    expect(migration).toContain("canonical_record_id text primary key");
    expect(migration).toContain("create index reference_programmes_reference_no_idx");
    expect(migration).not.toContain("unique (reference_no)");
    expectTypeOf<ReferenceProgrammesRow["canonical_record_id"]>().toEqualTypeOf<string>();
  });

  it("requires reviewed links and explicit portal visibility before INPOLOR publication", () => {
    expect(migration).toContain("create table public.reference_institution_links");
    expect(migration).toContain("create table public.reference_programme_links");
    expect(migration).toContain("create table public.portal_catalog_visibility");
    expect(migration).toContain("visibility.portal = 'inpolor'");
    expect(migration).toContain("u.verification_status = 'verified'");
    expect(migration).toContain("u.profile_status = 'complete'");
    expect(migration).toContain("u.is_suspended = false");
    expectTypeOf<PortalCatalogVisibilityRow["portal"]>().toEqualTypeOf<"inpel" | "inpeler" | "inpolor">();
  });

  it("keeps the raw reference catalogue inaccessible to browser roles", () => {
    expect(migration).toContain("alter table public.reference_programmes enable row level security");
    expect(migration).toContain("revoke all on table public.reference_institutions");
    expect(migration).toContain("public.inpolor_catalog_institutions, public.inpolor_catalog_programmes to anon, authenticated");
    expectTypeOf<"inpolor_catalog_institutions" | "inpolor_catalog_programmes">().toMatchTypeOf<keyof Database["public"]["Views"]>();
  });

  it("offers one source-backed catalog projection to all three portals", () => {
    expect(migration).toContain("create or replace view public.shared_catalog_institutions");
    expect(migration).toContain("create or replace view public.shared_catalog_programmes");
    expect(migration).toContain("grant select on table public.shared_catalog_institutions, public.shared_catalog_programmes");
    expectTypeOf<"shared_catalog_institutions" | "shared_catalog_programmes">().toMatchTypeOf<keyof Database["public"]["Views"]>();
  });
});
