import { NavLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/invoices", label: "Invoices" },
  { to: "/expenses", label: "Expenses" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const initials = user?.full_name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Business cockpit</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Invoice & Expense Tracker</h1>
          <p className="mt-2 text-sm text-slate-500">Review revenue, spending, and profitability from one workspace.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="surface-card flex items-center gap-3 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              {initials || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.full_name || "Workspace user"}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            {todayLabel}
          </div>

          <button type="button" onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-3 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
