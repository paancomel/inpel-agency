import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { Database, ProfilesRow, PublishedReviewsRow, ReviewsRow } from "./types.js";

const migration = readFileSync(
  fileURLToPath(new URL("../../supabase/migrations/20260816090000_inpolor_public_launch_foundation.sql", import.meta.url)),
  "utf8",
);

describe("INPOLOR public-launch database contract", () => {
  it("keeps reviewer identity out of public projections", () => {
    expect(migration).toContain("alter table public.published_reviews");
    expect(migration).toContain("create table public.published_review_photos");
    expect(migration).toContain("create table public.published_unspoken_truths");
    expect(migration).toContain("visibility_status");
    expectTypeOf<PublishedReviewsRow>().not.toHaveProperty("user_id");
    expectTypeOf<PublishedReviewsRow>().not.toHaveProperty("date_of_birth");
  });

  it("defines eight equal rating dimensions and an exact authenticated submission RPC", () => {
    type SubmitArgs = Database["public"]["Functions"]["submit_inpolor_review"]["Args"];
    expectTypeOf<SubmitArgs>().toEqualTypeOf<{ p_payload: import("./types.js").Json }>();
    expectTypeOf<ReviewsRow["rating_facilities"]>().toEqualTypeOf<number | null>();
    expectTypeOf<ReviewsRow["rating_career"]>().toEqualTypeOf<number | null>();
    expect(migration).toContain("generated always as");
    expect(migration).toContain("/ 8, 1");
    expect(migration).toContain("grant execute on function public.submit_inpolor_review(jsonb) to authenticated");
    expect(migration).not.toContain("grant execute on function public.submit_inpolor_review(jsonb) to anon");
  });

  it("enforces the age, reward-photo, lifetime-claim, and private bucket boundaries", () => {
    expectTypeOf<ProfilesRow["date_of_birth"]>().toEqualTypeOf<string | null>();
    expect(migration).toContain("current_date - interval '18 years'");
    expect(migration).toContain("two to five photos in every category");
    expect(migration).toContain("constraint reward_claims_user_key unique (user_id)");
    expect(migration).toContain("constraint reward_claims_ewallet_key unique (ewallet_digest)");
    expect(migration).toContain("values('inpolor-review-photos','inpolor-review-photos',false");
    expect(migration).toContain("create or replace function public.mark_inpolor_reward_paid");
    expect(migration).not.toContain("grant update on public.reward_claim_statuses");
    expect(migration).toContain("revoke update on table public.universities from authenticated");
    expect(migration).toContain("create or replace function public.set_institution_verification");
    expect(migration).toContain("create or replace function public.moderate_inpolor_review");
    expect(migration).not.toContain("grant update on public.reviews");
    expect(migration).not.toContain("moderation_actions_moderator_update");
    expect(migration).toContain("create or replace function public.get_inpolor_payment_queue");
    expect(migration).toContain("create or replace function public.record_inpolor_reward_risk");
    expect(migration).toContain("create or replace function public.create_inpolor_reward_draft");
    expect(migration).toContain("Reward photos must be server-redacted and confirmed before submission.");
    expect(migration).toContain("domain_claim_pending_approval");
  });

  it("uses RLS and redacted projection tables for every public community surface", () => {
    for (const table of [
      "review_versions",
      "review_photos",
      "moderation_actions",
      "university_questions",
      "question_answers",
      "official_responses",
      "content_reports",
      "notifications",
      "reward_claim_statuses",
    ]) {
      expect(migration).toContain(`'${table}'`);
    }
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("Content is under review.");
  });
});
