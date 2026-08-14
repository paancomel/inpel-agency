import { z } from "zod";

import { AUTH_DRAFT_TTL_MS } from "./auth-draft";
import { parentPrioritiesSchema, type ParentPriorities } from "./validation";

const PARENT_DRAFT_VERSION = 1 as const;
const parentDraftKey = "inpel:parent-draft:v1";

const parentDraftSchema = z.object({
  version: z.literal(PARENT_DRAFT_VERSION),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  priorities: parentPrioritiesSchema,
});

export type ParentDraft = z.infer<typeof parentDraftSchema>;

export function createParentDraft(priorities: ParentPriorities, now = new Date()): ParentDraft {
  return parentDraftSchema.parse({
    version: PARENT_DRAFT_VERSION,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + AUTH_DRAFT_TTL_MS).toISOString(),
    priorities,
  });
}

export function cacheParentDraft(draft: ParentDraft): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(parentDraftKey, JSON.stringify(parentDraftSchema.parse(draft)));
    return true;
  } catch {
    return false;
  }
}

export function readParentDraft(now = new Date()): ParentDraft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(parentDraftKey);
    if (!raw) return null;
    const parsed = parentDraftSchema.safeParse(JSON.parse(raw) as unknown);
    if (!parsed.success || Date.parse(parsed.data.expiresAt) <= now.getTime()) {
      localStorage.removeItem(parentDraftKey);
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(parentDraftKey);
    return null;
  }
}

export function clearParentDraft(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(parentDraftKey);
}
