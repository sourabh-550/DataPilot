import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getDashboard, getHistory } from "../services/api";
import { sessionPath } from "../hooks/useSessionData";
import { formatNumber, timeAgo } from "../utils/formatters";
import {
  Upload,
  MessageSquare,
  Database,
  BarChart3,
  FileSpreadsheet,
  Code2,
  Plus,
  Table2,
} from "lucide-react";

// ─── Stats (real per-user numbers from GET /api/dashboard) ────────────────────
const STATS = [
  { key: "datasets", label: "Datasets uploaded", icon: Database },
  { key: "rows_uploaded", label: "Rows uploaded", icon: FileSpreadsheet },
  { key: "questions", label: "Questions asked", icon: MessageSquare },
  { key: "charts", label: "Charts generated", icon: BarChart3 },
];

const DATASETS_SHOWN = 5;

// Maps one /api/dashboard activity entry to what the Recent activity list shows.
function describeActivity(a) {
  if (a.type === "upload") {
    return {
      icon: Upload,
      label: `Uploaded ${a.file_name}`,
      detail: a.row_count != null ? `${a.row_count.toLocaleString()} rows` : null,
    };
  }
  return {
    icon: MessageSquare,
    label: `Asked “${a.text}”`,
    detail: a.file_name,
  };
}

function CardHeader({ title, count, action }) {
  return (
    <div className="flex h-11 items-center gap-2 border-b border-line px-4">
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      {count != null && <span className="text-xs tabular-nums text-fg-subtle">{count}</span>}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3 p-4" aria-label="Loading">
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-4" style={{ width: `${80 - i * 15}%` }} />)}
    </div>
  );
}

// Shown instead of stats/tables when the user hasn't uploaded anything yet.
function EmptyState({ onUpload, onSql }) {
  return (
    <section className="card flex flex-col items-center px-6 py-14 text-center">
      <FileSpreadsheet className="h-8 w-8 text-fg-subtle" />
      <h2 className="mt-3 text-base font-semibold text-fg">No datasets yet</h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">
        Upload a CSV or Excel file to get a column summary and insights, then ask questions about it.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button onClick={onUpload} className="btn-primary">
          <Plus className="h-4 w-4" />
          New analysis
        </button>
        <button onClick={onSql} className="btn-secondary">
          <Code2 className="h-4 w-4" />
          Connect a database
        </button>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [datasets, setDatasets] = useState(null); // null = loading
  const [datasetsError, setDatasetsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => { if (!cancelled) setDashboard(data); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    getHistory()
      .then((data) => { if (!cancelled) setDatasets(data.sessions || []); })
      .catch(() => { if (!cancelled) setDatasetsError(true); });
    return () => { cancelled = true; };
  }, []);

  const activity = dashboard?.recent_activity ?? [];
  const loading = !dashboard && !loadError;
  const noDatasets = datasets !== null && datasets.length === 0;
  const openChat = (item) => navigate(sessionPath("/chat", item.session_id), { state: { sessionData: item } });
  const openExplorer = (item) => navigate(sessionPath("/explorer", item.session_id), { state: { sessionData: item } });

  return (
    <DashboardLayout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">

        {/* ── Page header ── */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-fg">Dashboard</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Upload a dataset, then ask questions about it in plain English.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/sql")} className="btn-secondary">
              <Code2 className="h-4 w-4" />
              SQL workspace
            </button>
            <button onClick={() => navigate("/upload")} className="btn-primary">
              <Plus className="h-4 w-4" />
              New analysis
            </button>
          </div>
        </header>

        {noDatasets ? (
          <EmptyState onUpload={() => navigate("/upload")} onSql={() => navigate("/sql")} />
        ) : (
          <>
            {/* ── Stats ── */}
            <section aria-label="Usage" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.key} className="stat-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-fg-muted">{stat.label}</p>
                    <stat.icon className="h-4 w-4 shrink-0 text-fg-subtle" />
                  </div>
                  <div className="mt-2 h-8">
                    {dashboard ? (
                      <p className="text-2xl font-semibold tabular-nums text-fg">
                        {formatNumber(dashboard.stats[stat.key] ?? 0)}
                      </p>
                    ) : loadError ? (
                      <p className="text-2xl font-semibold text-fg-subtle">—</p>
                    ) : (
                      <div className="skeleton mt-1 h-6 w-16" />
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* ── Your datasets (from GET /api/history) ── */}
            {/* min-w-0: grid/flex children otherwise grow to fit long names and overflow on mobile */}
            <section className="card min-w-0">
              <CardHeader
                title="Your datasets"
                count={datasets ? datasets.length : null}
                action={
                  <button onClick={() => navigate("/history")} className="text-sm text-accent-text hover:underline">
                    View all
                  </button>
                }
              />

              {datasets === null && !datasetsError && <LoadingRows />}
              {datasetsError && (
                <p className="px-4 py-8 text-center text-sm text-fg-muted">Couldn't load your datasets. Please refresh.</p>
              )}

              {datasets?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th className="hidden text-right sm:table-cell">Rows × columns</th>
                        <th className="hidden sm:table-cell">Uploaded</th>
                        <th className="w-px"><span className="sr-only">Open</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasets.slice(0, DATASETS_SHOWN).map((item) => (
                        <tr key={item.session_id}>
                          <td className="max-w-0 w-full">
                            <p className="truncate font-medium" title={item.file_name}>{item.file_name}</p>
                            {/* On mobile the size/time columns are hidden — show them here instead */}
                            <p className="truncate text-xs text-fg-subtle sm:hidden">
                              {item.row_count?.toLocaleString()} × {item.col_count} · {timeAgo(item.created_at)}
                            </p>
                          </td>
                          <td className="hidden whitespace-nowrap text-right text-fg-muted sm:table-cell">
                            {item.row_count?.toLocaleString()} × {item.col_count}
                          </td>
                          <td className="hidden whitespace-nowrap text-fg-muted sm:table-cell">
                            <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
                          </td>
                          <td className="whitespace-nowrap">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => openChat(item)} className="btn-ghost h-7 px-2 py-0 text-xs">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Chat
                              </button>
                              <button onClick={() => openExplorer(item)} className="btn-ghost h-7 px-2 py-0 text-xs">
                                <Table2 className="h-3.5 w-3.5" />
                                Explorer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Recent activity ── */}
            <section className="card min-w-0">
              <CardHeader title="Recent activity" />

              {loading && <LoadingRows />}

              {!loading && activity.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-fg-muted">
                  {loadError ? "Couldn't load your activity. Please refresh." : "No questions asked yet."}
                </p>
              )}

              {activity.length > 0 && (
                <ul className="divide-y divide-line">
                  {activity.map((entry, i) => {
                    const item = describeActivity(entry);
                    return (
                      <li key={`${entry.type}-${entry.created_at}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
                        <item.icon className="h-4 w-4 shrink-0 text-fg-subtle" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-fg">{item.label}</p>
                          {item.detail && <p className="truncate text-xs text-fg-subtle">{item.detail}</p>}
                        </div>
                        <time dateTime={entry.created_at} className="shrink-0 text-xs tabular-nums text-fg-subtle">
                          {timeAgo(entry.created_at)}
                        </time>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
