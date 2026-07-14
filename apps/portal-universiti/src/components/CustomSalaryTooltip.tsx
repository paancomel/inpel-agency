import type { TooltipContentProps } from "recharts";

const currency = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 });

export function CustomSalaryTooltip({ active, label, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return <div className="border border-slate-200 bg-white p-3 text-sm shadow-lg"><p className="font-bold text-forest">Year {label}</p>{payload.map((item) => <p key={item.dataKey?.toString()} className="mt-1" style={{ color: item.color }}>{item.name}: {currency.format(Number(item.value))}</p>)}</div>;
}
