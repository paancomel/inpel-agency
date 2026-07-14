import { describe, expect, expectTypeOf, it } from "vitest";

import { DATABASE_CONSTRAINTS } from "./types.js";
import type {
  Json,
  PublicTableName,
  Tables,
  TablesInsert,
  Timestamp,
  Uuid,
} from "./types.js";

describe("blueprint row shapes", () => {
  it("matches every column and PostgreSQL value type", () => {
    expectTypeOf<Tables<"profiles">>().toEqualTypeOf<{
      id: Uuid;
      email: string;
      role: "parent" | "student" | "university_rep" | "admin";
      has_unlocked_tea: boolean | null;
      created_at: Timestamp | null;
    }>();
    expectTypeOf<Tables<"universities">>().toEqualTypeOf<{
      id: Uuid;
      name: string;
      location: string | null;
      address: string | null;
      logo_url: string | null;
      tuition_fees: number | null;
      living_costs: number | null;
      acceptance_rate: string | null;
      facilities_flags: Json | null;
      contacts: Json | null;
      created_at: Timestamp | null;
    }>();
    expectTypeOf<Tables<"gallery_images">>().toEqualTypeOf<{
      id: Uuid;
      university_id: Uuid | null;
      category: string | null;
      preview_url: string;
    }>();
    expectTypeOf<Tables<"courses">>().toEqualTypeOf<{
      id: Uuid;
      university_id: Uuid | null;
      name: string;
      mqa_code: string | null;
      tuition_fee: number | null;
      course_details: Json | null;
    }>();
    expectTypeOf<Tables<"sessions">>().toEqualTypeOf<{
      id: Uuid;
      parent_id: Uuid | null;
      parent_preferences: Json | null;
      status: "invited" | "completed";
    }>();
    expectTypeOf<Tables<"student_assessments">>().toEqualTypeOf<{
      id: Uuid;
      session_id: Uuid | null;
      student_id: Uuid | null;
      assessment_data: Json | null;
    }>();
    expectTypeOf<Tables<"recommendation_results">>().toEqualTypeOf<{
      id: Uuid;
      session_id: Uuid | null;
      university_id: Uuid | null;
      match_score: number;
      roi_and_career: Json | null;
    }>();
    expectTypeOf<Tables<"payments">>().toEqualTypeOf<{
      id: Uuid;
      session_id: Uuid | null;
      tier: number;
      status: "pending" | "success" | "failed";
    }>();
    expectTypeOf<Tables<"reviews">>().toEqualTypeOf<{
      id: Uuid;
      user_id: Uuid | null;
      university_id: Uuid | null;
      review_data: Json | null;
      is_anonymous: boolean | null;
      likes_count: number | null;
    }>();
    expectTypeOf<Tables<"comments">>().toEqualTypeOf<{
      id: Uuid;
      review_id: Uuid | null;
      user_id: Uuid | null;
      text: string;
    }>();
    expectTypeOf<Tables<"review_likes">>().toEqualTypeOf<{
      id: Uuid;
      review_id: Uuid | null;
      user_id: Uuid | null;
    }>();
  });

  it("supports the minimum valid insert for every table", () => {
    const minimumInserts = {
      profiles: {
        id: "profile-id",
        email: "user@example.com",
        role: "student",
      },
      universities: { name: "Example University" },
      gallery_images: { preview_url: "https://cdn.example.com/image.jpg" },
      courses: { name: "Example Course" },
      sessions: { status: "invited" },
      student_assessments: {},
      recommendation_results: { match_score: 95 },
      payments: { tier: 1, status: "pending" },
      reviews: {},
      comments: { text: "Helpful review" },
      review_likes: {},
    } satisfies { [TableName in PublicTableName]: TablesInsert<TableName> };

    expect(Object.keys(minimumInserts)).toHaveLength(11);
  });

  it("does not permit inserts that omit required columns", () => {
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"profiles">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"universities">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"gallery_images">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"courses">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"sessions">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"recommendation_results">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"payments">>();
    expectTypeOf<{}>().not.toMatchTypeOf<TablesInsert<"comments">>();
  });

  it("retains unique and cascading-delete constraints as runtime metadata", () => {
    expect(DATABASE_CONSTRAINTS.unique).toHaveLength(4);
    expect(DATABASE_CONSTRAINTS.unique).toContainEqual({
      table: "review_likes",
      columns: ["review_id", "user_id"],
    });
    expect(DATABASE_CONSTRAINTS.onDeleteCascade).toHaveLength(4);
  });
});
