import { createClient, type User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { createAuditFixtures, type AuditAccount } from "./audit-flow.fixtures.js";
import { createSupabaseClient, supabase, type TypedSupabaseClient } from "./supabase.js";
import type { Database, PublicTableName, TablesInsert } from "./types.js";

interface DatabaseError {
  code?: string;
  message: string;
}

interface MutationResult {
  error: DatabaseError | null;
}

interface DeleteBuilder {
  delete(): { in(column: "id", values: readonly string[]): PromiseLike<MutationResult> };
}

interface SelectIdsBuilder {
  select(columns: "id"): {
    in(column: "id", values: readonly string[]): PromiseLike<{
      data: Array<{ id: string }> | null;
      error: DatabaseError | null;
    }>;
  };
}

interface InsertBuilder {
  insert(value: unknown): PromiseLike<MutationResult>;
}

interface DeleteBySessionBuilder {
  delete(): { eq(column: "session_id", value: string): PromiseLike<MutationResult> };
}

interface RpcClient {
  rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: DatabaseError | null }>;
}

interface AuditEnvironment {
  url: string;
  publicKey: string;
  serviceKey: string;
}

const DISPOSABLE_STAGING_REF = "xrmrhjgkttxzvwdsjazs";

function requireAuditEnvironment(): AuditEnvironment {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

  if (!url || !publicKey || !serviceKey) {
    throw new Error(
      "Supabase integration audit credentials are incomplete. Provide " +
        "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (or its " +
        "publishable-key alias), and SUPABASE_SECRET_KEY or " +
        "SUPABASE_SERVICE_ROLE_KEY. See packages/database/integration.env.example.",
    );
  }

  const hostname = new URL(url).hostname.toLowerCase();
  const expectedHostname = `${DISPOSABLE_STAGING_REF}.supabase.co`;
  if (hostname !== expectedHostname || process.env.SUPABASE_AUDIT_ALLOW_REMOTE !== "true") {
    throw new Error(
      "Refusing to write audit fixtures unless the target is the authorized disposable staging " +
        `project (${expectedHostname}) and SUPABASE_AUDIT_ALLOW_REMOTE=true is set.`,
    );
  }

  return { url, publicKey, serviceKey };
}

function createServiceClient(environment: AuditEnvironment): TypedSupabaseClient {
  return createClient<Database>(environment.url, environment.serviceKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    db: { schema: "public" },
  });
}

async function createUser(service: TypedSupabaseClient, account: AuditAccount): Promise<User> {
  const { data, error } = await service.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`Could not create ${account.role} audit user: ${error?.message ?? "unknown error"}`);
  return data.user;
}

async function signIn(environment: AuditEnvironment, account: AuditAccount): Promise<TypedSupabaseClient> {
  const client = createSupabaseClient({
    NEXT_PUBLIC_SUPABASE_URL: environment.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: environment.publicKey,
  });
  const { data, error } = await client.auth.signInWithPassword({ email: account.email, password: account.password });
  if (error || !data.user) throw new Error(`Could not sign in ${account.role} audit user: ${error?.message ?? "unknown error"}`);
  return client;
}

function expectDatabaseError(error: DatabaseError | null, code: string, purpose: string): void {
  expect(error, `${purpose} unexpectedly succeeded`).not.toBeNull();
  expect(error?.code, `${purpose} returned: ${error?.message}`).toBe(code);
}

function expectNoDatabaseError(error: DatabaseError | null, purpose: string): void {
  expect(error, `${purpose} failed: ${error?.message}`).toBeNull();
}

function jsonObject(value: unknown, purpose: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${purpose} returned invalid JSON.`);
  return value as Record<string, unknown>;
}

async function rpc(client: TypedSupabaseClient, name: string, args: Record<string, unknown>) {
  return (client as unknown as RpcClient).rpc(name, args);
}

async function insertRows<TableName extends PublicTableName>(
  client: TypedSupabaseClient,
  tableName: TableName,
  value: TablesInsert<TableName> | Array<TablesInsert<TableName>>,
): Promise<MutationResult> {
  return (client.from(tableName) as unknown as InsertBuilder).insert(value);
}

async function deleteIds(service: TypedSupabaseClient, tableName: PublicTableName, ids: readonly string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await (service.from(tableName) as unknown as DeleteBuilder).delete().in("id", ids);
  if (error) throw new Error(`Cleanup failed for ${tableName}: ${error.message}`);
}

async function deleteAssessmentsForSessions(service: TypedSupabaseClient, sessionIds: readonly string[]): Promise<void> {
  for (const sessionId of sessionIds) {
    const { error } = await (service.from("student_assessments") as unknown as DeleteBySessionBuilder)
      .delete()
      .eq("session_id", sessionId);
    if (error) throw new Error(`Cleanup failed for assessment session ${sessionId}: ${error.message}`);
  }
}

async function assertIdsAbsent(service: TypedSupabaseClient, tableName: PublicTableName, ids: readonly string[]): Promise<void> {
  if (ids.length === 0) return;
  const { data, error } = await (service.from(tableName) as unknown as SelectIdsBuilder).select("id").in("id", ids);
  if (error) throw new Error(`Cleanup verification failed for ${tableName}: ${error.message}`);
  expect(data ?? [], `Cleanup left rows in ${tableName}.`).toEqual([]);
}

describe("Supabase three-portal integration audit", () => {
  it("enforces RPC-only family flow, report access, institutional ownership, moderation, and cleanup", async () => {
    const environment = requireAuditEnvironment();
    const fixtures = createAuditFixtures();
    const service = createServiceClient(environment);
    const createdAuthUserIds: string[] = [];
    const createdIds = {
      universities: [fixtures.ids.university],
      courses: [fixtures.ids.course],
      gallery_images: [fixtures.ids.galleryImage],
      sessions: [] as string[],
      recommendation_results: [fixtures.ids.recommendation],
      reviews: [] as string[],
    };
    let auditFailure: unknown;
    let cleanupFailure: unknown;

    try {
      const parentUser = await createUser(service, fixtures.accounts.parent);
      const studentUser = await createUser(service, fixtures.accounts.student);
      const representativeUser = await createUser(service, fixtures.accounts.representative);
      const adminUser = await createUser(service, fixtures.accounts.admin);
      createdAuthUserIds.push(parentUser.id, studentUser.id, representativeUser.id, adminUser.id);

      const profileInsert = await insertRows(service, "profiles", [
        { id: parentUser.id, email: fixtures.accounts.parent.email, role: "parent" },
        { id: studentUser.id, email: fixtures.accounts.student.email, role: "student" },
        { id: representativeUser.id, email: fixtures.accounts.representative.email, role: "university_rep" },
        { id: adminUser.id, email: fixtures.accounts.admin.email, role: "admin" },
      ]);
      expectNoDatabaseError(profileInsert.error, "service setup of role profiles");

      const parent = await signIn(environment, fixtures.accounts.parent);
      const student = await signIn(environment, fixtures.accounts.student);
      const representative = await signIn(environment, fixtures.accounts.representative);

      const anonymousUniversity = await insertRows(supabase, "universities", {
        id: fixtures.ids.anonymousUniversityAttempt,
        name: `QA Audit Anonymous Write ${fixtures.runId}`,
      });
      expectDatabaseError(anonymousUniversity.error, "42501", "anonymous university insert");

      const universityInsert = await insertRows(representative, "universities", fixtures.institution.university);
      expectNoDatabaseError(universityInsert.error, "university representative university insert");
      const courseInsert = await insertRows(representative, "courses", fixtures.institution.course);
      expectNoDatabaseError(courseInsert.error, "university representative course insert");
      const galleryInsert = await insertRows(representative, "gallery_images", fixtures.institution.galleryImage);
      expectNoDatabaseError(galleryInsert.error, "university representative gallery insert");

      const directSession = await insertRows(parent, "sessions", {
        id: fixtures.ids.unauthorizedSessionAttempt,
        parent_id: parentUser.id,
        status: "invited",
      });
      expectDatabaseError(directSession.error, "42501", "direct parent session insert");

      const invitationResult = await rpc(parent, "create_parent_student_invitation", {
        p_student_email: fixtures.accounts.student.email,
        p_preferred_location: "Selangor",
        p_monthly_household_income: "RM 6,000 - RM 9,999",
        p_parental_preferences: { campus_vibe: "Modern" },
        p_parent_preferences: { campusVibe: "Modern" },
      });
      expectNoDatabaseError(invitationResult.error, "parent invitation RPC");
      const invitation = jsonObject(invitationResult.data, "parent invitation RPC");
      expect(typeof invitation.session_id).toBe("string");
      expect(typeof invitation.invitation_token).toBe("string");
      const sessionId = invitation.session_id as string;
      const invitationToken = invitation.invitation_token as string;
      createdIds.sessions.push(sessionId);

      const directAssessment = await insertRows(student, "student_assessments", {
        ...fixtures.student.assessment,
        session_id: sessionId,
        student_id: studentUser.id,
      });
      expectDatabaseError(directAssessment.error, "42501", "direct student assessment insert");

      const claimResult = await rpc(student, "claim_student_invitation", { p_invitation_token: invitationToken });
      expectNoDatabaseError(claimResult.error, "student invitation claim RPC");
      expect(jsonObject(claimResult.data, "student invitation claim RPC").session_id).toBe(sessionId);

      const completionResult = await rpc(student, "complete_student_assessment", {
        p_session_id: sessionId,
        p_assessment_data: fixtures.student.assessment.assessment_data ?? {},
        p_academic_record: fixtures.student.assessment.academic_record ?? [],
        p_personality_test: fixtures.student.assessment.personality_test ?? [],
        p_vibe_check_quiz: fixtures.student.assessment.vibe_check_quiz ?? {},
      });
      expectNoDatabaseError(completionResult.error, "student assessment completion RPC");

      const reportBeforeGrant = await rpc(parent, "get_authorized_report", { p_session_id: sessionId });
      expectDatabaseError(reportBeforeGrant.error, "42501", "report before demo grant");

      const recommendationInsert = await insertRows(service, "recommendation_results", {
        ...fixtures.inpel.recommendation,
        session_id: sessionId,
        university_id: fixtures.ids.university,
      });
      expectNoDatabaseError(recommendationInsert.error, "service recommendation fixture setup");

      const reportGrant = await rpc(parent, "grant_demo_report_access", { p_session_id: sessionId });
      expectNoDatabaseError(reportGrant.error, "parent demo report grant RPC");
      const report = await rpc(parent, "get_authorized_report", { p_session_id: sessionId });
      expectNoDatabaseError(report.error, "authorized parent report RPC");
      const reportPayload = jsonObject(report.data, "authorized parent report RPC");
      expect(reportPayload.session_id).toBe(sessionId);
      expect(reportPayload.recommendations).toEqual(expect.arrayContaining([expect.objectContaining({ id: fixtures.ids.recommendation })]));

      const studentReport = await rpc(student, "get_authorized_report", { p_session_id: sessionId });
      expectDatabaseError(studentReport.error, "42501", "student report access");

      const directPayment = await insertRows(parent, "payments", {
        id: fixtures.ids.payment,
        session_id: sessionId,
        tier: 1,
        status: "success",
      });
      expectDatabaseError(directPayment.error, "42501", "direct payment insert");

      const directRawReview = await insertRows(supabase, "reviews", {
        university_id: fixtures.ids.university,
        review_data: fixtures.review.submission.review_data,
        is_anonymous: true,
      });
      expectDatabaseError(directRawReview.error, "42501", "anonymous raw review insert");

      const moderatedReview = await rpc(supabase, "submit_review_for_moderation", {
        p_university_id: fixtures.ids.university,
        p_review_data: fixtures.review.submission.review_data,
        p_is_anonymous: true,
      });
      expectNoDatabaseError(moderatedReview.error, "anonymous moderated review RPC");
      const reviewPayload = jsonObject(moderatedReview.data, "anonymous moderated review RPC");
      expect(typeof reviewPayload.review_id).toBe("string");
      createdIds.reviews.push(reviewPayload.review_id as string);
    } catch (error) {
      auditFailure = error;
    }

    try {
      await deleteIds(service, "reviews", createdIds.reviews);
      await deleteIds(service, "recommendation_results", createdIds.recommendation_results);
      await deleteAssessmentsForSessions(service, createdIds.sessions);
      await deleteIds(service, "sessions", createdIds.sessions);
      await deleteIds(service, "gallery_images", createdIds.gallery_images);
      await deleteIds(service, "courses", createdIds.courses);
      await deleteIds(service, "universities", createdIds.universities);
      await deleteIds(service, "profiles", createdAuthUserIds);
      for (const userId of [...createdAuthUserIds].reverse()) {
        const { error } = await service.auth.admin.deleteUser(userId);
        if (error) throw new Error(`Cleanup failed for audit Auth user: ${error.message}`);
      }

      await assertIdsAbsent(service, "reviews", createdIds.reviews);
      await assertIdsAbsent(service, "recommendation_results", createdIds.recommendation_results);
      await assertIdsAbsent(service, "sessions", createdIds.sessions);
      await assertIdsAbsent(service, "gallery_images", createdIds.gallery_images);
      await assertIdsAbsent(service, "courses", createdIds.courses);
      await assertIdsAbsent(service, "universities", createdIds.universities);
    } catch (error) {
      cleanupFailure = error;
    }

    if (auditFailure && cleanupFailure) throw new AggregateError([auditFailure, cleanupFailure], "Audit failed and cleanup was incomplete.");
    if (cleanupFailure) throw cleanupFailure;
    if (auditFailure) throw auditFailure;
  });
});
