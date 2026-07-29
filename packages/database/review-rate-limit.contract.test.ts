import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260726033011_rate_limit_public_review_submission.sql", import.meta.url),
  "utf8",
);

describe("public review rate-limit migration", () => {
  it("limits only the exposed review RPC and retains no raw IP address", () => {
    expect(migration).toContain("create table private.review_submission_rate_limits");
    expect(migration).toContain("subject_digest bytea not null");
    expect(migration).not.toContain("ip_address");
    expect(migration).toContain("create trigger reviews_enforce_submission_rate_limit");
    expect(migration).toContain("current_setting('request.path', true) = 'rpc/submit_review_for_moderation'");
    expect(migration).toContain("raise exception using errcode = 'PGRST'");
  });
});
