import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { dashboardService } from "../api/dashboardService";
import { MonthlyOverviewChart } from "../components/charts/MonthlyOverviewChart";
import { Loader } from "../components/common/Loader";
import { apiErrorMessage, formatCurrency } from "../utils/formatters";

function MetricCard({ label, value, description, accent = "slate" }) {
  const accentStyles = {
    teal: "bg-teal-500/15 text-teal-100",
    orange: "bg-orange-500/15 text-orange-100",
    slate: "bg-white/10 text-white",
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${accentStyles[accent]}`}>
        {label}
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const [summaryResponse, monthlyResponse] = await Promise.all([
          dashboardService.summary(),
          dashboardService.monthly(year),
        ]);
        setSummary(summaryResponse.data.data);
        setMonthly(monthlyResponse.data.data);
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not load dashboard."));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const currentYear = new Date().getFullYear();
  const summaryCards = [
    {
      label: "Income",
      value: formatCurrency(summary?.total_income),
      description: "All invoice value currently recorded in the workspace.",
      accent: "teal",
    },
    {
      label: "Expenses",
      value: formatCurrency(summary?.total_expenses),
      description: "Combined outgoing costs captured across categories.",
      accent: "orange",
    },
    {
      label: "Profit",
      value: formatCurrency(summary?.profit),
      description: "Live balance after expenses are subtracted from income.",
      accent: "slate",
    },
  ];

  const strongestMonth = monthly.reduce((best, row) => {
    if (!best) return row;
    const bestProfit = Number(best.income) - Number(best.expenses);
    const rowProfit = Number(row.income) - Number(row.expenses);
    return rowProfit > bestProfit ? row : best;
  }, null);

  const strongestMonthLabel = strongestMonth
    ? new Date(currentYear, strongestMonth.month - 1, 1).toLocaleString("en-IN", { month: "long" })
    : "No data yet";

  const expenseRatio =
    Number(summary?.total_income) > 0
      ? `${Math.round((Number(summary?.total_expenses || 0) / Number(summary?.total_income || 1)) * 100)}%`
      : "0%";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.2),_transparent_30%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,1fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Executive overview</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              Keep revenue, costs, and momentum visible in one clean snapshot.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Your finance workspace now highlights the big picture first, so it is easier to spot profit shifts and
              act quickly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/invoices" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Review invoices
              </Link>
              <Link
                to="/expenses"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Manage expenses
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {summaryCards.map((card) => (
              <MetricCard
                key={card.label}
                label={card.label}
                value={card.value}
                description={card.description}
                accent={card.accent}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <MonthlyOverviewChart data={monthly} />

        <div className="space-y-4">
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Best month</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{strongestMonthLabel}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Highest net result in {currentYear} based on the monthly income and expense data currently available.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Expense ratio</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{expenseRatio}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Share of income being used by expenses. Lower ratios usually leave more room for profit.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Next move</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Keep both sides updated</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The dashboard becomes much more valuable when invoices and expenses are entered regularly through the
              month.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
