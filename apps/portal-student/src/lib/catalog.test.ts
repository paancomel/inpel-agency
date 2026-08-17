import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => {
  const institutionResult: { data: unknown[]; error: unknown } = { data: [], error: null };
  const programmeResult: { data: unknown[]; error: unknown } = { data: [], error: null };
  const institutionOrder = vi.fn(() => Promise.resolve(institutionResult));
  const programmeOrder = vi.fn(() => Promise.resolve(programmeResult));
  const programmeEq = vi.fn(() => ({ order: programmeOrder }));
  return { institutionResult, programmeResult, institutionOrder, programmeEq, programmeOrder };
});

vi.mock("@repo/database", () => ({
  supabase: {
    from: vi.fn((relation: string) => {
      if (relation === "shared_catalog_institutions") {
        return {
          select: vi.fn(() => ({
            order: state.institutionOrder,
          })),
        };
      }

      if (relation === "shared_catalog_programmes") {
        return {
          select: vi.fn(() => ({
            eq: state.programmeEq,
          })),
        };
      }

      throw new Error(`Unexpected relation: ${relation}`);
    }),
  },
}));

import { listSharedCatalogInstitutions, listSharedCatalogProgrammes } from "./catalog";

describe("shared live catalog reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.institutionResult.data = [];
    state.institutionResult.error = null;
    state.programmeResult.data = [];
    state.programmeResult.error = null;
  });

  it("maps real institution rows from the shared catalog view", async () => {
    state.institutionResult.data = [{
      reference_institution_id: "institution-1",
      institution_name: "Universiti Data Sebenar",
      institution_previous_name: "Kolej Data Sebenar",
      university_id: "university-1",
      is_linked_to_university: true,
      programme_count: 12,
    }];

    await expect(listSharedCatalogInstitutions()).resolves.toEqual([{
      referenceInstitutionId: "institution-1",
      institutionName: "Universiti Data Sebenar",
      institutionPreviousName: "Kolej Data Sebenar",
      universityId: "university-1",
      isLinkedToUniversity: true,
      programmeCount: 12,
    }]);
  });

  it("scopes programme reads to the selected institution", async () => {
    state.programmeResult.data = [{
      reference_institution_id: "institution-1",
      institution_name: "Universiti Data Sebenar",
      canonical_record_id: "programme-1",
      reference_no: "MQA/FA12345",
      reference_family: "MQA",
      qualification_name: "Diploma Teknologi Maklumat",
      previous_qualification_name: null,
      nec_code: "0611",
      nec_description: "Computer use",
      nec_broad_area: "Information and Communication Technologies",
      course_id: null,
      is_linked_to_course: false,
    }];

    const result = await listSharedCatalogProgrammes("  Universiti Data Sebenar  ");

    expect(state.programmeEq).toHaveBeenCalledWith("institution_name", "Universiti Data Sebenar");
    expect(result[0]).toMatchObject({
      canonicalRecordId: "programme-1",
      qualificationName: "Diploma Teknologi Maklumat",
      referenceNo: "MQA/FA12345",
      necCode: "0611",
    });
  });

  it("fails closed when the live catalog query is unavailable", async () => {
    state.institutionResult.error = {
      code: "42501",
      message: "permission denied",
      hint: "Grant select access",
    };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(listSharedCatalogInstitutions()).rejects.toThrow(/currently unavailable/i);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to read shared institution catalog",
      expect.objectContaining({ code: "42501", hint: "Grant select access" }),
    );

    consoleError.mockRestore();
  });
});
