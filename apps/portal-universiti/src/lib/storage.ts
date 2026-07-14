import { z } from "zod";

import {
  parentProfileSchema,
  sessionIdSchema,
  studentAssessmentSchema,
  type ParentProfile,
} from "./validation";

const studentDraftSchema = z.object({
  email: z.string().trim().email(),
  hobbies: z.array(z.string()),
  psychometric: studentAssessmentSchema.shape.psychometric,
  coreGrades: studentAssessmentSchema.shape.coreGrades.partial(),
  electives: z.array(z.string()).max(5),
});

const sessionRecordSchema = z.object({
  id: sessionIdSchema,
  createdAt: z.string().datetime(),
  status: z.enum(["invited", "completed"]),
  parent: parentProfileSchema,
  studentProgress: z.number().int().min(0).max(3),
  studentDraft: studentDraftSchema.optional(),
  student: z
    .object({
      email: z.string().trim().email(),
      assessment: studentAssessmentSchema,
      submittedAt: z.string().datetime(),
    })
    .optional(),
  payment: z
    .object({
      tier: z.number().int().min(1).max(3),
      status: z.enum(["pending", "success", "failed"]),
      paidAt: z.string().datetime().optional(),
    })
    .optional(),
});

export type SessionRecord = z.infer<typeof sessionRecordSchema>;

const sessionKey = (id: string) => `inpel:session:${id}`;

export function createSessionRecord(parent: ParentProfile): SessionRecord {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "invited",
    parent,
    studentProgress: 0,
  };
}

export function isValidSessionId(id: string | undefined): id is string {
  return sessionIdSchema.safeParse(id).success;
}

export function saveSession(session: SessionRecord): boolean {
  const validated = sessionRecordSchema.safeParse(session);
  if (!validated.success || typeof localStorage === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(sessionKey(session.id), JSON.stringify(validated.data));
    return true;
  } catch {
    return false;
  }
}

export function readSession(id: string): SessionRecord | null {
  if (!isValidSessionId(id) || typeof localStorage === "undefined") {
    return null;
  }

  try {
    const rawSession = localStorage.getItem(sessionKey(id));
    if (!rawSession) return null;

    const parsed: unknown = JSON.parse(rawSession);
    const validated = sessionRecordSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

export function updateSession(
  id: string,
  updater: (session: SessionRecord) => SessionRecord,
): SessionRecord | null {
  const current = readSession(id);
  if (!current) return null;

  const updated = updater(current);
  return saveSession(updated) ? updated : null;
}
