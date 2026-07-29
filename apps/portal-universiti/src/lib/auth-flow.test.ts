import { beforeEach, describe, expect, it, vi } from "vitest";

import { cacheAuthenticationDraft, createAuthenticationDraft, readAuthenticationDraft } from "./auth-draft";
import { completeCachedAuthentication } from "./auth-flow";
import { claimStudentInvitation, getAuthenticatedStudent, syncStudentAssessment } from "./portal-data";
import { createSessionRecord, readSession } from "./storage";
import type { StudentAssessment } from "./validation";

vi.mock("./portal-data", () => ({
  getAuthenticatedStudent: vi.fn(),
  claimStudentInvitation: vi.fn(),
  syncStudentAssessment: vi.fn(),
}));

const parent = {
  location: "Selangor", income: "RM 6,000 - RM 9,999", email: "parent@example.com", studentEmail: "student@example.com",
  preferences: {
    campusVibe: "Public (IPTA) - Warm & Local", campusConcern: "Campus safety & physical well-being",
    ultimateWin: "Guaranteed high-paying employment", independence: "Needs some structural guidance",
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

describe("cached authentication completion", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("hydrates, writes the cloud record, persists locally, then clears the draft", async () => {
    const session = createSessionRecord(parent);
    cacheAuthenticationDraft(createAuthenticationDraft({ session, assessment, provider: "google", mode: "signup" }));
    vi.mocked(getAuthenticatedStudent).mockResolvedValue({
      source: "cloud", userId: "auth-user", email: "oauth@example.com", confirmationRequired: false,
    });
    vi.mocked(claimStudentInvitation).mockResolvedValue({ sessionId: session.id, status: "claimed" });
    vi.mocked(syncStudentAssessment).mockImplementation((completed) => {
      expect(readAuthenticationDraft(session.id)).not.toBeNull();
      expect(completed.student?.assessment.subjects).toEqual([{ subject: "Biology", grade: "A" }]);
      return Promise.resolve({ source: "cloud" });
    });

    const completed = await completeCachedAuthentication(session.id, "a".repeat(64), undefined, new Date("2026-07-14T04:30:00.000Z"));

    expect(syncStudentAssessment).toHaveBeenCalledWith(expect.objectContaining({ id: session.id }));
    expect(completed.student?.email).toBe("oauth@example.com");
    expect(readSession(session.id)).toEqual(completed);
    expect(readAuthenticationDraft(session.id)).toBeNull();
  });

  it("keeps the full draft when the cloud mutation fails", async () => {
    const session = createSessionRecord(parent);
    cacheAuthenticationDraft(createAuthenticationDraft({ session, assessment, provider: "facebook", mode: "signup" }));
    vi.mocked(getAuthenticatedStudent).mockResolvedValue({
      source: "cloud", userId: "auth-user", email: "oauth@example.com", confirmationRequired: false,
    });
    vi.mocked(claimStudentInvitation).mockResolvedValue({ sessionId: session.id, status: "claimed" });
    vi.mocked(syncStudentAssessment).mockRejectedValue(new Error("database unavailable"));

    await expect(completeCachedAuthentication(session.id, "b".repeat(64))).rejects.toThrow("database unavailable");
    expect(readAuthenticationDraft(session.id)).not.toBeNull();
    expect(readSession(session.id)).toBeNull();
  });
});
