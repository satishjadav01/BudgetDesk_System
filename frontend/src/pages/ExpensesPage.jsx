import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { dashboardService } from "../api/dashboardService";
import { expenseService } from "../api/expenseService";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { Table } from "../components/common/Table";
import { ExpenseForm } from "../components/forms/ExpenseForm";
import { apiErrorMessage, formatCurrency } from "../utils/formatters";

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

const categoryStyles = {
  Office: "bg-sky-100 text-sky-700 ring-sky-200",
  Travel: "bg-amber-100 text-amber-700 ring-amber-200",
  Software: "bg-violet-100 text-violet-700 ring-violet-200",
  Utilities: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Other: "bg-slate-200 text-slate-700 ring-slate-300",
};

function StatCard({ label, value, description, tone = "default", action }) {
  const tones = {
    default: "from-white to-slate-50 text-slate-900",
    positive: "from-emerald-500 to-emerald-600 text-white",
    negative: "from-rose-500 to-orange-500 text-white",
    dark: "from-slate-900 to-slate-800 text-white",
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br p-[1px] shadow-sm ${
        tone === "default" ? "from-slate-200 to-slate-100" : "from-transparent to-transparent"
      }`}
    >
      <div className={`h-full rounded-[calc(1.5rem-1px)] bg-gradient-to-br p-5 ${tones[tone]}`}>
        <p
          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
            tone === "default" ? "text-slate-500" : "text-white/70"
          }`}
        >
          {label}
        </p>
        <p className="mt-3 text-3xl font-semibold">{value}</p>
        <p className={`mt-2 text-sm ${tone === "default" ? "text-slate-500" : "text-white/80"}`}>{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}

export function ExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    month: searchParams.get("month") || "",
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.month) params.month = filters.month;
      const response = await expenseService.list(params);
      setExpenses(unwrapList(response.data.data));
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not load expenses."));
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await dashboardService.summary();
      setSummary(response.data.data);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not load income summary."));
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters.category, filters.month]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const next = {};
    if (filters.category) next.category = filters.category;
    if (filters.month) next.month = filters.month;
    setSearchParams(next, { replace: true });
  }, [filters.category, filters.month, setSearchParams]);

  const onSave = async (values) => {
    try {
      setSubmitting(true);
      if (selectedExpense) {
        await expenseService.update(selectedExpense.id, values);
        toast.success("Expense updated.");
      } else {
        await expenseService.create(values);
        toast.success("Expense created.");
      }
      setSelectedExpense(null);
      setShowForm(false);
      await Promise.all([fetchExpenses(), fetchSummary()]);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save expense."));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await expenseService.remove(id);
      toast.success("Expense deleted.");
      await Promise.all([fetchExpenses(), fetchSummary()]);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete expense."));
    }
  };

  const filteredExpenseTotal = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );

  const averageExpense = useMemo(() => {
    if (!expenses.length) return 0;
    return filteredExpenseTotal / expenses.length;
  }, [expenses, filteredExpenseTotal]);

  const monthLabel = useMemo(() => {
    if (!filters.month) return "All months";
    const parsed = Number(filters.month);
    if (!parsed || parsed < 1 || parsed > 12) return "Custom month";
    return new Date(new Date().getFullYear(), parsed - 1, 1).toLocaleString("en-IN", { month: "long" });
  }, [filters.month]);

  const columns = [
    { key: "title", header: "Title" },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
            categoryStyles[row.category] || categoryStyles.Other
          }`}
        >
          {row.category}
        </span>
      ),
    },
    { key: "expense_date", header: "Date" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => <span className="font-semibold text-rose-600">{formatCurrency(row.amount)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-brand-700 hover:underline"
            onClick={() => {
              setSelectedExpense(row);
              setShowForm(true);
            }}
          >
            Edit
          </button>
          <button type="button" className="text-sm font-semibold text-rose-600 hover:underline" onClick={() => onDelete(row.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.24),_transparent_28%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Expense command</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
              Stay on top of spending while keeping total income in view.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Track every outgoing payment, compare it with incoming revenue, and keep cash flow decisions grounded in
              live numbers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                onClick={() => {
                  setSelectedExpense(null);
                  setShowForm((prev) => !prev);
                }}
              >
                {showForm ? "Close Expense Form" : "Add Expense"}
              </button>
              <Link
                to="/invoices"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Income
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Current focus</p>
              <p className="mt-3 text-2xl font-semibold">{monthLabel}</p>
              <p className="mt-2 text-sm text-slate-300">
                {filters.category ? `${filters.category} expenses only.` : "Showing every category in your expense log."}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">Total Income</p>
              <p className="mt-3 text-3xl font-semibold">
                {summaryLoading ? "Loading..." : formatCurrency(summary?.total_income)}
              </p>
              <p className="mt-2 text-sm text-emerald-50/80">Pulled from invoices so expenses always have revenue context.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible Expenses"
          value={formatCurrency(filteredExpenseTotal)}
          description="Total of the rows currently visible in this filtered list."
          tone="negative"
        />
        <StatCard
          label="Total Income"
          value={summaryLoading ? "Loading..." : formatCurrency(summary?.total_income)}
          description="Overall income tracked from invoices across the workspace."
          tone="positive"
          action={
            <Link
              to="/invoices"
              className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Open invoices
            </Link>
          }
        />
        <StatCard
          label="Net Balance"
          value={summaryLoading ? "Loading..." : formatCurrency(summary?.profit)}
          description="Profit after total expenses are subtracted from total income."
          tone="dark"
        />
        <StatCard
          label="Average Expense"
          value={formatCurrency(averageExpense)}
          description={`${expenses.length} record${expenses.length === 1 ? "" : "s"} in the current view.`}
        />
      </section>

      <section className="card p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Filters</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Shape the expense view</h2>
            <p className="mt-1 text-sm text-slate-500">
              Narrow the list by category or month, then compare it against total income.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block min-w-44">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
              <select
                className="input"
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="">All</option>
                <option value="Office">Office</option>
                <option value="Travel">Travel</option>
                <option value="Software">Software</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block min-w-32">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Month</span>
              <input
                className="input"
                type="number"
                min="1"
                max="12"
                placeholder="1-12"
                value={filters.month}
                onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
              />
            </label>
            <button type="button" className="btn-secondary" onClick={() => setFilters({ category: "", month: "" })}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {showForm ? (
        <ExpenseForm
          initialValues={selectedExpense}
          onSubmit={onSave}
          submitting={submitting}
          onCancel={() => {
            setSelectedExpense(null);
            setShowForm(false);
          }}
        />
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Expense ledger</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Recent spend activity</h2>
          </div>
          <div className="surface-card px-4 py-3 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{expenses.length}</span> expense
            {expenses.length === 1 ? "" : "s"} for <span className="font-semibold text-slate-900">{monthLabel}</span>
          </div>
        </div>

        {loading ? (
          <Loader text="Loading expenses..." />
        ) : expenses.length ? (
          <Table columns={columns} rows={expenses} rowKey="id" />
        ) : (
          <EmptyState title="No expenses yet" message="Start recording expenses to track your cash flow." />
        )}
      </section>
    </div>
  );
}
