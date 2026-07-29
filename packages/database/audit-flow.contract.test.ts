import { describe, expect, it } from "vitest";

import { createAuditFixtures } from "./audit-flow.fixtures.js";

describe("three-portal database audit fixtures", () => {
  it("builds UUID-backed records through the portals' current Zod schemas and payload mappers", () => {
    const fixtures = createAuditFixtures();

    expect(fixtures.runId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(new Set(fixtures.generatedRowIds).size).toBe(fixtures.generatedRowIds.length);
    expect(new Set(Object.values(fixtures.ids)).size).toBe(fixtures.generatedRowIds.length);
    expect(fixtures.generatedRowIds.every((id) => /^[0-9a-f-]{36}$/i.test(id))).toBe(true);

    expect(fixtures.institution.university.contacts).toEqual({
      website: "https://qa-audit.example.test",
      email: fixtures.accounts.representative.email,
      phone: "+60 3-5555 0101",
    });
    expect(fixtures.institution.course.course_details).toMatchObject({
      academic: {
        facultySchool: "Faculty of Health Sciences",
        studyMode: "100% Face-to-Face",
        minimumEntryRequirements: "Biology grade B or better",
      },
      outcomes: {
        graduateEmployabilityRate: 92,
        internshipDurationMonths: 6,
      },
    });

    expect(fixtures.student.assessment.session_id).toBe(fixtures.ids.session);
    expect(fixtures.student.assessment.personality_test).toHaveLength(16);
    expect(fixtures.student.assessment.academic_record).toContainEqual({
      subject: "Biology",
      grade: "A",
    });
    expect(fixtures.review.submission.is_anonymous).toBe(true);
    expect(fixtures.review.submission.review_data).not.toHaveProperty("submitter");
  });
});
