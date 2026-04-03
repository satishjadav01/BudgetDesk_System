import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", caption: "Live business health", index: "01" },
  { to: "/invoices", label: "Invoices", caption: "Track billing and cash-in", index: "02" },
  { to: "/expenses", label: "Expenses", caption: "Control outgoing spend", index: "03" },
];

export function Sidebar() {
  return (
    <aside className="sticky top-4 hidden h-fit w-72 shrink-0 md:block">
      <div className="card overflow-hidden p-5">
        <div className="rounded-[24px] bg-slate-950 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Workspace</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">Finance control center</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            One clean place to monitor revenue, spending, and the decisions that shape your monthly outcome.
          </p>
        </div>

        <nav className="mt-5 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-[22px] px-4 py-3 transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-semibold ${
                      isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.index}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`mt-1 block text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>
                      {item.caption}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="surface-card mt-5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Daily goal</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">Keep invoicing and spend review in the same rhythm.</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Faster updates here make the dashboard much more useful when you need a quick answer.
          </p>
        </div>
      </div>
    </aside>
  );
}
