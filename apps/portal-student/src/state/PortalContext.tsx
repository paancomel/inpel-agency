import { type PropsWithChildren, useEffect, useMemo, useState } from "react";

import { createEmptyPortalDraft } from "../lib/defaults";
import { restoreInstitutionSession, signOutInstitution } from "../lib/database";
import { loadPortalDraft, savePortalDraft } from "../lib/storage";
import type {
  FacilityKey,
  PendingUniversityAssets,
  PortalDraft,
  PublishResult,
} from "../types/portal";
import { PortalContext, type PortalContextValue } from "./PortalContextObject";

export function PortalProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<PortalDraft>(() => loadPortalDraft() ?? createEmptyPortalDraft());
  const [isAuthenticated, setAuthenticatedState] = useState(false);
  const [isAuthResolved, setAuthResolved] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [pendingAssets, setPendingAssets] = useState<PendingUniversityAssets>({
    logo: null,
    facilities: {},
  });

  useEffect(() => {
    savePortalDraft(draft);
  }, [draft]);

  useEffect(() => {
    let isActive = true;

    void restoreInstitutionSession()
      .then((isAuthorized) => {
        if (isActive) setAuthenticatedState(isAuthorized);
      })
      .catch(() => {
        if (isActive) setAuthenticatedState(false);
      })
      .finally(() => {
        if (isActive) setAuthResolved(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<PortalContextValue>(
    () => ({
      draft,
      isAuthenticated,
      isAuthResolved,
      publishResult,
      pendingAssets,
      setAuthenticated: (value) => {
        setAuthenticatedState(value);
        setAuthResolved(true);
      },
      signOut: async () => {
        try {
          await signOutInstitution();
        } catch {
          // Demo mode has no configured shared session to revoke.
        } finally {
          setAuthenticatedState(false);
          setAuthResolved(true);
        }
      },
      setPublishResult,
      updateProfile: (patch) => {
        setDraft((current) => ({
          ...current,
          profile: { ...current.profile, ...patch },
          updatedAt: new Date().toISOString(),
        }));
      },
      setFacilityEnabled: (key, enabled) => {
        setDraft((current) => ({
          ...current,
          facilities: { ...current.facilities, [key]: enabled },
          updatedAt: new Date().toISOString(),
        }));
      },
      setFacilityImage: (key, publicUrl) => {
        setDraft((current) => ({
          ...current,
          facilityImages: { ...current.facilityImages, [key]: publicUrl },
          updatedAt: new Date().toISOString(),
        }));
      },
      setLogoAsset: (file) => {
        setPendingAssets((current) => ({ ...current, logo: file }));
      },
      setFacilityAsset: (key: FacilityKey, file: File | null) => {
        setPendingAssets((current) => {
          const facilities = { ...current.facilities };
          if (file) facilities[key] = file;
          else delete facilities[key];
          return { ...current, facilities };
        });
      },
      clearPendingAssets: () => setPendingAssets({ logo: null, facilities: {} }),
      addGalleryImage: (image) => {
        setDraft((current) => ({
          ...current,
          gallery: [...current.gallery, image],
          updatedAt: new Date().toISOString(),
        }));
      },
      removeGalleryImage: (id) => {
        setDraft((current) => ({
          ...current,
          gallery: current.gallery.filter((image) => image.id !== id),
          updatedAt: new Date().toISOString(),
        }));
      },
      upsertCourse: (course) => {
        setDraft((current) => {
          const exists = current.courses.some((item) => item.id === course.id);
          return {
            ...current,
            courses: exists
              ? current.courses.map((item) => (item.id === course.id ? course : item))
              : [...current.courses, course],
            updatedAt: new Date().toISOString(),
          };
        });
      },
      removeCourse: (id) => {
        setDraft((current) => ({
          ...current,
          courses: current.courses.filter((course) => course.id !== id),
          updatedAt: new Date().toISOString(),
        }));
      },
    }),
    [draft, isAuthenticated, isAuthResolved, pendingAssets, publishResult],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}
