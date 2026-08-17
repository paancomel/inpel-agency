import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LEGAL_PATHS } from "./Legal.js";

export const COOKIE_CONSENT_KEY = "inpel_cookie_consent";
export const COOKIE_CONSENT_CHANGED_EVENT = "inpel:cookie-consent-changed";
export const OPTIONAL_TRACKING_CONSENT_GRANTED_EVENT = "consentGranted";
export const OPTIONAL_TRACKING_CONSENT_REVOKED_EVENT = "consentRevoked";

export type CookieConsentChoice = "all" | "essential";
type BannerStatus = "checking" | "visible" | "hidden";

export interface CookieConsentChangedDetail {
  choice: CookieConsentChoice;
  optionalTrackingAllowed: boolean;
}

function isConsentChoice(value: string | null): value is CookieConsentChoice {
  return value === "all" || value === "essential";
}

export function getCookieConsentChoice(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return isConsentChoice(value) ? value : null;
  } catch {
    return null;
  }
}

export function hasOptionalTrackingConsent() {
  return getCookieConsentChoice() === "all";
}

export function setCookieConsentChoice(choice: CookieConsentChoice): boolean {
  if (typeof window === "undefined") return false;
  const previousChoice = getCookieConsentChoice();
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    return false;
  }
  const optionalTrackingAllowed = choice === "all";
  window.dispatchEvent(new CustomEvent<CookieConsentChangedDetail>(COOKIE_CONSENT_CHANGED_EVENT, { detail: { choice, optionalTrackingAllowed } }));
  if (optionalTrackingAllowed) window.dispatchEvent(new Event(OPTIONAL_TRACKING_CONSENT_GRANTED_EVENT));
  else if (previousChoice === "all") window.dispatchEvent(new Event(OPTIONAL_TRACKING_CONSENT_REVOKED_EVENT));
  return true;
}

export function withdrawOptionalTrackingConsent() {
  return setCookieConsentChoice("essential");
}

function subscribeToConsentChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handleChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => { if (event.key === COOKIE_CONSENT_KEY) onStoreChange(); };
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useOptionalTrackingConsent() {
  return useSyncExternalStore(subscribeToConsentChanges, hasOptionalTrackingConsent, () => false);
}

export function OptionalTrackingGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <>{useOptionalTrackingConsent() ? children : fallback}</>;
}

export function CookieConsent() {
  const [status, setStatus] = useState<BannerStatus>("checking");
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const storedConsent = getCookieConsentChoice();
    setChoice(storedConsent);
    setStatus(storedConsent ? "hidden" : "visible");
  }, []);

  function saveChoice(nextChoice: CookieConsentChoice) {
    if (!setCookieConsentChoice(nextChoice)) {
      setStorageError(true);
      return;
    }
    setStorageError(false);
    setChoice(nextChoice);
    setStatus("hidden");
  }

  if (status === "checking") return null;
  if (status === "hidden") return <button className="fixed bottom-4 left-4 z-[2147483646] min-h-11 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-lg" onClick={() => { setStorageError(false); setStatus("visible"); }} type="button">Cookie settings</button>;

  return (
    <aside
      aria-describedby="cookie-consent-description"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-[2147483647] mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl shadow-slate-950/20 sm:p-6"
      role="region"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p id="cookie-consent-description" className="text-sm leading-6 sm:text-base sm:leading-7">
            We use cookies and tracking technologies to improve your browsing experience, show you targeted advertisements (via Meta and TikTok), and analyze our website traffic. By clicking &apos;Accept All&apos;, you consent to our use of cookies.{" "}
            <Link className="font-semibold text-emerald-800 underline decoration-2 underline-offset-4 hover:text-emerald-950" to={LEGAL_PATHS.privacy}>
              Read our Privacy Policy
            </Link>
          </p>
          {choice === "all" ? <p className="mt-2 text-sm text-slate-600">Optional analytics and advertising are enabled. Choose Essential Only to withdraw consent.</p> : null}
          {storageError ? (
            <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
              We couldn&apos;t save your choice. Check your browser storage settings and try again.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 sm:flex-row">
          <button
            className="min-h-11 rounded-lg border border-slate-400 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            onClick={() => saveChoice("essential")}
            type="button"
          >
            Essential Only
          </button>
          <button
            className="min-h-11 rounded-lg border border-emerald-900 bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white transition hover:border-emerald-800 hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
            onClick={() => saveChoice("all")}
            type="button"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
