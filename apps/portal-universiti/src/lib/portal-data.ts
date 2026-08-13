import type { ParentProfile } from "./validation";

export interface SyncResult {
  source: "cloud";
  sessionId?: string;
  invitationToken?: string;
  expiresAt?: string;
}

export type StudentAuthMode = "signup" | "login";
export type OAuthProvider = "google" | "facebook";
export type AuthProvider = "password" | OAuthProvider;

export interface AuthenticatedStudent {
  source: "cloud";
  userId: string;
  email: string;
  confirmationRequired: boolean;
}

export interface DemoReport {
  sessionId: string;
  payload: Record<string, unknown>;
}

interface DatabaseError {
  message: string;
}

interface RpcClient {
  rpc(this: void, functionName: string, args: Record<string, unknown>): Promise<{ data: unknown; error: DatabaseError | null }>;
}

function requireObject(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(message);
  return value as Record<string, unknown>;
}

async function getRequiredClient() {
  try {
    const { supabase } = await import("@repo/database");
    return supabase;
  } catch {
    throw new Error("Secure INPEL services are unavailable. Your browser draft remains unsent; reconnect before continuing.");
  }
}

async function getRequiredUser() {
  const supabase = await getRequiredClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id || !data.user.email) {
    throw new Error("Sign in with the required account before continuing.");
  }
  return { supabase, user: data.user };
}

export async function authenticateStudentAccount(
  email: string,
  password: string,
  mode: StudentAuthMode,
  emailRedirectTo?: string,
): Promise<AuthenticatedStudent> {
  const supabase = await getRequiredClient();
  const result = mode === "signup"
    ? await supabase.auth.signUp({ email, password, ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}) })
    : await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw new Error(result.error.message);
  if (!result.data.user) throw new Error("Authentication succeeded without a student account.");
  if (mode === "login" && !result.data.session) throw new Error("Login succeeded without an active session.");
  return {
    source: "cloud",
    userId: result.data.user.id,
    email: result.data.user.email ?? email,
    confirmationRequired: !result.data.session,
  };
}

export async function authenticateParentAccount(
  email: string,
  password: string,
  mode: StudentAuthMode,
  emailRedirectTo?: string,
): Promise<AuthenticatedStudent> {
  return authenticateStudentAccount(email, password, mode, emailRedirectTo);
}

export async function getAuthenticatedStudent(): Promise<AuthenticatedStudent> {
  const { user } = await getRequiredUser();
  return { source: "cloud", userId: user.id, email: user.email!, confirmationRequired: false };
}

export async function beginStudentOAuth(provider: OAuthProvider, redirectTo: string): Promise<void> {
  const supabase = await getRequiredClient();
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  if (error) throw new Error(error.message);
}

export async function syncParentSession(profile: ParentProfile): Promise<SyncResult> {
  const supabase = await getRequiredClient();
  const { data, error } = await (supabase as unknown as RpcClient).rpc("create_parent_student_invitation", {
    p_student_email: profile.studentEmail,
    p_preferred_location: profile.location,
    p_monthly_household_income: profile.income,
    p_parental_preferences: {
      campus_vibe: profile.preferences.campusVibe,
      campus_concern: profile.preferences.campusConcern,
      ultimate_win: profile.preferences.ultimateWin,
      independence: profile.preferences.independence,
    },
    p_parent_preferences: profile.preferences,
  });
  if (error) throw new Error(error.message);
  const invitation = requireObject(data, "Invitation creation returned an invalid response.");
  if (typeof invitation.session_id !== "string" || typeof invitation.invitation_token !== "string" || typeof invitation.expires_at !== "string") {
    throw new Error("Invitation creation returned an invalid response.");
  }
  return {
    source: "cloud",
    sessionId: invitation.session_id,
    invitationToken: invitation.invitation_token,
    expiresAt: invitation.expires_at,
  };
}

export async function revokeParentStudentInvitation(sessionId: string): Promise<void> {
  const supabase = await getRequiredClient();
  const { error } = await (supabase as unknown as RpcClient).rpc("revoke_parent_student_invitation", { p_session_id: sessionId });
  if (error) throw new Error(error.message);
}

export async function claimStudentInvitation(invitationToken: string): Promise<{ sessionId: string; status: "claimed" }> {
  const supabase = await getRequiredClient();
  const { data, error } = await (supabase as unknown as RpcClient).rpc("claim_student_invitation", { p_invitation_token: invitationToken });
  if (error) throw new Error(error.message);
  const result = requireObject(data, "Invitation claim returned an invalid response.");
  if (typeof result.session_id !== "string" || result.status !== "claimed") throw new Error("Invitation claim returned an invalid response.");
  return { sessionId: result.session_id, status: "claimed" };
}

export async function syncStudentAssessment(session: import("./storage").SessionRecord): Promise<SyncResult> {
  if (!session.student) throw new Error("Student assessment is incomplete.");
  const { buildStudentAssessmentPayload } = await import("./database-payloads");
  const assessmentPayload = buildStudentAssessmentPayload(session);
  const supabase = await getRequiredClient();
  const { error } = await (supabase as unknown as RpcClient).rpc("complete_student_assessment", {
    p_session_id: session.id,
    p_assessment_data: assessmentPayload.assessment_data ?? {},
    p_academic_record: assessmentPayload.academic_record ?? [],
    p_personality_test: assessmentPayload.personality_test ?? [],
    p_vibe_check_quiz: assessmentPayload.vibe_check_quiz ?? {},
  });
  if (error) throw new Error(error.message);
  return { source: "cloud" };
}

export async function confirmCurrentParentOwnership(sessionId: string): Promise<void> {
  const { supabase, user } = await getRequiredUser();
  const profiles = supabase.from("profiles") as unknown as {
    select(columns: string): { eq(column: string, value: string): { maybeSingle(): Promise<{ data: { role?: unknown } | null; error: DatabaseError | null }> } };
  };
  const profile = await profiles.select("role").eq("id", user.id).maybeSingle();
  if (profile.error || (profile.data?.role !== "parent" && profile.data?.role !== "admin")) {
    throw new Error("Sign in with the parent account that created this invitation.");
  }

  const sessions = supabase.from("sessions") as unknown as {
    select(columns: string): { eq(column: string, value: string): { maybeSingle(): Promise<{ data: { id?: unknown } | null; error: DatabaseError | null }> } };
  };
  const owned = await sessions.select("id").eq("id", sessionId).maybeSingle();
  if (owned.error || owned.data?.id !== sessionId) {
    throw new Error("This parent account does not own this invitation.");
  }
}

export async function grantDemoReportAccess(sessionId: string): Promise<void> {
  const supabase = await getRequiredClient();
  const { data, error } = await (supabase as unknown as RpcClient).rpc("grant_demo_report_access", { p_session_id: sessionId });
  if (error) throw new Error(error.message);
  const grant = requireObject(data, "Demo report access returned an invalid response.");
  if (grant.session_id !== sessionId) throw new Error("Demo report access returned an invalid response.");
}

export async function getAuthorizedReport(sessionId: string): Promise<DemoReport> {
  const supabase = await getRequiredClient();
  const { data, error } = await (supabase as unknown as RpcClient).rpc("get_authorized_report", { p_session_id: sessionId });
  if (error) throw new Error(error.message);
  const payload = requireObject(data, "The report is not available for this account.");
  if (payload.session_id !== sessionId) throw new Error("The report is not available for this account.");
  return { sessionId, payload };
}
