import { TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CustomSalaryTooltip } from "./CustomSalaryTooltip";

const salaryData = [
  { year: 1, engineering: 42_000, analytics: 45_000, product: 43_000 },
  { year: 2, engineering: 48_000, analytics: 51_000, product: 50_000 },
  { year: 3, engineering: 56_000, analytics: 59_000, product: 60_000 },
  { year: 4, engineering: 65_000, analytics: 68_000, product: 72_000 },
  { year: 5, engineering: 76_000, analytics: 79_000, product: 86_000 },
];

export function CareerProgressionDashboard() {
  return (
    <section className="border border-slate-200 bg-white p-6" aria-labelledby="career-title">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.14em] text-leaf uppercase">Career outlook</p><h2 id="career-title" className="mt-1 font-display text-3xl font-bold text-forest">Five-year salary paths</h2></div><span className="grid size-10 place-items-center bg-mint text-leaf"><TrendingUp className="size-5" /></span></div>
      <div className="mt-6 h-80" role="img" aria-label="Line chart comparing five-year salary paths for engineering, analytics and product careers">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salaryData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4e0" />
            <XAxis dataKey="year" tickFormatter={(year) => `Y${String(year)}`} />
            <YAxis tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} width={46} />
            <Tooltip content={(props) => <CustomSalaryTooltip {...props} />} />
            <Legend />
            <Line type="monotone" dataKey="engineering" name="Engineering" stroke="#247158" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="analytics" name="Analytics" stroke="#3973a4" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="product" name="Product" stroke="#d98b3d" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only"><caption>Projected salary by career and year</caption><thead><tr><th>Year</th><th>Engineering</th><th>Analytics</th><th>Product</th></tr></thead><tbody>{salaryData.map((row) => <tr key={row.year}><td>{row.year}</td><td>{row.engineering}</td><td>{row.analytics}</td><td>{row.product}</td></tr>)}</tbody></table>
    </section>
  );
}
