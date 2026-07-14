import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  Database,
  GalleryImagesRow,
  PaymentsRow,
  ProfileRole,
  ProfilesRow,
  ProfilesInsert,
  Tables,
  UniversitiesInsert,
  Uuid,
} from "./types.js";

describe("database schema contract", () => {
  it("exposes exactly the eleven blueprint tables", () => {
    type PublicTableName = keyof Database["public"]["Tables"];
    type ExpectedPublicTableName =
      | "profiles"
      | "universities"
      | "gallery_images"
      | "courses"
      | "sessions"
      | "student_assessments"
      | "recommendation_results"
      | "payments"
      | "reviews"
      | "comments"
      | "review_likes";

    const tableNames = [
      "profiles",
      "universities",
      "gallery_images",
      "courses",
      "sessions",
      "student_assessments",
      "recommendation_results",
      "payments",
      "reviews",
      "comments",
      "review_likes",
    ] as const satisfies readonly PublicTableName[];

    expectTypeOf<PublicTableName>().toEqualTypeOf<ExpectedPublicTableName>();
    expect(tableNames).toHaveLength(11);
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
      "parent" | "student" | "university_rep" | "admin"
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
  });
});
