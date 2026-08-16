import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const migration = readFileSync(
  fileURLToPath(new URL("../../supabase/migrations/20260815090000_inpeler_v1_institution_management.sql", import.meta.url)),
  "utf8",
);

describe("INPELER Version 1 institution-management contract", () => {
  it("defines the multi-representative, domain, version, and audit boundaries", () => {
    expect(migration).toContain("drop index if exists public.universities_representative_id_key");
    expect(migration).toContain("create table if not exists public.institution_domains");
    expect(migration).toContain("create table if not exists public.approved_institution_domains");
    expect(migration).toContain("create table if not exists public.institution_members");
    expect(migration).toContain("create table if not exists public.institution_profile_versions");
    expect(migration).toContain("create table if not exists public.institution_audit_events");
    expect(migration).toContain("private.can_manage_university");
    expect(migration).toContain("private.can_administer_university");
  });

  it("keeps official-response entitlement server-authoritative", () => {
    expect(migration).toContain("create or replace function public.get_institution_entitlement");
    expect(migration).toContain("create or replace function public.claim_institution_domain");
    expect(migration).toContain("create or replace function public.transfer_institution_admin");
    expect(migration).toContain("create or replace function public.set_institution_suspension");
    expect(migration).toContain("gmail.com");
    expect(migration).toContain("'official_response_enabled'");
    expect(migration).toContain("'institution_official'");
    expect(migration).toContain("grant execute on function public.get_institution_entitlement(uuid) to anon, authenticated");
  });

  it("does not expose private history and audit tables to anonymous users", () => {
    expect(migration).toContain("revoke all on table public.institution_domains, public.approved_institution_domains");
    expect(migration).toContain("create policy institution_versions_member_read");
    expect(migration).toContain("create policy institution_audit_admin_read");
  });
});
