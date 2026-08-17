import { CheckCircle2, Circle } from "lucide-react";

import { getWizardSteps } from "../lib/validation";
import type { PortalDraft } from "../types/portal";

export function WizardProgress({ draft }: { draft: PortalDraft }) {
  const steps = getWizardSteps(draft);
  const completeCount = steps.filter((step) => step.complete).length;

  return (
    <section aria-label="Institution completion progress" className="border-b border-frost px-4 py-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Profile completion</p>
        <span className="text-xs font-bold text-navy">{completeCount}/7</span>
      </div>
      <div aria-hidden="true" className="mt-3 h-1.5 bg-mist">
        <div className="h-full bg-coral transition-[width]" style={{ width: `${(completeCount / steps.length) * 100}%` }} />
      </div>
      <ol className="mt-4 space-y-2" aria-label="Required profile components">
        {steps.map((step) => (
          <li className="flex items-center gap-2 text-xs" key={step.id}>
            {step.complete ? <CheckCircle2 aria-hidden="true" className="text-emerald-600" size={15} /> : <Circle aria-hidden="true" className="text-slate-300" size={15} />}
            <span className={step.complete ? "font-medium text-slate-700" : "text-slate-500"}>{step.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
