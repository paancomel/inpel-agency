import { useEffect, useState, type ReactNode } from "react";

import { authenticateParentAccount, beginStudentOAuth, confirmCurrentParentOwnership, type AuthProvider, type StudentAuthMode } from "../lib/portal-data";
import { ParentAuthGate } from "./ParentAuthGate";

type GateState = "checking" | "required" | "allowed";

export function ParentSessionGate({ sessionId, children }: { sessionId: string; children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let active = true;

    void confirmCurrentParentOwnership(sessionId).then(
      () => {
        if (!active) return;
        setError("");
        setState("allowed");
      },
      (reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Parent verification failed.");
        setState("required");
      },
    );

    return () => { active = false; };
  }, [sessionId]);

  async function authenticate(provider: AuthProvider, email: string | undefined, password: string | undefined, mode: StudentAuthMode) {
    setIsAuthenticating(true);
    setError("");
    try {
      if (provider !== "password") {
        await beginStudentOAuth(provider, `${window.location.origin}/auth/callback`);
        return;
      }
      if (!email || !password) throw new Error("Enter a valid email and password.");
      const account = await authenticateParentAccount(email, password, mode);
      if (account.confirmationRequired) throw new Error("Confirm your parent email, then return here to access this invitation.");
      await confirmCurrentParentOwnership(sessionId);
      setError("");
      setState("allowed");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Parent authentication failed.");
      setState("required");
    } finally {
      setIsAuthenticating(false);
    }
  }

  if (state === "allowed") return <>{children}</>;
  if (state === "checking") return <section className="grid min-h-[55vh] place-items-center px-4" role="status"><p className="font-bold text-forest">Checking the parent account…</p></section>;

  return <section className="min-h-[65vh] bg-mist px-4 py-12 sm:px-6 sm:py-16"><ParentAuthGate isSubmitting={isAuthenticating} onAuthenticate={authenticate} /><p className="mx-auto mt-5 max-w-xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p></section>;
}
