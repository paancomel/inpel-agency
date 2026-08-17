import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  AcademicRecord,
  Database,
  GalleryImagesRow,
  MonthlyHouseholdIncome,
  ParentalPreferences,
  PaymentsRow,
  PublishedReviewsRow,
  PersonalityTestAnswers,
  ProfileRole,
  ProfilesRow,
  ProfilesInsert,
  Tables,
  TablesInsert,
  UniversitiesInsert,
  Uuid,
} from "./types.js";

describe("database schema contract", () => {
  it("exposes the blueprint tables plus trusted binding, report-access, and safe review-projection tables", () => {
    type PublicTableName = keyof Database["public"]["Tables"];
    type ExpectedPublicTableName =
      | "profiles"
      | "universities"
      | "institution_domains"
      | "approved_institution_domains"
      | "institution_members"
      | "institution_profile_versions"
      | "institution_audit_events"
      | "gallery_images"
      | "courses"
      | "reference_institutions"
      | "reference_institution_aliases"
      | "nec_classifications"
      | "reference_programmes"
      | "reference_programme_aliases"
      | "reference_programme_collaborations"
      | "reference_institution_links"
      | "reference_programme_links"
      | "portal_catalog_visibility"
      | "sessions"
      | "session_student_bindings"
      | "report_access_grants"
      | "student_assessments"
      | "recommendation_results"
      | "payments"
      | "reviews"
      | "published_reviews"
      | "comments"
      | "review_likes";

    const tableNames = [
      "profiles",
      "universities",
      "institution_domains",
      "approved_institution_domains",
      "institution_members",
      "institution_profile_versions",
      "institution_audit_events",
      "gallery_images",
      "courses",
      "reference_institutions",
      "reference_institution_aliases",
      "nec_classifications",
      "reference_programmes",
      "reference_programme_aliases",
      "reference_programme_collaborations",
      "reference_institution_links",
      "reference_programme_links",
      "portal_catalog_visibility",
      "sessions",
      "session_student_bindings",
      "report_access_grants",
      "student_assessments",
      "recommendation_results",
      "payments",
      "reviews",
      "published_reviews",
      "comments",
      "review_likes",
    ] as const satisfies readonly PublicTableName[];

    expectTypeOf<ExpectedPublicTableName>().toMatchTypeOf<PublicTableName>();
    expect(tableNames).toHaveLength(28);
  });

  it("locks the public RPC signatures used by every portal", () => {
    type Functions = Database["public"]["Functions"];

    expectTypeOf<Functions["create_parent_student_invitation"]["Args"]>().toEqualTypeOf<{
      p_student_email: string;
      p_preferred_location: string;
      p_monthly_household_income: string;
      p_parental_preferences: import("./types.js").Json;
      p_parent_preferences: import("./types.js").Json;
      p_student_age_band: string;
      p_guardian_consent_confirmed: boolean;
    }>();
    expectTypeOf<Functions["revoke_parent_student_invitation"]["Args"]>().toEqualTypeOf<{
      p_session_id: string;
    }>();
    expectTypeOf<Functions["claim_student_invitation"]["Args"]>().toEqualTypeOf<{
      p_invitation_token: string;
    }>();
    expectTypeOf<Functions["complete_student_assessment"]["Args"]>().toEqualTypeOf<{
      p_session_id: string;
      p_assessment_data: import("./types.js").Json;
      p_academic_record: import("./types.js").Json;
      p_personality_test: import("./types.js").Json;
      p_vibe_check_quiz: import("./types.js").Json;
    }>();
    expectTypeOf<Functions["grant_demo_report_access"]["Args"]>().toEqualTypeOf<{
      p_session_id: string;
    }>();
    expectTypeOf<Functions["get_authorized_report"]["Args"]>().toEqualTypeOf<{
      p_session_id: string;
    }>();
    expectTypeOf<Functions["get_institution_entitlement"]["Args"]>().toEqualTypeOf<{
      p_university_id: string;
    }>();
    expectTypeOf<Functions["claim_institution_domain"]["Args"]>().toEqualTypeOf<{
      p_university_id: string;
      p_domain: string;
    }>();
    expectTypeOf<Functions["transfer_institution_admin"]["Args"]>().toEqualTypeOf<{
      p_university_id: string;
      p_new_admin_id: string;
    }>();
    expectTypeOf<Functions["set_institution_suspension"]["Args"]>().toEqualTypeOf<{
      p_university_id: string;
      p_suspended: boolean;
      p_reason?: string | null;
    }>();
    expectTypeOf<Functions["submit_review_for_moderation"]["Args"]>().toEqualTypeOf<{
      p_university_id: string;
      p_review_data: import("./types.js").Json;
      p_is_anonymous: boolean;
    }>();
  });

  it("exposes only the redacted published-review shape through the public projection table", () => {
    expectTypeOf<PublishedReviewsRow>().toMatchTypeOf<{
      id: Uuid;
      university_id: Uuid | null;
      course: string;
      year: string;
      rating: number;
      green_flags: string;
      red_flags: string;
      spill_the_tea: string;
      vibe_tags: import("./types.js").Json;
      is_anonymous: boolean;
      likes_count: number;
      created_at: import("./types.js").Timestamp;
    }>();
  });

  it("requires blueprint NOT NULL fields and permits defaulted inserts", () => {
    const profile = {
      id: "a4fdded8-6e5d-4b2e-a541-81dfebf176e3",
      email: "student@example.com",
      role: "student",
    } satisfies ProfilesInsert;
    const university = { name: "Example University" } satisfies UniversitiesInsert;

    expectTypeOf(profile.role).toEqualTypeOf<"student">();
    expectTypeOf<ProfileRole>().toEqualTypeOf<
      "parent" | "student" | "community_user" | "university_rep" |
      "content_moderator" | "payment_moderator" | "admin"
    >();
    expectTypeOf(university).toMatchTypeOf<UniversitiesInsert>();
  });

  it("maps table helper types to their row contracts", () => {
    expectTypeOf<Tables<"payments">>().toEqualTypeOf<PaymentsRow>();
  });

  it("preserves nullable rows and optional database-generated inserts", () => {
    expectTypeOf<ProfilesRow["has_unlocked_tea"]>().toEqualTypeOf<boolean | null>();
    expectTypeOf<GalleryImagesRow["university_id"]>().toEqualTypeOf<Uuid | null>();
    expectTypeOf<UniversitiesInsert["id"]>().toEqualTypeOf<Uuid | undefined>();
    expectTypeOf<UniversitiesInsert["representative_id"]>().toEqualTypeOf<
      Uuid | null | undefined
    >();
  });

  it("strictly types the amended parent and student payloads", () => {
    const parentPreferences = {
      campus_vibe: "Public (IPTA) - Warm & Local",
      campus_concern: "Campus safety & physical well-being",
      ultimate_win: "Guaranteed high-paying employment",
      independence: "Needs some structural guidance",
    } satisfies ParentalPreferences;
    const personalityTest = [5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5] satisfies PersonalityTestAnswers;
    const academicRecord = [
      { subject: "Biology", grade: "A" },
      { subject: "Chemistry", grade: "B+" },
    ] satisfies AcademicRecord;
    const parentInsert = {
      status: "invited",
      preferred_location: "Selangor",
      monthly_household_income: "RM 6,000 - RM 9,999",
      parental_preferences: parentPreferences,
    } satisfies TablesInsert<"sessions">;
    const studentInsert = {
      academic_record: academicRecord,
      personality_test: personalityTest,
      vibe_check_quiz: {
        friday_night: "cozy",
        campus_setting: "nature",
        team_style: "solo",
        schedule_style: "structured",
        learning_style: "research",
        future_horizon: "local",
      },
    } satisfies TablesInsert<"student_assessments">;

    expectTypeOf(parentInsert.monthly_household_income).toEqualTypeOf<"RM 6,000 - RM 9,999">();
    expectTypeOf<MonthlyHouseholdIncome>().toMatchTypeOf<string>();
    expect(studentInsert.personality_test).toHaveLength(16);
  });
});
