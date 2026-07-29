import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCourse, createEmptyPortalDraft } from "./defaults";
import { publishPortalDraft } from "./database";

const databaseMock = vi.hoisted(() => {
  const state = {
    assetUpdateError: null as { message: string } | null,
    cleanupError: null as { message: string } | null,
  };
  const universityInsert = vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: { id: "university-1" }, error: null })),
    })),
  }));
  const universityUpdateEq = vi.fn(() => Promise.resolve({ error: state.assetUpdateError }));
  const universityUpdate = vi.fn((value: { logo_url?: string | null; facilities_flags?: unknown }) => {
    void value;
    return { eq: universityUpdateEq };
  });
  const universityDeleteEq = vi.fn(() => Promise.resolve({ error: null }));
  const universityDelete = vi.fn(() => ({ eq: universityDeleteEq }));
  const courseInsert = vi.fn(() => Promise.resolve({ error: null }));
  const galleryInsert = vi.fn(() => Promise.resolve({ error: null }));
  const upload = vi.fn((
    path: string,
    file: File,
    options: { cacheControl: string; contentType: string; upsert: boolean },
  ) => {
    void path;
    void file;
    void options;
    return Promise.resolve({ error: null });
  });
  const remove = vi.fn((paths: string[]) => {
    void paths;
    return Promise.resolve({ error: state.cleanupError });
  });
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/university-assets/${path}` },
  }));

  const universityBuilder = {
    insert: universityInsert,
    update: universityUpdate,
    delete: universityDelete,
  };
  const bucket = { upload, remove, getPublicUrl };
  const supabase = {
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: "representative-1" } },
        error: null,
      })),
    },
    from: vi.fn((table: string) => {
      if (table === "universities") return universityBuilder;
      if (table === "courses") return { insert: courseInsert };
      if (table === "gallery_images") return { insert: galleryInsert };
      throw new Error(`Unexpected table ${table}`);
    }),
    storage: { from: vi.fn(() => bucket) },
  };

  return {
    bucket,
    courseInsert,
    galleryInsert,
    remove,
    state,
    supabase,
    universityDeleteEq,
    universityInsert,
    universityUpdate,
    universityUpdateEq,
    upload,
  };
});

vi.mock("@repo/database", () => ({ supabase: databaseMock.supabase }));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createPublishableDraft() {
  const draft = createEmptyPortalDraft("2026-07-21T00:00:00.000Z");
  draft.profile.name = "University of the Future";
  draft.facilities.library = true;
  draft.courses.push({
    ...createEmptyCourse("course-1"),
    name: "Bachelor of Computing",
    facultySchool: "School of Computing",
    mqaCode: "MQA/FA12345",
  });
  return draft;
}

describe("secure institution asset publishing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    databaseMock.state.assetUpdateError = null;
    databaseMock.state.cleanupError = null;
  });

  it("uploads owner-scoped images and links public URLs to the institution", async () => {
    const logo = new File(["logo"], "untrusted original.png", { type: "image/png" });
    const library = new File(["library"], "library.webp", { type: "image/webp" });

    const result = await publishPortalDraft(createPublishableDraft(), {
      logo,
      facilities: { library },
    });

    expect(databaseMock.upload).toHaveBeenCalledTimes(2);
    for (const [path, , options] of databaseMock.upload.mock.calls) {
      expect(path).toMatch(/^representative-1\/university-1\/(logo|facilities\/library)\/[0-9a-f-]+\.(png|webp)$/);
      expect(path).not.toContain("untrusted original");
      expect(options).toMatchObject({ cacheControl: "3600", upsert: false });
    }
    const assetUpdate = databaseMock.universityUpdate.mock.calls[0]?.[0];
    expect(assetUpdate?.logo_url).toMatch(/^https:\/\/project\.supabase\.co\/storage\/v1\/object\/public\/university-assets\/representative-1\/university-1\/logo\//);
    expect(isRecord(assetUpdate?.facilities_flags)).toBe(true);
    const libraryFacility = isRecord(assetUpdate?.facilities_flags)
      ? assetUpdate.facilities_flags.library
      : null;
    expect(isRecord(libraryFacility) && libraryFacility.enabled).toBe(true);
    const libraryImageUrl = isRecord(libraryFacility) ? libraryFacility.imageUrl : null;
    expect(libraryImageUrl).toMatch(/^https:\/\/project\.supabase\.co\/storage\/v1\/object\/public\/university-assets\/representative-1\/university-1\/facilities\/library\//);
    expect(databaseMock.courseInsert).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      mode: "cloud",
      universityId: "university-1",
      publishedCourseCount: 1,
    });
  });

  it("removes uploaded objects and the new institution if URL linking fails", async () => {
    databaseMock.state.assetUpdateError = { message: "update failed" };
    const logo = new File(["logo"], "logo.jpg", { type: "image/jpeg" });

    await expect(
      publishPortalDraft(createPublishableDraft(), { logo, facilities: {} }),
    ).rejects.toThrow("Cleanup completed");

    const removedPaths = databaseMock.remove.mock.calls[0]?.[0];
    expect(removedPaths).toHaveLength(1);
    expect(removedPaths?.[0]).toMatch(/^representative-1\/university-1\/logo\/[0-9a-f-]+\.jpg$/);
    expect(databaseMock.universityDeleteEq).toHaveBeenCalledWith("id", "university-1");
    expect(databaseMock.courseInsert).not.toHaveBeenCalled();
  });

  it("surfaces a cleanup failure instead of silently claiming the draft was removed", async () => {
    databaseMock.state.assetUpdateError = { message: "update failed" };
    databaseMock.state.cleanupError = { message: "remove failed" };

    await expect(
      publishPortalDraft(createPublishableDraft(), {
        logo: new File(["logo"], "logo.jpg", { type: "image/jpeg" }),
        facilities: {},
      }),
    ).rejects.toThrow("uploaded image cleanup failed");
  });
});
