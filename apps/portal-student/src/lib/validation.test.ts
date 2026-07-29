import { describe, expect, it } from "vitest";

import {
  courseSchema,
  getPublishBlockers,
  loginSchema,
  universityProfileSchema,
} from "./validation";
import { createEmptyCourse } from "./defaults";

describe("INPELER validation contracts", () => {
  it("preserves the blueprint MQA error message", () => {
    const result = courseSchema.safeParse({
      ...createEmptyCourse("course-1"),
      name: "Bachelor of Software Engineering",
      mqaCode: "",
      totalBaseTuitionFee: "48000",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.mqaCode).toContain(
      "MQA Accreditation Code is required.",
    );
  });

  it("normalizes valid course fields before they reach persistence", () => {
    const result = courseSchema.parse({
      ...createEmptyCourse("course-1"),
      name: "  Bachelor of Computing  ",
      facultySchool: "  Faculty of Computing  ",
      mqaCode: "  MQA/FA12345  ",
      totalBaseTuitionFee: " 56000 ",
      studyMode: " 100% Face-to-Face ",
      minimumEntryRequirements: " ",
    });

    expect(result).toMatchObject({
      name: "Bachelor of Computing",
      mqaCode: "MQA/FA12345",
      facultySchool: "Faculty of Computing",
      totalBaseTuitionFee: "56000",
      minimumEntryRequirements: "",
    });
  });

  it("bounds course outcome percentages and internship months", () => {
    expect(courseSchema.safeParse({
      ...createEmptyCourse("course-1"),
      name: "Bachelor of Computing",
      facultySchool: "Faculty of Computing",
      mqaCode: "MQA/FA12345",
      graduateEmployabilityRate: "101",
    }).success).toBe(false);

    expect(courseSchema.safeParse({
      ...createEmptyCourse("course-1"),
      name: "Bachelor of Computing",
      facultySchool: "Faculty of Computing",
      mqaCode: "MQA/FA12345",
      internshipDurationMonths: "6.5",
    }).success).toBe(false);
  });

  it("blocks publishing until a course exists and the attestation is checked", () => {
    expect(getPublishBlockers([], false)).toEqual([
      "Add at least one programme before publishing.",
      "Confirm the institution accuracy attestation before publishing.",
    ]);
    expect(getPublishBlockers([{ id: "course-1" }], true)).toEqual([]);
  });

  it("validates institutional credentials without retaining the password", () => {
    expect(
      loginSchema.safeParse({ email: "invalid", password: "short" }).success,
    ).toBe(false);
    expect(
      loginSchema.parse({
        email: "  registrar@university.edu.my ",
        password: "correct-horse-battery-staple",
      }).email,
    ).toBe("registrar@university.edu.my");
  });

  it("requires the database-backed university name", () => {
    const result = universityProfileSchema.safeParse({
      name: "",
      location: "",
      address: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      logoUrl: "",
      tuitionFees: "",
      acceptanceRate: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toContain(
      "Institution name is required.",
    );
  });
});
