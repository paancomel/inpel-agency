import type { PortalDraft } from "../types/portal";
import { portalDraftSchema } from "./validation";

export const PORTAL_DRAFT_KEY = "inpeler:institution-draft:v1";

export function loadPortalDraft(): PortalDraft | null {
  try {
    const rawDraft = localStorage.getItem(PORTAL_DRAFT_KEY);

    if (!rawDraft) {
      return null;
    }

    const result = portalDraftSchema.safeParse(JSON.parse(rawDraft) as unknown);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function savePortalDraft(draft: PortalDraft): void {
  const validatedDraft = portalDraftSchema.parse(draft);
  localStorage.setItem(PORTAL_DRAFT_KEY, JSON.stringify(validatedDraft));
}

export function clearPortalDraft(): void {
  localStorage.removeItem(PORTAL_DRAFT_KEY);
}
