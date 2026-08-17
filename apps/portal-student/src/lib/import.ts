import { institutionImportSchema } from "./validation";
import type { FacilityFlags, InstitutionImportPayload, PortalDraft, UniversityProfile } from "../types/portal";

export type ImportResult =
  | { success: true; data: InstitutionImportPayload }
  | { success: false; message: string };

function withoutUndefined<T extends object>(value: { [Key in keyof T]?: T[Key] | undefined } | undefined): Partial<T> {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([, item]) => item !== undefined)) as Partial<T>;
}

export function parseInstitutionImport(raw: string): ImportResult {
  try {
    const value: unknown = JSON.parse(raw);
    const result = institutionImportSchema.safeParse(value);
    if (result.success) return { success: true, data: result.data };
    return { success: false, message: result.error.issues[0]?.message ?? "The import file is not valid." };
  } catch {
    return { success: false, message: "Upload a valid JSON import file." };
  }
}

export function applyInstitutionImport(current: PortalDraft, imported: InstitutionImportPayload): PortalDraft {
  return {
    ...current,
    profile: { ...current.profile, ...withoutUndefined<UniversityProfile>(imported.profile) },
    facilities: { ...current.facilities, ...withoutUndefined<FacilityFlags>(imported.facilities) },
    facilityImages: { ...current.facilityImages, ...imported.facilityImages },
    gallery: imported.gallery
      ? imported.gallery.map((image) => ({ ...image, id: crypto.randomUUID() }))
      : current.gallery,
    courses: imported.courses
      ? imported.courses.map((course) => ({ ...course, id: crypto.randomUUID() }))
      : current.courses,
    accuracyAttested: imported.accuracyAttested ?? current.accuracyAttested,
    updatedAt: new Date().toISOString(),
  };
}
