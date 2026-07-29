import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const COOKIE_CONSENT_KEY = "inpel_cookie_consent";

type ConsentChoice = "all" | "essential";
type BannerStatus = "checking" | "visible" | "hidden";

function isConsentChoice(value: string | null): value is ConsentChoice {
  return value === "all" || value === "essential";
}

export function CookieConsent() {
  const [status, setStatus] = useState<BannerStatus>("checking");
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      setStatus(isConsentChoice(storedConsent) ? "hidden" : "visible");
    } catch {
      // If storage is unavailable, tracking remains unapproved and the user is
      // asked again rather than treating an unreadable value as consent.
      setStatus("visible");
    }
  }, []);

  function saveChoice(choice: ConsentChoice) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    } catch {
      setStorageError(true);
      return;
    }

    setStorageError(false);
    setStatus("hidden");

    if (choice === "all") {
      window.dispatchEvent(new Event("consentGranted"));
    }
  }

  if (status !== "visible") return null;

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
            <Link className="font-semibold text-emerald-800 underline decoration-2 underline-offset-4 hover:text-emerald-950" to="/legal">
              Read our Privacy Policy
            </Link>
          </p>
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
