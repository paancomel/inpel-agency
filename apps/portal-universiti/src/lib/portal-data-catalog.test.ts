import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  supabase: { from: database.from },
}));

import { getSharedCatalog } from "./portal-data";

function queryReturning(data: unknown[] | null, error: { message: string } | null = null) {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data, error }),
  };
  query.select.mockReturnValue(query);
  query.order.mockReturnValue(query);
  return query;
}

describe("shared Supabase catalogue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and maps both real shared catalogue views", async () => {
    const institutions = queryReturning([{
      reference_institution_id: "institution-1",
      institution_name: "Universiti Data Sebenar",
      institution_previous_name: "Kolej Data Sebenar",
      university_id: "university-1",
      is_linked_to_university: true,
      programme_count: 1,
    }]);
    const programmes = queryReturning([{
      reference_institution_id: "institution-1",
      institution_name: "Universiti Data Sebenar",
      canonical_record_id: "programme-1",
      reference_no: "MQA/FA0001",
      reference_family: "MQA",
      qualification_name: "Diploma Sains Data",
      previous_qualification_name: null,
      nec_code: "0613",
      nec_description: "Software and applications development and analysis",
      nec_broad_area: "Information and Communication Technologies",
      course_id: "course-1",
      is_linked_to_course: true,
    }]);
    database.from.mockImplementation((view: string) => view === "shared_catalog_institutions" ? institutions : programmes);

    const catalog = await getSharedCatalog();

    expect(database.from).toHaveBeenNthCalledWith(1, "shared_catalog_institutions");
    expect(database.from).toHaveBeenNthCalledWith(2, "shared_catalog_programmes");
    expect(catalog).toEqual({
      institutions: [{
        referenceInstitutionId: "institution-1",
        institutionName: "Universiti Data Sebenar",
        institutionPreviousName: "Kolej Data Sebenar",
        universityId: "university-1",
        isLinkedToUniversity: true,
        programmeCount: 1,
      }],
      programmes: [{
        referenceInstitutionId: "institution-1",
        institutionName: "Universiti Data Sebenar",
        canonicalRecordId: "programme-1",
        referenceNo: "MQA/FA0001",
        referenceFamily: "MQA",
        qualificationName: "Diploma Sains Data",
        previousQualificationName: null,
        necCode: "0613",
        necDescription: "Software and applications development and analysis",
        necBroadArea: "Information and Communication Technologies",
        courseId: "course-1",
        isLinkedToCourse: true,
      }],
    });
  });

  it("fails closed when a catalogue view is unavailable", async () => {
    database.from.mockImplementation((view: string) => view === "shared_catalog_institutions"
      ? queryReturning([], { message: "permission denied" })
      : queryReturning([]));

    await expect(getSharedCatalog()).rejects.toThrow("Shared institution catalogue is unavailable: permission denied");
  });
});
