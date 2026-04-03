import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "../../utils/formatters";

export function MonthlyOverviewChart({ data }) {
  const chartData = data.map((row) => ({
    month: new Date(new Date().getFullYear(), row.month - 1, 1).toLocaleString("en-US", { month: "short" }),
    income: Number(row.income),
    expenses: Number(row.expenses),
  }));

  if (!chartData.length) {
    return (
      <div className="card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Monthly activity</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">Income vs expenses</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add invoices and expenses to unlock the monthly comparison chart.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Monthly activity</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">Income vs expenses</h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis axisLine={false} dataKey="month" tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value, name) => [formatCurrency(value), name === "income" ? "Income" : "Expenses"]}
              contentStyle={{
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 18px 48px -24px rgba(15, 23, 42, 0.35)",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#0891b2" radius={[12, 12, 0, 0]} />
            <Bar dataKey="expenses" fill="#f97316" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
