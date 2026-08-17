import { CookieConsent, LegalDocument } from "@repo/ui";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { DashboardLayout } from "../components/DashboardLayout";
import { LoginView } from "../components/LoginView";
import { CourseFormPage } from "../routes/CourseFormPage";
import { CoursesPage } from "../routes/CoursesPage";
import { GlobalProfilePage } from "../routes/GlobalProfilePage";
import { ImportPage } from "../routes/ImportPage";
import { ReviewPage } from "../routes/ReviewPage";
import { SuccessPage } from "../routes/SuccessPage";
import { PortalProvider } from "../state/PortalContext";
import { usePortal } from "../state/usePortal";
import privacyPolicy from "../../../../docs/legal/PRIVACY_POLICY.md?raw";
import privacyPolicyMs from "../../../../docs/legal/PRIVACY_POLICY_MS.md?raw";
import terms from "../../../../docs/legal/TERMS_AND_CONDITIONS.md?raw";

function LoginRoute() {
  const { isAuthenticated, isAuthResolved, setAuthenticated } = usePortal();
  const navigate = useNavigate();

  if (!isAuthResolved) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard/global-profile" />;
  }

  return (
    <LoginView
      onAuthenticated={() => {
        setAuthenticated(true);
        navigate("/dashboard/global-profile", { replace: true });
      }}
    />
  );
}

function RequireAuthentication() {
  const { isAuthenticated, isAuthResolved } = usePortal();
  if (!isAuthResolved) return <AuthLoading />;
  return isAuthenticated ? <DashboardLayout /> : <Navigate replace to="/login" />;
}

function AuthLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas" aria-busy="true">
      <p className="text-sm font-semibold text-slate-500" role="status">Verifying institutional access…</p>
    </main>
  );
}

export function AppRoutes() {
  const { isAuthenticated } = usePortal();

  return (
    <Routes>
      <Route element={<LoginRoute />} path="/login" />
      <Route element={<LegalDocument content={terms} />} path="/legal/terms" />
      <Route element={<LegalDocument content={privacyPolicy} />} path="/legal/privacy" />
      <Route element={<LegalDocument content={privacyPolicyMs} />} path="/legal/privacy-ms" />
      <Route element={<RequireAuthentication />} path="/dashboard">
        <Route element={<Navigate replace to="/dashboard/global-profile" />} index />
        <Route element={<GlobalProfilePage />} path="global-profile" />
        <Route element={<ImportPage />} path="import" />
        <Route element={<CoursesPage />} path="courses" />
        <Route element={<CourseFormPage />} path="courses/form" />
        <Route element={<ReviewPage />} path="review" />
        <Route element={<SuccessPage />} path="success" />
      </Route>
      <Route element={<Navigate replace to={isAuthenticated ? "/dashboard/global-profile" : "/login"} />} path="*" />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <PortalProvider>
        <AppRoutes />
      </PortalProvider>
      <CookieConsent />
    </BrowserRouter>
  );
}
