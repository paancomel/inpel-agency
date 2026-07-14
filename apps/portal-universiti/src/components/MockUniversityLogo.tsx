import { GraduationCap } from "lucide-react";

export function MockUniversityLogo() {
  return (
    <div className="flex items-center gap-3" aria-label="INPEL University Match">
      <span className="grid size-10 place-items-center bg-forest text-white">
        <GraduationCap aria-hidden="true" className="size-5" />
      </span>
      <span>
        <span className="block font-display text-xl leading-none font-bold tracking-tight text-forest">INPEL</span>
        <span className="mt-1 block text-[0.62rem] leading-none font-bold tracking-[0.2em] text-leaf uppercase">
          University Match
        </span>
      </span>
    </div>
  );
}
