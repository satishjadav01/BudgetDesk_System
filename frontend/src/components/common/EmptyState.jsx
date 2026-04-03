export function EmptyState({ title, message, action }) {
  return (
    <div className="card p-8 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
        0
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Nothing here yet</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
