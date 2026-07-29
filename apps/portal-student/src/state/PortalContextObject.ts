import { createContext } from "react";

import type {
  Course,
  FacilityKey,
  GalleryImage,
  PortalDraft,
  PendingUniversityAssets,
  PublishResult,
  UniversityProfile,
} from "../types/portal";

export interface PortalContextValue {
  draft: PortalDraft;
  isAuthenticated: boolean;
  isAuthResolved: boolean;
  publishResult: PublishResult | null;
  pendingAssets: PendingUniversityAssets;
  signOut: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  setPublishResult: (result: PublishResult | null) => void;
  updateProfile: (patch: Partial<UniversityProfile>) => void;
  setFacilityEnabled: (key: FacilityKey, enabled: boolean) => void;
  setFacilityImage: (key: FacilityKey, publicUrl: string) => void;
  setLogoAsset: (file: File | null) => void;
  setFacilityAsset: (key: FacilityKey, file: File | null) => void;
  clearPendingAssets: () => void;
  addGalleryImage: (image: GalleryImage) => void;
  removeGalleryImage: (id: string) => void;
  upsertCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
}

export const PortalContext = createContext<PortalContextValue | null>(null);
