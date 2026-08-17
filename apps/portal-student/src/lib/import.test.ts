import { describe, expect, it } from "vitest";

import { createEmptyCourse, createEmptyPortalDraft } from "./defaults";
import { applyInstitutionImport, parseInstitutionImport } from "./import";

describe("institution data import", () => {
  it("rejects malformed and structurally invalid import files", () => {
    expect(parseInstitutionImport("not json")).toMatchObject({ success: false });
    expect(parseInstitutionImport(JSON.stringify({ facilities: { library: "yes" } }))).toMatchObject({ success: false });
  });

  it("merges a validated import into the saved draft", () => {
    const draft = createEmptyPortalDraft("2026-08-15T00:00:00.000Z");
    const course = createEmptyCourse("source-id");
    const result = parseInstitutionImport(JSON.stringify({
      profile: { name: "Universiti Contoh", location: "Kuala Lumpur" },
      facilities: { library: true },
      gallery: [{ category: "Campus", previewUrl: "https://example.edu.my/campus.jpg" }],
      courses: [{ ...course, id: undefined, name: "Bachelor of Computing", facultySchool: "Computing", mqaCode: "MQA/FA12345" }],
    }));
    expect(result.success).toBe(true);
    if (!result.success) return;

    const imported = applyInstitutionImport(draft, result.data);
    expect(imported.profile.name).toBe("Universiti Contoh");
    expect(imported.facilities.library).toBe(true);
    expect(imported.gallery).toHaveLength(1);
    expect(imported.courses).toHaveLength(1);
    expect(imported.courses[0]?.id).not.toBe("source-id");
  });
});
