// Short, readable dtype labels: int64 → int, object → str, datetime64[ns] → datetime
function typeLabel(dtype) {
  if (!dtype) return "?";
  return dtype.replace(/\[.*\]/, "").replace("64", "").replace("object", "str");
}

export default function ColumnList({ columns = [], search = "" }) {
  const filtered = columns.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-fg-subtle">
        {search ? "No columns match your search" : "No columns to display"}
      </p>
    );
  }

  return (
    <ul className="max-h-72 divide-y divide-line overflow-y-auto">
      {filtered.map((col) => (
        <li key={col.name} className="flex items-center justify-between gap-2 py-1.5">
          <span className="min-w-0 truncate font-mono text-xs text-fg" title={col.name}>{col.name}</span>
          <span className="flex shrink-0 items-center gap-2">
            {col.null_count > 0 && (
              <span className="text-2xs tabular-nums text-warning" title={`${col.null_count} missing values`}>
                {col.null_count.toLocaleString()} missing
              </span>
            )}
            <span className="badge-muted font-mono">{typeLabel(col.dtype)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
