import {
  COMMUNITY_ONBOARDING_TTL_MS,
  clearPendingCommunityOnboarding,
  loadPendingCommunityOnboarding,
  savePendingCommunityOnboarding,
} from "./storage";

describe("INPOLOR community onboarding storage", () => {
  beforeEach(() => localStorage.clear());

  it("survives a new tab through versioned local storage without identity secrets", () => {
    const now = new Date("2026-08-17T00:00:00.000Z");
    expect(savePendingCommunityOnboarding("2000-02-29", now)).toBe(true);

    const stored = localStorage.getItem("inpolor:community-onboarding:v1");
    expect(stored).toContain("2000-02-29");
    expect(stored).not.toContain("email");
    expect(stored).not.toContain("password");
    expect(stored).not.toContain("token");
    expect(loadPendingCommunityOnboarding(new Date(now.getTime() + 1_000))).toMatchObject({
      version: 1,
      dateOfBirth: "2000-02-29",
    });
  });

  it("removes expired and malformed onboarding drafts", () => {
    const now = new Date("2026-08-17T00:00:00.000Z");
    savePendingCommunityOnboarding("2000-01-01", now);
    expect(loadPendingCommunityOnboarding(
      new Date(now.getTime() + COMMUNITY_ONBOARDING_TTL_MS + 1),
    )).toBeNull();
    expect(localStorage.getItem("inpolor:community-onboarding:v1")).toBeNull();

    localStorage.setItem("inpolor:community-onboarding:v1", "{bad json");
    expect(loadPendingCommunityOnboarding()).toBeNull();
    expect(localStorage.getItem("inpolor:community-onboarding:v1")).toBeNull();
  });

  it("rejects impossible date-only values and supports explicit clearing", () => {
    expect(savePendingCommunityOnboarding("2001-02-29")).toBe(false);
    expect(savePendingCommunityOnboarding("not-a-date")).toBe(false);

    expect(savePendingCommunityOnboarding("2001-02-28")).toBe(true);
    clearPendingCommunityOnboarding();
    expect(loadPendingCommunityOnboarding()).toBeNull();
  });
});
