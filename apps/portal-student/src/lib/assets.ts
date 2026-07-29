import type { FacilityKey } from "../types/portal";

declare const process: {
  env: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
  };
};

export const UNIVERSITY_ASSET_BUCKET = "university-assets";
export const UNIVERSITY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type UniversityImageMimeType = keyof typeof IMAGE_EXTENSIONS;
export type UniversityAssetKind = "logo" | `facilities/${FacilityKey}`;

function configuredAssetOrigin(): URL | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredUrl) return null;

  try {
    return new URL(configuredUrl);
  } catch {
    return null;
  }
}

/**
 * Accept only public object URLs from the configured project. When the project
 * is intentionally unconfigured, recognise only Supabase's stable public
 * university-assets URL shape, never arbitrary third-party image URLs.
 */
export function isTrustedUniversityAssetUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const objectPrefix = "/storage/v1/object/public/university-assets/";
    const configured = configuredAssetOrigin();

    if (configured) {
      return (
        parsed.origin === configured.origin &&
        parsed.pathname.startsWith(objectPrefix) &&
        parsed.pathname.length > objectPrefix.length
      );
    }

    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.startsWith(objectPrefix) &&
      parsed.pathname.length > objectPrefix.length
    );
  } catch {
    return false;
  }
}

export function assertTrustedUniversityAssetUrl(value: string): string {
  if (!isTrustedUniversityAssetUrl(value)) {
    throw new Error("Images must use this project's university-assets Storage public URL.");
  }

  return new URL(value).toString();
}

export function validateUniversityImage(file: File): asserts file is File & { type: UniversityImageMimeType } {
  if (!(file.type in IMAGE_EXTENSIONS)) {
    throw new Error("Upload a PNG, JPEG, or WebP image.");
  }

  if (file.size > UNIVERSITY_IMAGE_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
}

function assertSafeIdentifier(value: string): void {
  if (!/^[a-zA-Z0-9-]+$/.test(value)) {
    throw new Error("The asset owner could not be verified.");
  }
}

export function createUniversityAssetPath(
  representativeId: string,
  universityId: string,
  kind: UniversityAssetKind,
  mimeType: UniversityImageMimeType,
): string {
  assertSafeIdentifier(representativeId);
  assertSafeIdentifier(universityId);

  return `${representativeId}/${universityId}/${kind}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[mimeType]}`;
}
