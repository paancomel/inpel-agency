import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { MockUniversityLogo } from "./MockUniversityLogo";

export type Language = "en" | "ms";

interface AppFrameProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const marqueeItems = [
  "Evidence-led matching",
  "Scholarship guidance",
  "Career return planning",
  "Built for Malaysian families",
];

export function AppFrame({ language, onLanguageChange }: AppFrameProps) {
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 bg-forest px-4 py-2 text-sm font-bold text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <MockUniversityLogo />
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600" htmlFor="language">
            <span className="hidden sm:inline">Language</span>
            <select
              id="language"
              aria-label="Language"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as Language)}
              className="border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="en">English</option>
              <option value="ms">Bahasa Melayu</option>
            </select>
          </label>
        </div>
        <div className="overflow-hidden border-t border-emerald-950/10 bg-forest py-2 text-white">
          <div className="marquee-track flex min-w-max gap-10 text-[0.68rem] font-bold tracking-[0.16em] uppercase" aria-hidden="true">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-10">
                {item}<span className="text-sun">✦</span>
              </span>
            ))}
          </div>
        </div>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        INPEL is a decision-support experience. Verify fees and scholarship terms with each institution.
      </footer>
    </div>
  );
}
