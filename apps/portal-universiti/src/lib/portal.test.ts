import { beforeEach, describe, expect, it } from "vitest";

import {
  parentProfileSchema,
  studentAccountSchema,
  studentAssessmentSchema,
} from "./validation";
import { createSessionRecord, readSession, saveSession } from "./storage";

describe("portal validation", () => {
  it("returns the blueprint messages for invalid parent details", () => {
    const result = parentProfileSchema.safeParse({
      location: "",
      budget: "",
      email: "not-an-email",
      expectations: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please select your location.");
      expect(messages).toContain("Please select your budget/salary range.");
      expect(messages).toContain("Please enter a valid email address.");
    }
  });

  it("rejects a short student password with the blueprint message", () => {
    const result = studentAccountSchema.safeParse({
      email: "student@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must be at least 8 characters long.",
      );
    }
  });

  it("requires hobbies and complete core grades", () => {
    const result = studentAssessmentSchema.safeParse({
      hobbies: [],
      psychometric: {
        analytical: 50,
        creative: 50,
        social: 50,
        practical: 50,
        enterprising: 50,
      },
      coreGrades: {},
      electives: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Please select at least one hobby to continue.");
      expect(messages).toContain("Please provide grades for all core subjects.");
    }
  });
});

describe("session persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a valid session without retaining a password", () => {
    const session = createSessionRecord({
      location: "Selangor",
      budget: "RM 40,000 – RM 70,000",
      email: "parent@example.com",
      expectations: ["Strong graduate outcomes"],
    });

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
