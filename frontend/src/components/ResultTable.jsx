// A column is numeric if every non-null value in it is a number — those are
// right-aligned so digits line up (with tabular figures from .data-table).
function isNumericColumn(rows, col) {
  const values = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined);
  return values.length > 0 && values.every((v) => typeof v === "number");
}

function formatValue(val) {
  if (val === null || val === undefined) return <span className="italic text-fg-subtle">null</span>;
  if (typeof val === "number") return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (typeof val === "boolean") return String(val);
  return String(val);
}

export default function ResultTable({ columns, rows }) {
  if (!columns || !rows || rows.length === 0) return null;
  const numeric = Object.fromEntries(columns.map((c) => [c, isNumericColumn(rows, c)]));

  return (
    <table className="data-table min-w-full">
      <thead>
        <tr>
          <th className="w-10 text-right">#</th>
          {columns.map((col) => (
            <th key={col} className={numeric[col] ? "text-right" : ""}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td className="text-right text-fg-subtle">{i + 1}</td>
            {columns.map((col) => (
              <td key={col} className={`whitespace-nowrap ${numeric[col] ? "text-right" : ""}`}>
                {formatValue(row[col])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
