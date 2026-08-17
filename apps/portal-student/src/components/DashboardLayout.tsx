import {
  BookOpenText,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LegalLinks } from "@repo/ui";

import { usePortal } from "../state/usePortal";
import { WizardProgress } from "./WizardProgress";

const navigation = [
  { label: "Global profile", to: "/dashboard/global-profile", icon: Building2 },
  { label: "Programmes", to: "/dashboard/courses", icon: BookOpenText },
  { label: "Import data", to: "/dashboard/import", icon: FileUp },
  { label: "Review and publish", to: "/dashboard/review", icon: ClipboardCheck },
] as const;

function getPageTitle(pathname: string): string {
  if (pathname.includes("courses/form")) return "Programme editor";
  if (pathname.includes("courses")) return "Programmes";
  if (pathname.includes("import")) return "Import data";
  if (pathname.includes("review")) return "Review and publish";
  if (pathname.includes("success")) return "Publishing complete";
  return "Global profile";
}

export function DashboardLayout() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { draft, signOut } = usePortal();
  const location = useLocation();
  const formattedSavedAt = new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(draft.updatedAt));

  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <button
        aria-controls="portal-sidebar"
        aria-expanded={isMenuOpen}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center border border-slate-200 bg-white shadow-sm lg:hidden"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span className="sr-only">Toggle navigation</span>
        {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
      </button>

      {isMenuOpen ? (
        <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-navy/30 lg:hidden" onClick={() => setMenuOpen(false)} type="button" />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-frost bg-white transition-transform lg:translate-x-0 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        id="portal-sidebar"
      >
        <div className="flex h-20 items-center gap-3 border-b border-frost px-6">
          <span className="grid h-10 w-10 place-items-center bg-coral text-white"><Building2 aria-hidden="true" size={21} /></span>
          <div>
            <p className="font-bold tracking-[0.16em] text-navy">INPELER</p>
            <p className="text-xs text-slate-500">Institution portal</p>
          </div>
        </div>
        <nav aria-label="Dashboard" className="flex-1 space-y-1 p-4">
          {navigation.map(({ icon: Icon, label, to }) => (
            <NavLink
              className={({ isActive }) => `flex items-center gap-3 px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-navy text-white" : "text-slate-600 hover:bg-mist hover:text-navy"}`}
              key={to}
              onClick={() => setMenuOpen(false)}
              to={to}
            >
              <Icon aria-hidden="true" size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <WizardProgress draft={draft} />
        <div className="border-t border-frost p-4">
          <button className="flex w-full items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-mist hover:text-navy" onClick={() => void signOut()} type="button">
            <LogOut aria-hidden="true" size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-frost bg-white px-5 pl-16 sm:px-8 sm:pl-16 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
            <h1 className="mt-1 text-lg font-bold text-navy">{getPageTitle(location.pathname)}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CheckCircle2 aria-hidden="true" className="text-emerald-600" size={16} />
            <span className="hidden sm:inline">Draft auto-saved at </span>{formattedSavedAt}
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><Outlet /></main>
        <footer className="border-t border-frost bg-white px-5 py-6 sm:px-8 lg:px-10"><LegalLinks className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-navy underline underline-offset-4" /></footer>
      </div>
    </div>
  );
}
