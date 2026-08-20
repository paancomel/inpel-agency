import { loadCommunityDirectory } from "./community-data";

const from = vi.fn();
vi.mock("@repo/database", () => ({ supabase: { from } }));

function ordered(result: unknown) {
  return { select: vi.fn(() => ({ order: vi.fn().mockResolvedValue(result) })) };
}

function selected(result: unknown) {
  return { select: vi.fn().mockResolvedValue(result) };
}

const universityId = "11111111-1111-4111-8111-111111111111";

describe("live INPOLOR catalogue", () => {
  beforeEach(() => {
    from.mockReset();
    from.mockImplementation((table: string) => {
      if (table === "inpolor_catalog_institutions") {
        return ordered({
          data: [{
            university_id: universityId,
            university_name: "Universiti Sebenar",
            location: "Kuala Lumpur",
            address: "Jalan Universiti, Kuala Lumpur",
            reference_institution_id: "reference-1",
            reference_institution_name: "Universiti Sebenar",
            linked_programme_count: 1,
          }],
          error: null,
        });
      }
      if (table === "inpolor_catalog_programmes") {
        return selected({
          data: [{ university_id: universityId, qualification_name: "Diploma Sains Komputer" }],
          error: null,
        });
      }
      if (table === "inpolor_university_summaries") {
        return selected({
          data: [{
            university_id: universityId,
            review_count: 1,
            overall_rating: 8,
            rating_facilities: 8,
            rating_teaching: 8,
            rating_class_experience: 8,
            rating_safety: 8,
            rating_value: 8,
            rating_transport: 8,
            rating_campus_life: 8,
            rating_career: 8,
            living_cost_monthly: null,
            ranking_eligible: false,
            newest_review_at: "2026-08-17T00:00:00.000Z",
          }],
          error: null,
        });
      }
      if (table === "published_reviews") {
        return ordered({
          data: [{
            id: "22222222-2222-4222-8222-222222222222",
            university_id: universityId,
            course: "Diploma Sains Komputer",
            year: "2025",
            rating: 8,
            rating_facilities: 8,
            rating_teaching: 8,
            rating_class_experience: 8,
            rating_safety: 8,
            rating_value: 8,
            rating_transport: 8,
            rating_campus_life: 8,
            rating_career: 8,
            green_flags: "",
            red_flags: "",
            spill_the_tea: null,
            content: { mainExperience: "The structured public experience survives moderation." },
            likes_count: 0,
            is_complete_review: false,
            visibility_status: "published",
            created_at: "2026-08-17T00:00:00.000Z",
          }],
          error: null,
        });
      }
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it("uses linked product-university ids for routes, summaries, and review targets", async () => {
    const result = await loadCommunityDirectory();

    expect(from).toHaveBeenCalledWith("inpolor_catalog_institutions");
    expect(from).toHaveBeenCalledWith("inpolor_catalog_programmes");
    expect(from).not.toHaveBeenCalledWith("shared_catalog_institutions");
    expect(from).not.toHaveBeenCalledWith("shared_catalog_programmes");
    expect(result.universities).toHaveLength(1);
    expect(result.universities[0]).toMatchObject({
      id: universityId,
      referenceInstitutionId: "reference-1",
      name: "Universiti Sebenar",
      courses: ["Diploma Sains Komputer"],
      reviewCount: 1,
      rating: 8,
      rankingEligible: false,
    });
    expect(result.reviewTargets).toEqual([{
      id: universityId,
      name: "Universiti Sebenar",
      location: "Kuala Lumpur",
      courses: ["Diploma Sains Komputer"],
    }]);
    expect(result.reviews[0]?.universityId).toBe(universityId);
    expect(result.reviews[0]?.spillTheTea).toBe(
      "The structured public experience survives moderation.",
    );
    expect(result.message).toBeNull();
  });

  it("fails closed when the verified product catalogue cannot be read", async () => {
    from.mockImplementation((table: string) => {
      if (table === "inpolor_catalog_institutions") {
        return ordered({ data: null, error: { message: "denied" } });
      }
      if (table === "inpolor_catalog_programmes" || table === "inpolor_university_summaries") {
        return selected({ data: [], error: null });
      }
      return ordered({ data: [], error: null });
    });

    const result = await loadCommunityDirectory();

    expect(result.universities).toEqual([]);
    expect(result.reviewTargets).toEqual([]);
    expect(result.connected).toBe(false);
    expect(result.message).toBe("The verified university directory is temporarily unavailable.");
  });

  it("shows an honest empty state when no institution is published for INPOLOR", async () => {
    from.mockImplementation((table: string) => {
      if (table === "inpolor_catalog_institutions") {
        return ordered({ data: [], error: null });
      }
      if (table === "inpolor_catalog_programmes" || table === "inpolor_university_summaries") {
        return selected({ data: [], error: null });
      }
      return ordered({ data: [], error: null });
    });

    const result = await loadCommunityDirectory();

    expect(result.universities).toEqual([]);
    expect(result.connected).toBe(true);
    expect(result.message).toBe("No verified institutions are published for INPOLOR yet.");
  });
});
