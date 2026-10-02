import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { SessionLoading, SessionError } from "../components/SessionStatus";
import { useSessionData, sessionPath } from "../hooks/useSessionData";
import { ChevronLeft, MessageSquare, Search as SearchIcon } from "lucide-react";

const ROWS_PER_PAGE = 10;

function ColumnTable({ summary }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  if (!summary?.columns?.length) return null;

  const columns = summary.columns;
  const filteredCols = columns.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCols.length / ROWS_PER_PAGE);
  const pageCols = filteredCols.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const rowCount = summary.row_count || 0;

  return (
    <section className="card min-w-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <h3 className="text-sm font-semibold text-fg">Columns</h3>
        <span className="text-xs tabular-nums text-fg-subtle">{columns.length}</span>
        <div className="relative ml-auto w-full sm:w-56">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter columns"
            className="input-field h-8 py-1 pl-8 text-sm"
            aria-label="Filter columns"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th className="text-right">Missing</th>
              <th>Sample values</th>
            </tr>
          </thead>
          <tbody>
            {pageCols.map((col) => {
              const missing = col.null_count ?? 0;
              const pct = rowCount ? (missing / rowCount) * 100 : 0;
              return (
                <tr key={col.name}>
                  <td className="whitespace-nowrap font-mono text-xs font-medium">{col.name}</td>
                  <td><span className="badge-muted font-mono">{col.dtype || "unknown"}</span></td>
                  <td className={`whitespace-nowrap text-right ${missing > 0 ? "text-warning" : "text-fg-subtle"}`}>
                    {missing.toLocaleString()}
                    {missing > 0 && <span className="ml-1 text-fg-subtle">({pct < 1 ? "<1" : Math.round(pct)}%)</span>}
                  </td>
                  <td className="max-w-xs truncate text-fg-muted" title={(col.sample_values || []).join(", ")}>
                    {(col.sample_values || []).join(", ") || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-3 py-2">
          <p className="text-xs tabular-nums text-fg-subtle">
            {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filteredCols.length)} of {filteredCols.length}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={page === p ? "page" : undefined}
                className={`h-7 w-7 rounded-md text-xs tabular-nums transition-colors ${
                  page === p ? "bg-sunken font-medium text-fg" : "text-fg-muted hover:bg-sunken hover:text-fg"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function DataExplorerPage() {
  const navigate = useNavigate();
  const { sessionData, loading, error } = useSessionData();

  if (error) {
    return <DashboardLayout title="Data explorer"><SessionError message={error} /></DashboardLayout>;
  }
  if (loading || !sessionData) {
    return <DashboardLayout title="Data explorer"><SessionLoading /></DashboardLayout>;
  }

  const { session_id, file_name, summary } = sessionData;
  const totalMissing = (summary.columns || []).reduce((sum, c) => sum + (c.null_count || 0), 0);

  const facts = [
    { label: "Rows", value: summary.row_count?.toLocaleString() ?? "—" },
    { label: "Columns", value: summary.col_count ?? "—" },
    { label: "Missing values", value: totalMissing.toLocaleString() },
    { label: "Format", value: file_name?.split(".").pop()?.toUpperCase() || "—" },
  ];

  return (
    <DashboardLayout
      title="Data explorer"
      subtitle={`${file_name} · ${summary.row_count?.toLocaleString()} rows`}
      sessionId={session_id}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost -ml-2 px-2 py-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-fg" title={file_name}>{file_name}</h2>
          <button
            onClick={() => navigate(sessionPath("/chat", session_id), { state: { sessionData } })}
            className="btn-secondary"
          >
            <MessageSquare className="h-4 w-4" />
            Open in chat
          </button>
        </div>

        <section aria-label="Dataset summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="stat-card">
              <p className="text-xs font-medium text-fg-muted">{f.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-fg">{f.value}</p>
            </div>
          ))}
        </section>

        <ColumnTable summary={summary} />
      </div>
    </DashboardLayout>
  );
}
