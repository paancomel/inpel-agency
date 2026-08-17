import { Outlet } from "react-router-dom";
import { LegalLinks } from "@repo/ui";

import { t, useLanguage } from "../lib/language";
import { MockUniversityLogo } from "./MockUniversityLogo";

export function AppFrame() {
  const { language, setLanguage } = useLanguage();
  const marqueeItems = [
    t(language, { ms: "Padanan ikut keperluan sebenar", en: "Matches based on what matters", ta: "உங்களுக்கு முக்கியமானவற்றை அடிப்படையாகக் கொண்ட பொருத்தங்கள்", "zh-CN": "根据实际需求匹配" }),
    t(language, { ms: "Panduan biasiswa yang jelas", en: "Clear scholarship guidance", ta: "தெளிவான உதவித்தொகை வழிகாட்டல்", "zh-CN": "清晰的奖学金指南" }),
    t(language, { ms: "Rancang langkah selepas belajar", en: "Plan what comes after study", ta: "படிப்புக்குப் பின் அடுத்த படியைத் திட்டமிடுங்கள்", "zh-CN": "规划毕业后的下一步" }),
    t(language, { ms: "Dibina untuk keluarga di Malaysia", en: "Made for Malaysian families", ta: "மலேசியக் குடும்பங்களுக்காக உருவாக்கப்பட்டது", "zh-CN": "为马来西亚家庭打造" }),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 bg-forest px-4 py-2 text-sm font-bold text-white focus:translate-y-0"
      >
        {t(language, { ms: "Terus ke kandungan", en: "Skip to content", ta: "உள்ளடக்கத்திற்குச் செல்லவும்", "zh-CN": "跳至内容" })}
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <MockUniversityLogo />
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600" htmlFor="language">
            <span className="hidden sm:inline">{t(language, { ms: "Bahasa", en: "Language", ta: "மொழி", "zh-CN": "语言" })}</span>
            <select
              id="language"
              aria-label={t(language, { ms: "Pilih bahasa", en: "Choose language", ta: "மொழியைத் தேர்ந்தெடுக்கவும்", "zh-CN": "选择语言" })}
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              className="border border-slate-300 bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="ms">Bahasa Melayu</option>
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="zh-CN">简体中文</option>
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
        <p>{t(language, { ms: "InPel bantu buat pilihan. Semak yuran dan syarat biasiswa terus dengan institusi.", en: "INPEL helps you make a choice. Check fees and scholarship terms directly with each institution.", ta: "INPEL தேர்வு செய்ய உதவுகிறது. கட்டணங்களையும் உதவித்தொகை விதிமுறைகளையும் நிறுவனத்திடம் நேரடியாகச் சரிபார்க்கவும்.", "zh-CN": "InPel 帮助您做选择。请直接向院校核实学费和奖学金条款。" })}</p>
        <LegalLinks className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 font-semibold text-forest underline underline-offset-4" />
      </footer>
    </div>
  );
}
