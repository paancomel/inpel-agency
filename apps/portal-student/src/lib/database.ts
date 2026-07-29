import type {
  CoursesInsert,
  GalleryImagesInsert,
  Json,
  UniversitiesInsert,
  UniversitiesUpdate,
} from "@repo/database";

import type {
  Course,
  FacilityImages,
  GalleryImage,
  PendingUniversityAssets,
  PortalDraft,
  PublishResult,
} from "../types/portal";
import { FACILITIES } from "../types/portal";
import {
  assertTrustedUniversityAssetUrl,
  createUniversityAssetPath,
  UNIVERSITY_ASSET_BUCKET,
  validateUniversityImage,
} from "./assets";

interface DatabaseError {
  message: string;
}

interface MutationResult {
  error: DatabaseError | null;
}

interface ProfileRoleBuilder {
  select(columns: "role"): {
    eq(column: "id", value: string): {
      maybeSingle(): PromiseLike<{
        data: { role: "parent" | "student" | "university_rep" | "admin" } | null;
        error: DatabaseError | null;
      }>;
    };
  };
}

interface UniversityMutationBuilder {
  insert(value: UniversitiesInsert): {
    select(columns: "id"): {
      single(): PromiseLike<{ data: { id: string } | null; error: DatabaseError | null }>;
    };
  };
  delete(): {
    eq(column: "id", value: string): PromiseLike<MutationResult>;
  };
  update(value: UniversitiesUpdate): {
    eq(column: "id", value: string): PromiseLike<MutationResult>;
  };
}

interface BulkInsertBuilder<Insert> {
  insert(values: Insert[]): PromiseLike<MutationResult>;
}

function optionalNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

function compactObject(values: Record<string, string>): Json {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
}

export function buildFacilityPayload(
  draft: PortalDraft,
  uploadedImages: FacilityImages = {},
): Json {
  const facilities = Object.fromEntries(
    FACILITIES.flatMap(({ key }) => {
      const enabled = draft.facilities[key];
      const imageUrl = uploadedImages[key] ?? draft.facilityImages[key];
      const trustedImageUrl = imageUrl ? assertTrustedUniversityAssetUrl(imageUrl) : null;
      return enabled || trustedImageUrl ? [[key, { enabled, imageUrl: trustedImageUrl }]] : [];
    }),
  );

  return facilities;
}

export function buildUniversityPayload(draft: PortalDraft): UniversitiesInsert {

  return {
    name: draft.profile.name,
    location: draft.profile.location || null,
    address: draft.profile.address || null,
    logo_url: draft.profile.logoUrl ? assertTrustedUniversityAssetUrl(draft.profile.logoUrl) : null,
    tuition_fees: optionalNumber(draft.profile.tuitionFees),
    acceptance_rate: draft.profile.acceptanceRate || null,
    facilities_flags: buildFacilityPayload(draft),
    contacts: compactObject({
      website: draft.profile.website,
      email: draft.profile.contactEmail,
      phone: draft.profile.contactPhone,
    }),
  };
}

export function buildCoursePayload(course: Course, universityId: string): CoursesInsert {
  return {
    university_id: universityId,
    name: course.name,
    mqa_code: course.mqaCode,
    tuition_fee: optionalNumber(course.totalBaseTuitionFee),
    course_details: {
      academic: {
        facultySchool: course.facultySchool,
        studyMode: course.studyMode,
        studentLecturerRatio: course.studentLecturerRatio,
        dualAwardDegree: course.dualAwardDegree,
        interviewPortfolioRequired: course.interviewPortfolioRequired,
        minimumEntryRequirements: course.minimumEntryRequirements,
        documentChecklist: course.documentChecklist,
        microCredentials: course.microCredentials,
        professionalBodyExemptions: course.professionalBodyExemptions,
        industryAdvisoryBoards: course.industryAdvisoryBoards,
      },
      financialAid: {
        initialRegistrationFee: optionalNumber(course.initialRegistrationFee),
        costPerCreditHour: optionalNumber(course.costPerCreditHour),
        additionalMaterialCosts: optionalNumber(course.additionalMaterialCosts),
        ptptnApproved: course.ptptnApproved,
        maraEligible: course.maraEligible,
        stateZakatYayasanEligible: course.stateZakatYayasanEligible,
      },
      outcomes: {
        graduateEmployabilityRate: optionalNumber(course.graduateEmployabilityRate),
        internshipDurationMonths: optionalNumber(course.internshipDurationMonths),
        onTimeGraduationRate: optionalNumber(course.onTimeGraduationRate),
        topHiringCompanies: course.topHiringCompanies,
      },
    },
  };
}

export function buildGalleryPayload(
  image: GalleryImage,
  universityId: string,
): GalleryImagesInsert {
  return {
    university_id: universityId,
    category: image.category || null,
    preview_url: assertTrustedUniversityAssetUrl(image.previewUrl),
  };
}

async function getSharedDatabase() {
  return import("@repo/database");
}

export async function signInInstitution(email: string, password: string): Promise<void> {
  const { supabase } = await getSharedDatabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    throw new Error("We could not verify those institutional credentials.");
  }

  const profiles = supabase.from("profiles") as unknown as ProfileRoleBuilder;
  const { data: profile, error: profileError } = await profiles
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || (profile?.role !== "university_rep" && profile?.role !== "admin")) {
    await supabase.auth.signOut();
    throw new Error("This account does not have access to the institutional portal.");
  }
}

export async function restoreInstitutionSession(): Promise<boolean> {
  const { supabase } = await getSharedDatabase();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return false;
  }

  const profiles = supabase.from("profiles") as unknown as ProfileRoleBuilder;
  const { data: profile, error: profileError } = await profiles
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const isAuthorized =
    !profileError && (profile?.role === "university_rep" || profile?.role === "admin");

  if (!isAuthorized) {
    await supabase.auth.signOut();
  }

  return isAuthorized;
}

export async function signOutInstitution(): Promise<void> {
  const { supabase } = await getSharedDatabase();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("The shared authentication session could not be closed cleanly.");
  }
}

export async function publishPortalDraft(
  draft: PortalDraft,
  pendingAssets: PendingUniversityAssets = { logo: null, facilities: {} },
): Promise<PublishResult> {
  const { supabase } = await getSharedDatabase();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Sign in with a verified university representative account.");
  }

  const universities = supabase.from("universities") as unknown as UniversityMutationBuilder;
  const universityResult = await universities
    .insert(buildUniversityPayload(draft))
    .select("id")
    .single();

  if (universityResult.error || !universityResult.data) {
    throw new Error("The institution profile could not be published. Please try again.");
  }

  const universityId = universityResult.data.id;
  const uploadedPaths: string[] = [];
  const facilityImageUrls: FacilityImages = {};
  let logoUrl = draft.profile.logoUrl || undefined;

  try {
    const bucket = supabase.storage.from(UNIVERSITY_ASSET_BUCKET);
    const upload = async (file: File, kind: "logo" | `facilities/${(typeof FACILITIES)[number]["key"]}`) => {
      validateUniversityImage(file);
      const path = createUniversityAssetPath(authData.user.id, universityId, kind, file.type);
      const { error } = await bucket.upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw new Error("The selected image could not be uploaded.");
      uploadedPaths.push(path);
      return assertTrustedUniversityAssetUrl(bucket.getPublicUrl(path).data.publicUrl);
    };

    if (pendingAssets.logo) {
      logoUrl = await upload(pendingAssets.logo, "logo");
    }

    for (const { key } of FACILITIES) {
      const file = pendingAssets.facilities[key];
      if (file) facilityImageUrls[key] = await upload(file, `facilities/${key}`);
    }

    if (uploadedPaths.length > 0) {
      const assetUpdate = await universities.update({
        logo_url: logoUrl ?? null,
        facilities_flags: buildFacilityPayload(draft, facilityImageUrls),
      }).eq("id", universityId);
      if (assetUpdate.error) throw new Error("The uploaded images could not be linked to the institution.");
    }

    if (draft.gallery.length > 0) {
      const gallery = supabase.from("gallery_images") as unknown as BulkInsertBuilder<GalleryImagesInsert>;
      const galleryResult = await gallery
        .insert(draft.gallery.map((image) => buildGalleryPayload(image, universityId)));

      if (galleryResult.error) {
        throw new Error("Gallery publishing failed.");
      }
    }

    const courses = supabase.from("courses") as unknown as BulkInsertBuilder<CoursesInsert>;
    const courseResult = await courses
      .insert(draft.courses.map((course) => buildCoursePayload(course, universityId)));

    if (courseResult.error) {
      throw new Error("Programme publishing failed.");
    }
  } catch (cause) {
    const cleanupFailures: string[] = [];

    if (uploadedPaths.length > 0) {
      try {
        const { error } = await supabase.storage.from(UNIVERSITY_ASSET_BUCKET).remove(uploadedPaths);
        if (error) cleanupFailures.push("uploaded image cleanup failed");
      } catch {
        cleanupFailures.push("uploaded image cleanup failed");
      }
    }

    try {
      const { error } = await universities.delete().eq("id", universityId);
      if (error) cleanupFailures.push("institution record cleanup failed");
    } catch {
      cleanupFailures.push("institution record cleanup failed");
    }

    if (cleanupFailures.length > 0) {
      throw new Error(`Publishing failed and ${cleanupFailures.join("; ")}. Please contact support before retrying.`, { cause });
    }

    const reason = cause instanceof Error && cause.message ? ` ${cause.message}` : "";
    throw new Error(`Publishing did not complete. Cleanup completed.${reason}`, { cause });
  }

  return {
    mode: "cloud",
    universityId,
    publishedCourseCount: draft.courses.length,
    publishedGalleryCount: draft.gallery.length,
    publishedAt: new Date().toISOString(),
    logoUrl,
    facilityImageUrls,
  };
}
