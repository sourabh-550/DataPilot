export default function ResultTable({ columns, rows }) {
  if (!columns || !rows || rows.length === 0) return null;

  const formatValue = (val) => {
    if (val === null || val === undefined) return <span className="text-zinc-600">null</span>;
    if (typeof val === "number") return <span className="text-cyan-400 font-mono">{val.toLocaleString()}</span>;
    if (typeof val === "boolean") return <span className={val ? "text-emerald-400" : "text-red-400"}>{String(val)}</span>;
    const str = String(val);
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) return <span className="text-amber-400 font-mono text-xs">{str}</span>;
    return str;
  };

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="data-table min-w-full">
        <thead>
          <tr>
            <th className="w-10 text-center">#</th>
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="group">
              <td className="text-center text-zinc-600 text-xs font-mono">{i + 1}</td>
              {columns.map((col) => (
                <td key={col} className="whitespace-nowrap text-xs font-mono">
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 flex items-center justify-between border-t border-zinc-800/60">
        <span className="text-xs text-zinc-500">
          {rows.length} row{rows.length !== 1 ? "s" : ""} returned
        </span>
        <div className="flex gap-2">
          <span className="badge-cyan text-[10px]">{columns.length} columns</span>
        </div>
      </div>
    </div>
  );
}