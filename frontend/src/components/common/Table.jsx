export function Table({ columns, rows, rowKey }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/80">
            {rows.map((row) => (
              <tr key={row[rowKey]} className="border-t border-slate-100/80 transition hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 align-top text-sm text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
