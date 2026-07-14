import type { Json, Tables, TablesInsert, TablesUpdate } from "@repo/database";

import type { SessionRecord } from "./storage";

export interface SyncResult {
  source: "cloud" | "local";
  message?: string;
}

interface DatabaseError {
  message: string;
}

interface MutationResult {
  error: DatabaseError | null;
}

interface MutationBuilder<Insert, Update> {
  insert(values: Insert): PromiseLike<MutationResult>;
  update(values: Update): {
    eq(column: string, value: unknown): PromiseLike<MutationResult>;
  };
  upsert(values: Insert): PromiseLike<MutationResult>;
}

interface SelectBuilder<Row> {
  select(columns: "*"): {
    order(column: string): {
      limit(count: number): PromiseLike<{ data: Row[] | null; error: DatabaseError | null }>;
    };
  };
}

function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

async function getSharedClient() {
  const { supabase } = await import("@repo/database");
  return supabase;
}

function localFallback(error: unknown): SyncResult {
  const message = error instanceof Error ? error.message : "Cloud sync is unavailable.";
  return { source: "local", message };
}

// The database package supplies the authoritative row and payload types. Its
// legacy row interfaces do not satisfy the newer Supabase builder constraint,
// so only the fluent builder is adapted here; every payload remains strictly typed.

export async function syncParentSession(session: SessionRecord): Promise<SyncResult> {
  try {
    const supabase = await getSharedClient();
    const sessions = supabase.from("sessions") as unknown as MutationBuilder<
      TablesInsert<"sessions">,
      TablesUpdate<"sessions">
    >;
    const payload: TablesInsert<"sessions"> = {
      id: session.id,
      parent_preferences: asJson(session.parent),
      status: "invited",
    };
    const { error } = await sessions.upsert(payload);

    if (error) throw new Error(error.message);
    return { source: "cloud" };
  } catch (error) {
    return localFallback(error);
  }
}

export async function syncStudentAssessment(session: SessionRecord): Promise<SyncResult> {
  if (!session.student) return { source: "local", message: "Student assessment is incomplete." };

  try {
    const supabase = await getSharedClient();
    const assessments = supabase.from("student_assessments") as unknown as MutationBuilder<
      TablesInsert<"student_assessments">,
      TablesUpdate<"student_assessments">
    >;
    const assessmentPayload: TablesInsert<"student_assessments"> = {
      session_id: session.id,
      assessment_data: asJson({
        email: session.student.email,
        ...session.student.assessment,
      }),
    };
    const { error: assessmentError } = await assessments.insert(assessmentPayload);

    if (assessmentError) throw new Error(assessmentError.message);

    const sessions = supabase.from("sessions") as unknown as MutationBuilder<
      TablesInsert<"sessions">,
      TablesUpdate<"sessions">
    >;
    const { error: sessionError } = await sessions.update({ status: "completed" }).eq("id", session.id);

    if (sessionError) throw new Error(sessionError.message);
    return { source: "cloud" };
  } catch (error) {
    return localFallback(error);
  }
}

export async function syncPayment(session: SessionRecord): Promise<SyncResult> {
  if (!session.payment) return { source: "local", message: "Payment selection is incomplete." };

  try {
    const supabase = await getSharedClient();
    const payments = supabase.from("payments") as unknown as MutationBuilder<
      TablesInsert<"payments">,
      TablesUpdate<"payments">
    >;
    const payload: TablesInsert<"payments"> = {
      session_id: session.id,
      tier: session.payment.tier,
      status: session.payment.status,
    };
    const { error } = await payments.insert(payload);

    if (error) throw new Error(error.message);
    return { source: "cloud" };
  } catch (error) {
    return localFallback(error);
  }
}

export async function fetchUniversities(): Promise<Tables<"universities">[]> {
  const supabase = await getSharedClient();
  const universities = supabase.from("universities") as unknown as SelectBuilder<Tables<"universities">>;
  const { data, error } = await universities
    .select("*")
    .order("name")
    .limit(6);

  if (error) throw new Error(error.message);
  return data ?? [];
}
