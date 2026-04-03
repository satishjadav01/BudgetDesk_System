export function Select({ label, error, children, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span> : null}
      <select className="input" {...props}>
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
