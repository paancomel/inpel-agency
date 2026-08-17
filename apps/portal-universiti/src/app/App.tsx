import { lazy, Suspense } from "react";
import { CookieConsent, LegalDocument } from "@repo/ui";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppFrame } from "../components/AppFrame";
import { LanguageProvider } from "../lib/language";
import { ParentPortal } from "../routes/ParentPortal";
import privacyPolicy from "../../../../docs/legal/PRIVACY_POLICY.md?raw";
import privacyPolicyMs from "../../../../docs/legal/PRIVACY_POLICY_MS.md?raw";
import terms from "../../../../docs/legal/TERMS_AND_CONDITIONS.md?raw";

const EmailNotification = lazy(async () => ({ default: (await import("../routes/EmailNotification")).EmailNotification }));
const StudentPortal = lazy(async () => ({ default: (await import("../routes/StudentPortal")).StudentPortal }));
const AuthCallback = lazy(async () => ({ default: (await import("../routes/AuthCallback")).AuthCallback }));
const ParentHandoff = lazy(async () => ({ default: (await import("../routes/ParentHandoff")).ParentHandoff }));
const Checkout = lazy(async () => ({ default: (await import("../routes/Checkout")).Checkout }));
const Results = lazy(async () => ({ default: (await import("../routes/Results")).Results }));
const ScholarshipGuide = lazy(async () => ({ default: (await import("../routes/ScholarshipGuide")).ScholarshipGuide }));

function AppLayout() {
  return <AppFrame />;
}

export function PortalRoutes() {
  return (
    <LanguageProvider>
    <Suspense fallback={<div className="grid min-h-[65vh] place-items-center" role="status"><p className="font-bold text-forest">Loading your next step…</p></div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<ParentPortal />} />
          <Route path="email-notification/:id" element={<EmailNotification />} />
          <Route path="student/:id" element={<StudentPortal />} />
          <Route path="auth/callback" element={<AuthCallback />} />
          <Route path="parent/:id" element={<ParentHandoff />} />
          <Route path="checkout/:id" element={<Checkout />} />
          <Route path="results/:id" element={<Results />} />
          <Route path="guide/:guideId" element={<ScholarshipGuide />} />
          <Route path="legal/terms" element={<LegalDocument content={terms} />} />
          <Route path="legal/privacy" element={<LegalDocument content={privacyPolicy} />} />
          <Route path="legal/privacy-ms" element={<LegalDocument content={privacyPolicyMs} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
    </LanguageProvider>
  );
}

export function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <PortalRoutes />
      <CookieConsent />
    </BrowserRouter>
  );
}
