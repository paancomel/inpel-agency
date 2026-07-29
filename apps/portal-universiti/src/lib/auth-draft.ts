import { z } from "zod";

import type { AuthProvider, StudentAuthMode } from "./portal-data";
import { sessionRecordSchema, type SessionRecord } from "./storage";
import { studentAssessmentSchema, type StudentAssessment } from "./validation";

export const AUTH_DRAFT_TTL_MS = 24 * 60 * 60 * 1_000;
const AUTH_DRAFT_VERSION = 1 as const;
const authDraftKey = (sessionId: string) => `inpel:auth-draft:v1:${sessionId}`;

const authenticationDraftSchema = z.object({
  version: z.literal(AUTH_DRAFT_VERSION),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  provider: z.enum(["password", "google", "facebook"]),
  mode: z.enum(["signup", "login"]),
  requestedEmail: z.string().trim().email().optional(),
  session: sessionRecordSchema,
  assessment: studentAssessmentSchema,
});

export type AuthenticationDraft = z.infer<typeof authenticationDraftSchema>;

export function createAuthenticationDraft({
  session,
  assessment,
  provider,
  mode,
  requestedEmail,
  now = new Date(),
}: {
  session: SessionRecord;
  assessment: StudentAssessment;
  provider: AuthProvider;
  mode: StudentAuthMode;
  requestedEmail?: string;
  now?: Date;
}): AuthenticationDraft {
  return authenticationDraftSchema.parse({
    version: AUTH_DRAFT_VERSION,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + AUTH_DRAFT_TTL_MS).toISOString(),
    provider,
    mode,
    requestedEmail,
    session,
    assessment,
  });
}

export function cacheAuthenticationDraft(draft: AuthenticationDraft): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    // localStorage deliberately survives email-confirmation links opened in a
    // new tab. The payload is short-lived and contains no password or token.
    localStorage.setItem(authDraftKey(draft.session.id), JSON.stringify(authenticationDraftSchema.parse(draft)));
    return true;
  } catch {
    return false;
  }
}

export function readAuthenticationDraft(sessionId: string, now = new Date()): AuthenticationDraft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(authDraftKey(sessionId));
    if (!raw) return null;
    const parsed = authenticationDraftSchema.safeParse(JSON.parse(raw) as unknown);
    if (!parsed.success || Date.parse(parsed.data.expiresAt) <= now.getTime()) {
      localStorage.removeItem(authDraftKey(sessionId));
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(authDraftKey(sessionId));
    return null;
  }
}

export function clearAuthenticationDraft(sessionId: string): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(authDraftKey(sessionId));
}
