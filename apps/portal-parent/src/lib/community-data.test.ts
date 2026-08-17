import { loadCommunityDirectory } from "./community-data";

const from = vi.fn();
vi.mock("@repo/database", () => ({ supabase: { from } }));

function ordered(result: unknown) {
  return { select: vi.fn(() => ({ order: vi.fn().mockResolvedValue(result) })) };
}

function selected(result: unknown) {
  return { select: vi.fn().mockResolvedValue(result) };
}

describe("live INPOLOR catalogue", () => {
  beforeEach(() => {
    from.mockReset();
    from.mockImplementation((table: string) => {
      if (table === "shared_catalog_institutions") return ordered({ data: [{ reference_institution_id: "reference-1", institution_name: "Universiti Sebenar", institution_previous_name: null, programme_count: 1 }], error: null });
      if (table === "shared_catalog_programmes") return selected({ data: [{ reference_institution_id: "reference-1", qualification_name: "Diploma Sains Komputer" }], error: null });
      if (table === "inpolor_university_summaries") return selected({ data: [], error: null });
      if (table === "published_reviews") return ordered({ data: [], error: null });
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it("uses every real shared-catalogue institution as an INPOLOR review target", async () => {
    const result = await loadCommunityDirectory();

    expect(from).toHaveBeenCalledWith("shared_catalog_institutions");
    expect(from).toHaveBeenCalledWith("shared_catalog_programmes");
    expect(from).not.toHaveBeenCalledWith("inpolor_catalog_institutions");
    expect(from).not.toHaveBeenCalledWith("inpolor_catalog_programmes");
    expect(from).not.toHaveBeenCalledWith("universities");
    expect(result.universities).toHaveLength(1);
    expect(result.universities[0]).toMatchObject({ id: "reference-1", name: "Universiti Sebenar", courses: ["Diploma Sains Komputer"] });
    expect(result.reviewTargets).toEqual([{ id: "reference-1", name: "Universiti Sebenar", location: null, courses: ["Diploma Sains Komputer"] }]);
    expect(result.message).toBeNull();
  });

  it("fails closed when the verified catalogue cannot be read", async () => {
    from.mockImplementation((table: string) => {
      if (table === "shared_catalog_institutions") return ordered({ data: null, error: { message: "denied" } });
      if (table === "shared_catalog_programmes" || table === "inpolor_university_summaries") return selected({ data: [], error: null });
      return ordered({ data: [], error: null });
    });

    const result = await loadCommunityDirectory();

    expect(result.universities).toEqual([]);
    expect(result.connected).toBe(false);
    expect(result.message).toBe("The university directory is temporarily unavailable.");
  });
});
