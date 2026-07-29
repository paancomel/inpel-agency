import { beforeEach, describe, expect, it } from "vitest";

import {
  AUTH_DRAFT_TTL_MS,
  cacheAuthenticationDraft,
  clearAuthenticationDraft,
  createAuthenticationDraft,
  readAuthenticationDraft,
} from "./auth-draft";
import { createSessionRecord } from "./storage";
import type { StudentAssessment } from "./validation";

const parent = {
  location: "Selangor",
  income: "RM 6,000 - RM 9,999",
  email: "parent@example.com",
  studentEmail: "student@example.com",
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local",
    campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment",
    independence: "Needs some structural guidance",
  },
} as const;
const assessment: StudentAssessment = {
  personalityAnswers: Array.from({ length: 16 }, () => 5),
  psychometric: { analytical: 50, creative: 50, social: 50, practical: 50, enterprising: 50 },
  subjects: [{ subject: "Biology", grade: "A" }],
  vibeAnswers: {
    fridayNight: "cozy", campusSetting: "nature", teamStyle: "solo",
    scheduleStyle: "structured", learningStyle: "research", futureHorizon: "local",
  },
  careerSuggestions: ["Science & Research"],
};

describe("redirect-safe authentication drafts", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips the full wizard state without storing a password", () => {
    const session = createSessionRecord(parent);
    const draft = createAuthenticationDraft({
      session,
      assessment,
      provider: "facebook",
      mode: "signup",
      requestedEmail: "student@example.com",
      now: new Date("2026-07-14T04:00:00.000Z"),
    });

    expect(cacheAuthenticationDraft(draft)).toBe(true);
    expect(readAuthenticationDraft(session.id, new Date("2026-07-14T04:10:00.000Z"))).toEqual(draft);
    expect(JSON.stringify(draft)).not.toContain("password");
  });

  it("rejects and removes expired or malformed redirect state", () => {
    const session = createSessionRecord(parent);
    const draft = createAuthenticationDraft({ session, assessment, provider: "google", mode: "login", now: new Date(0) });
    cacheAuthenticationDraft(draft);
    expect(readAuthenticationDraft(session.id, new Date(AUTH_DRAFT_TTL_MS + 1))).toBeNull();

    localStorage.setItem(`inpel:auth-draft:v1:${session.id}`, "{bad-json");
    expect(readAuthenticationDraft(session.id)).toBeNull();
    expect(localStorage.getItem(`inpel:auth-draft:v1:${session.id}`)).toBeNull();
  });

  it("only clears the draft for the requested session", () => {
    const first = createSessionRecord(parent);
    const second = createSessionRecord(parent);
    cacheAuthenticationDraft(createAuthenticationDraft({ session: first, assessment, provider: "google", mode: "signup" }));
    cacheAuthenticationDraft(createAuthenticationDraft({ session: second, assessment, provider: "google", mode: "signup" }));

    clearAuthenticationDraft(first.id);
    expect(readAuthenticationDraft(first.id)).toBeNull();
    expect(readAuthenticationDraft(second.id)).not.toBeNull();
  });
});
