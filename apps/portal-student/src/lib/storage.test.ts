import { describe, expect, it } from "vitest";

import { createEmptyPortalDraft } from "./defaults";
import { loadPortalDraft, PORTAL_DRAFT_KEY, savePortalDraft } from "./storage";

describe("portal draft storage", () => {
  it("round-trips a valid draft", () => {
    const draft = createEmptyPortalDraft();
    draft.profile.name = "Universiti Contoh Malaysia";

    savePortalDraft(draft);

    expect(loadPortalDraft()?.profile.name).toBe("Universiti Contoh Malaysia");
  });

  it("recovers safely from malformed local data", () => {
    localStorage.setItem(PORTAL_DRAFT_KEY, "not-json");

    expect(loadPortalDraft()).toBeNull();
  });

  it("rejects structurally invalid local data", () => {
    localStorage.setItem(PORTAL_DRAFT_KEY, JSON.stringify({ courses: "tampered" }));

    expect(loadPortalDraft()).toBeNull();
  });

  it("hydrates drafts saved before facility image support was added", () => {
    const legacyDraft = createEmptyPortalDraft();
    delete (legacyDraft as Partial<typeof legacyDraft>).facilityImages;
    localStorage.setItem(PORTAL_DRAFT_KEY, JSON.stringify(legacyDraft));

    expect(loadPortalDraft()?.facilityImages).toEqual({});
  });
});
