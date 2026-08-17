import { beforeEach, describe, expect, it } from "vitest";

import { parentProfileSchema, studentAccountSchema, studentAssessmentSchema } from "./validation";
import { createSessionRecord, readSession, saveSession } from "./storage";

const validParent = {
  location: "Selangor",
  income: "RM 6,000 - RM 9,999",
  email: "parent@example.com",
  studentEmail: "student@example.com",
  studentAgeBand: "18+",
  guardianConsentConfirmed: false,
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local",
    campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment",
    independence: "Needs some structural guidance",
  },
} as const;

describe("portal validation", () => {
  it("requires the location, monthly income, email, and all four parental preferences", () => {
    const result = parentProfileSchema.safeParse({ location: "", income: "", email: "not-an-email", preferences: {} });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please select your location.");
      expect(messages).toContain("Please select your monthly household income.");
      expect(messages).toContain("Please enter a valid email address.");
      expect(messages).toContain("Please answer every parental preference question.");
    }
  });

  it("requires explicit guardian consent for a student aged 15 to 17", () => {
    const result = parentProfileSchema.safeParse({ ...validParent, studentAgeBand: "15-17", guardianConsentConfirmed: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.message)).toContain("Parent or legal guardian consent is required for students aged 15 to 17.");
  });

  it("rejects a short student password", () => {
    const result = studentAccountSchema.safeParse({ email: "student@example.com", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Password must be at least 8 characters long.");
  });

  it("requires 16 personality answers, valid SPM rows, and all six vibe choices", () => {
    const result = studentAssessmentSchema.safeParse({
      personalityAnswers: [],
      psychometric: { analytical: 50, creative: 50, social: 50, practical: 50, enterprising: 50 },
      subjects: [{ subject: "Biology", grade: "" }],
      vibeAnswers: {},
      careerSuggestions: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please answer all 16 personality questions.");
      expect(messages).toContain("Choose a valid grade for every subject.");
      expect(messages).toContain("Please complete all 6 Vibe Check questions.");
    }
  });
});

describe("session persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a valid session without retaining a password", () => {
    const session = createSessionRecord(validParent);
    saveSession(session);
    expect(readSession(session.id)).toEqual(session);
    expect(localStorage.getItem(`inpel:session:${session.id}`)).not.toContain("password");
  });

  it("returns null instead of crashing on corrupted storage", () => {
    const id = "312dce99-2f20-49fd-8c69-220d624d35be";
    localStorage.setItem(`inpel:session:${id}`, "{broken-json");
    expect(readSession(id)).toBeNull();
  });
});
