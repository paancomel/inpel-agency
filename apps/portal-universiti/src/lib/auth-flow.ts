import { clearAuthenticationDraft, readAuthenticationDraft } from "./auth-draft";
import {
  getAuthenticatedStudent,
  claimStudentInvitation,
  syncStudentAssessment,
  type AuthenticatedStudent,
} from "./portal-data";
import { saveSession, type SessionRecord } from "./storage";

export async function completeCachedAuthentication(
  sessionId: string,
  invitationToken: string | undefined,
  authenticatedStudent?: AuthenticatedStudent,
  now = new Date(),
): Promise<SessionRecord> {
  const draft = readAuthenticationDraft(sessionId, now);
  if (!draft) throw new Error("Your saved assessment could not be found or has expired. Please return to the student portal.");

  const auth = authenticatedStudent ?? await getAuthenticatedStudent();
  if (auth.confirmationRequired) throw new Error("Confirm your email, then return here to finish saving your assessment.");
  if (auth.source !== "cloud" || !auth.userId) throw new Error("Secure INPEL services are required before an assessment can be submitted.");
  if (!invitationToken) throw new Error("This invitation is missing its secure claim token. Please reopen the invitation link.");
  const claim = await claimStudentInvitation(invitationToken);
  if (claim.sessionId !== sessionId) throw new Error("This invitation does not match the current session.");

  const completed: SessionRecord = {
    ...draft.session,
    status: "completed",
    studentProgress: 4,
    authentication: { provider: draft.provider, authenticatedAt: now.toISOString() },
    student: {
      email: auth.email,
      assessment: draft.assessment,
      submittedAt: now.toISOString(),
    },
  };

  const sync = await syncStudentAssessment(completed);
  if (sync.source !== "cloud") {
    throw new Error("Your account is active, but the assessment could not be saved. Please retry.");
  }
  if (!saveSession(completed)) throw new Error("Your assessment was saved online, but this browser could not retain the session.");

  clearAuthenticationDraft(sessionId);
  return completed;
}
