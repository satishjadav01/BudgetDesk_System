export function Loader({ text = "Loading..." }) {
  return (
    <div className="card p-10">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{text}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Preparing the latest view</p>
        </div>
      </div>
    </div>
  );
}
