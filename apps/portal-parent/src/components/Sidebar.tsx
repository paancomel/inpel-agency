import { ShieldCheck, Sparkles } from "lucide-react";

const MENTIONS = [
  { label: "Career-ready", value: 78, color: "metric-teal" },
  { label: "Supportive lecturers", value: 71, color: "metric-mint" },
  { label: "Tuition pressure", value: 42, color: "metric-coral" },
];

export function Sidebar() {
  return (
    <aside className="space-y-4" aria-label="University insights">
      <section className="rounded-[24px] border border-sea-fog bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-tidal-teal">What students mention</p>
        <h2 className="mt-2 font-display text-xl">The signal behind the score</h2>
        <dl className="mt-5 space-y-4">
          {MENTIONS.map((mention) => <div key={mention.label}><div className="mb-1.5 flex justify-between text-sm"><dt className="font-bold">{mention.label}</dt><dd>{mention.value}%</dd></div><progress className={`metric-progress ${mention.color}`} value={mention.value} max={100} aria-label={`${mention.label}: ${mention.value}%`} /></div>)}
        </dl>
      </section>

      <section className="rounded-[24px] border border-sea-fog bg-ice-tint p-5">
        <div className="flex gap-3"><ShieldCheck className="shrink-0 text-tidal-teal" size={21} aria-hidden="true" /><div><h2 className="font-bold">Candid, not careless</h2><p className="mt-1 text-sm leading-relaxed text-slate-600">Identity is removed from anonymous submissions before anything is stored.</p></div></div>
        <div className="mt-4 flex gap-3 border-t border-sea-fog pt-4"><Sparkles className="shrink-0 text-tidal-teal" size={21} aria-hidden="true" /><p className="text-sm leading-relaxed text-slate-600">Reviews are student perspectives, not university endorsements.</p></div>
      </section>
    </aside>
  );
}
