import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const historicalMigration = readFileSync(
  fileURLToPath(new URL(
    "../../supabase/migrations/20260817111334_inpolor_review_declaration_audit.sql",
    import.meta.url,
  )),
  "utf8",
);

const convergenceMigration = readFileSync(
  fileURLToPath(new URL(
    "../../supabase/migrations/20260820050152_rel_007_source_of_truth_convergence.sql",
    import.meta.url,
  )),
  "utf8",
);

describe("INPOLOR review declaration audit contract", () => {
  it("uses one explicit current browser-to-RPC declaration contract", () => {
    expect(convergenceMigration).toContain(
      "v_declarations ->> 'version' is distinct from 'inpolor-launch-2026-08-16'",
    );
    expect(convergenceMigration).toContain(
      "v_declarations -> 'adult' is distinct from 'true'::jsonb",
    );
    expect(convergenceMigration).toContain(
      "v_declarations -> 'rights' is distinct from 'true'::jsonb",
    );
    expect(convergenceMigration).toContain(
      "v_declarations -> 'terms' is distinct from 'true'::jsonb",
    );
    expect(convergenceMigration).toContain(
      "v_declarations -> 'privacy' is distinct from 'true'::jsonb",
    );
    expect(convergenceMigration).not.toContain("inpolor-review-v1");
  });

  it("retains the historical receipt migration under the staging-recorded version", () => {
    expect(historicalMigration).toContain(
      "create table private.inpolor_review_declaration_receipts",
    );
    expect(historicalMigration).toContain(
      "age_eligibility_verified_at timestamptz not null",
    );
    expect(historicalMigration).toContain(
      "p.date_of_birth <= current_date - interval '18 years'",
    );
  });

  it("stores the canonical receipt privately without changing the public projection", () => {
    expect(convergenceMigration).toContain(
      "create table if not exists private.review_declaration_receipts",
    );
    expect(convergenceMigration).toContain(
      "accepted_at timestamptz not null default current_timestamp",
    );
    expect(convergenceMigration).toContain(
      "alter table private.review_declaration_receipts enable row level security",
    );
    expect(convergenceMigration).toContain(
      "revoke all on table private.review_declaration_receipts from public, anon, authenticated",
    );
    expect(convergenceMigration).not.toContain(
      "create or replace view public.published_reviews",
    );
  });
});
