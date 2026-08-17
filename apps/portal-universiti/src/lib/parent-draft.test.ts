import { beforeEach, describe, expect, it } from "vitest";

import { AUTH_DRAFT_TTL_MS } from "./auth-draft";
import { cacheParentDraft, clearParentDraft, createParentDraft, readParentDraft } from "./parent-draft";

const priorities = {
  location: "Selangor",
  income: "RM 6,000 - RM 9,999",
  studentEmail: "student@example.com",
  studentAgeBand: "18+",
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local",
    campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment",
    independence: "Needs some structural guidance",
  },
} as const;

describe("parent-before-authentication drafts", () => {
  beforeEach(() => localStorage.clear());

  it("retains family priorities locally without a parent email or password", () => {
    const draft = createParentDraft(priorities, new Date("2026-08-14T00:00:00.000Z"));
    expect(cacheParentDraft(draft)).toBe(true);
    expect(readParentDraft(new Date("2026-08-14T00:10:00.000Z"))).toEqual(draft);
    expect(JSON.stringify(draft)).not.toContain("parent@example.com");
    expect(JSON.stringify(draft)).not.toContain("password");
  });

  it("removes expired and explicitly cleared drafts", () => {
    cacheParentDraft(createParentDraft(priorities, new Date(0)));
    expect(readParentDraft(new Date(AUTH_DRAFT_TTL_MS + 1))).toBeNull();

    cacheParentDraft(createParentDraft(priorities));
    clearParentDraft();
    expect(readParentDraft()).toBeNull();
  });
});
