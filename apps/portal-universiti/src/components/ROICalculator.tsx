import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";

import { calculateRoi } from "../lib/recommendations";

interface ROICalculatorProps {
  initialTuition: number;
  initialLivingCost: number;
}

const currency = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 });

export function ROICalculator({ initialTuition, initialLivingCost }: ROICalculatorProps) {
  const [tuition, setTuition] = useState(initialTuition);
  const [livingCost, setLivingCost] = useState(initialLivingCost);
  const [salary, setSalary] = useState(42_000);
  const result = useMemo(() => calculateRoi({ annualTuition: tuition, annualLivingCost: livingCost, years: 4, startingSalary: salary }), [livingCost, salary, tuition]);

  return (
    <section className="border border-slate-200 bg-white p-6" aria-labelledby="roi-title">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Scenario planner</p><h2 id="roi-title" className="mt-1 font-display text-3xl font-bold text-forest">ROI calculator</h2></div><span className="grid size-10 place-items-center bg-mint text-leaf"><Calculator className="size-5" /></span></div>
      <div className="mt-6 space-y-5">
        <RangeField label="Annual tuition" value={tuition} min={18_000} max={80_000} step={1_000} onChange={setTuition} />
        <RangeField label="Annual living cost" value={livingCost} min={8_000} max={40_000} step={1_000} onChange={setLivingCost} />
        <RangeField label="Starting annual salary" value={salary} min={30_000} max={84_000} step={1_000} onChange={setSalary} />
      </div>
      <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 text-center">
        <div><dt className="text-xs text-slate-500">4-year cost</dt><dd className="mt-1 font-display text-xl font-bold text-forest">{currency.format(result.totalCost)}</dd></div>
        <div><dt className="text-xs text-slate-500">Payback</dt><dd className="mt-1 font-display text-xl font-bold text-forest">{result.paybackYears} yrs</dd></div>
        <div><dt className="text-xs text-slate-500">5-year earnings</dt><dd className="mt-1 font-display text-xl font-bold text-forest">{currency.format(result.fiveYearEarnings)}</dd></div>
      </dl>
      <p className="mt-4 text-xs leading-5 text-slate-500">Illustrative only. Assumes four study years, moderate salary growth and 35% of gross salary available for education-cost recovery.</p>
    </section>
  );
}

function RangeField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="flex items-center justify-between text-sm font-bold text-forest"><span>{label}</span><output>{currency.format(value)}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-leaf" /></label>;
}
