import { lazy, Suspense, useState } from "react";
import { CookieConsent } from "@repo/ui";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppFrame, type Language } from "../components/AppFrame";
import { ParentPortal } from "../routes/ParentPortal";

const EmailNotification = lazy(async () => ({ default: (await import("../routes/EmailNotification")).EmailNotification }));
const StudentPortal = lazy(async () => ({ default: (await import("../routes/StudentPortal")).StudentPortal }));
const AuthCallback = lazy(async () => ({ default: (await import("../routes/AuthCallback")).AuthCallback }));
const ParentHandoff = lazy(async () => ({ default: (await import("../routes/ParentHandoff")).ParentHandoff }));
const Checkout = lazy(async () => ({ default: (await import("../routes/Checkout")).Checkout }));
const Results = lazy(async () => ({ default: (await import("../routes/Results")).Results }));
const ScholarshipGuide = lazy(async () => ({ default: (await import("../routes/ScholarshipGuide")).ScholarshipGuide }));

function AppLayout() {
  const [language, setLanguage] = useState<Language>("en");
  return <AppFrame language={language} onLanguageChange={setLanguage} />;
}

export function PortalRoutes() {
  return (
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
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
