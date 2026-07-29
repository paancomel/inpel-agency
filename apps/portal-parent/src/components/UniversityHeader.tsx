import { BadgeCheck, MapPin, Users } from "lucide-react";

interface UniversityHeaderProps { mode: "connected" | "local"; }

export function UniversityHeader({ mode }: UniversityHeaderProps) {
  return (
    <header id="top" className="dot-field border-b border-sea-fog bg-midnight-harbor text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:py-14">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-xl bg-white font-display text-2xl text-midnight-harbor">T</div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <BadgeCheck size={14} aria-hidden="true" /> Verified university
            </span>
          </div>
          <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl">Taylor&apos;s University</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-2"><MapPin size={16} aria-hidden="true" /> Subang Jaya, Selangor</span>
            <span className="inline-flex items-center gap-2"><Users size={16} aria-hidden="true" /> 612 student voices</span>
          </div>
        </div>
        <div className="flex items-end gap-8 border-l-0 border-white/20 lg:border-l lg:pl-8">
          <div><p className="text-xs font-bold uppercase tracking-widest text-mint-signal">Student score</p><p className="mt-1 font-display text-3xl">4.4 / 5</p></div>
          <div><p className="text-xs font-bold uppercase tracking-widest text-mint-signal">Data mode</p><p className="mt-1 text-sm font-bold">{mode === "connected" ? "Live sync" : "Device preview"}</p></div>
        </div>
      </div>
    </header>
  );
}
