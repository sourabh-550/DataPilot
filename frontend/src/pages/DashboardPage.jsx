import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getDashboard } from "../services/api";
import { formatNumber, timeAgo } from "../utils/formatters";
import {
  Upload,
  MessageSquare,
  Database,
  BarChart3,
  FileSpreadsheet,
  ChevronRight,
  Code2,
} from "lucide-react";

// ─── Stats (real per-user numbers from GET /api/dashboard) ────────────────────
const STATS = [
  { key: "datasets", label: "Datasets uploaded", icon: Database },
  { key: "rows_uploaded", label: "Rows uploaded", icon: FileSpreadsheet },
  { key: "questions", label: "Questions asked", icon: MessageSquare },
  { key: "charts", label: "Charts generated", icon: BarChart3 },
];

const QUICK_ACTIONS = [
  { label: "Upload dataset", desc: "CSV or Excel, up to 10 MB", icon: Upload, path: "/upload" },
  { label: "Chat", desc: "Ask questions about a dataset", icon: MessageSquare, path: "/chat" },
  { label: "SQL workspace", desc: "Query a SQLite file or database", icon: Code2, path: "/sql" },
];

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

function CardHeader({ title, action }) {
  return (
    <div className="flex h-11 items-center justify-between border-b border-line px-4">
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((data) => { if (!cancelled) setDashboard(data); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  const activity = dashboard?.recent_activity ?? [];
  const loading = !dashboard && !loadError;

  return (
    <DashboardLayout title="Dashboard" subtitle="Your datasets and activity">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">

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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Recent activity ── */}
          {/* min-w-0: grid children otherwise grow to fit long text and overflow on mobile */}
          <section className="card min-w-0 lg:col-span-2">
            <CardHeader
              title="Recent activity"
              action={
                <button onClick={() => navigate("/history")} className="text-sm text-accent-text hover:underline">
                  View history
                </button>
              }
            />

            {loading && (
              <div className="space-y-3 p-4" aria-label="Loading activity">
                {[0, 1, 2].map((i) => <div key={i} className="skeleton h-4" style={{ width: `${80 - i * 15}%` }} />)}
              </div>
            )}

            {!loading && activity.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <p className="text-sm text-fg-muted">
                  {loadError ? "Couldn't load your activity. Please refresh." : "No activity yet."}
                </p>
                {!loadError && (
                  <button onClick={() => navigate("/upload")} className="btn-secondary">
                    <Upload className="h-4 w-4" />
                    Upload a dataset
                  </button>
                )}
              </div>
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

          {/* ── Quick actions ── */}
          <section className="card min-w-0 self-start">
            <CardHeader title="Quick actions" />
            <ul className="p-1.5">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.label}>
                  <button
                    onClick={() => navigate(action.path)}
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-sunken"
                  >
                    <action.icon className="h-4 w-4 shrink-0 text-fg-subtle" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg">{action.label}</span>
                      <span className="block truncate text-xs text-fg-subtle">{action.desc}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
