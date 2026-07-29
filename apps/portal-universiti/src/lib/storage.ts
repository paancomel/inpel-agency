import { z } from "zod";

import { GRADE_OPTIONS, parentProfileSchema, sessionIdSchema, studentAssessmentSchema, type ParentProfile } from "./validation";

const draftSubjectSchema = z.object({ subject: z.string(), grade: z.enum(GRADE_OPTIONS).or(z.literal("")) });
const studentDraftSchema = z.object({
  personalityAnswers: z.array(z.number().int().min(1).max(5)).max(16),
  psychometric: studentAssessmentSchema.shape.psychometric,
  subjects: z.array(draftSubjectSchema).max(20),
  vibeAnswers: studentAssessmentSchema.shape.vibeAnswers.partial(),
});

export const sessionRecordSchema = z.object({
  id: sessionIdSchema,
  createdAt: z.string().datetime(),
  status: z.enum(["invited", "completed"]),
  parent: parentProfileSchema.optional(),
  studentProgress: z.number().int().min(0).max(4),
  studentDraft: studentDraftSchema.optional(),
  authentication: z.object({
    provider: z.enum(["password", "google", "facebook"]),
    authenticatedAt: z.string().datetime(),
  }).optional(),
  parentNotifiedAt: z.string().datetime().optional(),
  student: z.object({
    email: z.string().trim().email(),
    assessment: studentAssessmentSchema,
    submittedAt: z.string().datetime(),
  }).optional(),
  payment: z.object({
    tier: z.number().int().min(1).max(3),
    status: z.enum(["pending", "success", "failed"]),
    paidAt: z.string().datetime().optional(),
  }).optional(),
});

export type SessionRecord = z.infer<typeof sessionRecordSchema>;
const sessionKey = (id: string) => `inpel:session:${id}`;

export function createSessionRecord(parent: ParentProfile, sessionId: string = crypto.randomUUID()): SessionRecord {
  return { id: sessionId, createdAt: new Date().toISOString(), status: "invited", parent, studentProgress: 0 };
}

export function createStudentSessionRecord(id: string): SessionRecord {
  return { id, createdAt: new Date().toISOString(), status: "invited", studentProgress: 0 };
}

export function isValidSessionId(id: string | undefined): id is string {
  return sessionIdSchema.safeParse(id).success;
}

export function saveSession(session: SessionRecord): boolean {
  const validated = sessionRecordSchema.safeParse(session);
  if (!validated.success || typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(sessionKey(session.id), JSON.stringify(validated.data));
    return true;
  } catch {
    return false;
  }
}

export function readSession(id: string): SessionRecord | null {
  if (!isValidSessionId(id) || typeof localStorage === "undefined") return null;
  try {
    const rawSession = localStorage.getItem(sessionKey(id));
    if (!rawSession) return null;
    const validated = sessionRecordSchema.safeParse(JSON.parse(rawSession) as unknown);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

export function updateSession(id: string, updater: (session: SessionRecord) => SessionRecord): SessionRecord | null {
  const current = readSession(id);
  if (!current) return null;
  const updated = updater(current);
  return saveSession(updated) ? updated : null;
}
