import { describe, expect, it, vi } from "vitest";

import {
  assertTrustedUniversityAssetUrl,
  createUniversityAssetPath,
  isTrustedUniversityAssetUrl,
  validateUniversityImage,
} from "./assets";

describe("university asset security", () => {
  it("accepts only the configured public image formats up to 5 MB", () => {
    expect(() => validateUniversityImage(new File(["png"], "logo.png", { type: "image/png" }))).not.toThrow();
    expect(() => validateUniversityImage(new File(["svg"], "logo.svg", { type: "image/svg+xml" }))).toThrow(
      "Upload a PNG, JPEG, or WebP image.",
    );
    expect(() => validateUniversityImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.webp", { type: "image/webp" }))).toThrow(
      "Image must be 5 MB or smaller.",
    );
  });

  it("generates an owner-scoped path without retaining the untrusted filename", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("12345678-1234-4234-8234-123456789abc");

    expect(
      createUniversityAssetPath(
        "representative-1",
        "university-1",
        "facilities/library",
        "image/jpeg",
      ),
    ).toBe(
      "representative-1/university-1/facilities/library/12345678-1234-4234-8234-123456789abc.jpg",
    );
  });

  it("accepts only a university-assets public object URL, never an arbitrary remote image", () => {
    const valid = "https://project.supabase.co/storage/v1/object/public/university-assets/owner/university/logo/file.png";

    expect(isTrustedUniversityAssetUrl(valid)).toBe(true);
    expect(isTrustedUniversityAssetUrl("https://images.example/logo.png")).toBe(false);
    expect(() => assertTrustedUniversityAssetUrl("https://images.example/logo.png")).toThrow(
      "university-assets Storage public URL",
    );
  });
});
