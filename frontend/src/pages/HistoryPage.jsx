import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getHistory, deleteSession } from "../services/api";
import { timeAgo } from "../utils/formatters";
import { useToast } from "../context/ToastContext";
import { sessionPath } from "../hooks/useSessionData";
import { useAuth } from "../context/AuthContext";
import { removeRecentDataset } from "../utils/recentDatasets";
import { FileSpreadsheet, Upload, Search, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // session_id awaiting confirmation

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setHistory(data.sessions || []);
    } catch (err) {
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    // First click: enter confirmation state. Second click: actually delete.
    if (confirmDelete !== sessionId) {
      setConfirmDelete(sessionId);
      return;
    }
    setConfirmDelete(null);
    try {
      await deleteSession(sessionId);
      setHistory((prev) => prev.filter((h) => h.session_id !== sessionId));
      removeRecentDataset(user?.id, sessionId); // drop it from the sidebar's cached list too
      addToast("Dataset and its file were permanently deleted.", "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to delete session. Please try again.", "error");
    }
  };

  const filtered = history.filter((h) =>
    h.file_name?.toLowerCase().includes(search.toLowerCase())
  );
  const open = (item) => navigate(sessionPath("/chat", item.session_id), { state: { sessionData: item } });

  return (
    <DashboardLayout title="History" subtitle="Your uploaded datasets">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <section className="card min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by file name"
                className="input-field h-8 py-1 pl-8"
                aria-label="Filter datasets"
              />
            </div>
            <span className="text-xs tabular-nums text-fg-subtle">
              {loading ? "" : `${history.length} dataset${history.length !== 1 ? "s" : ""}`}
            </span>
            <button onClick={fetchHistory} className="btn-ghost ml-auto h-8 px-2.5 py-0" disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3 p-4" aria-label="Loading history">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-4" style={{ width: `${70 - i * 12}%` }} />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <p className="px-4 py-10 text-center text-sm text-negative">{error}</p>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
              <p className="text-sm font-medium text-fg">{search ? "No datasets match" : "No datasets yet"}</p>
              <p className="max-w-xs text-sm text-fg-muted">
                {search ? "Try a different file name." : "Upload a CSV or Excel file to start asking questions about it."}
              </p>
              {!search && (
                <button onClick={() => navigate("/upload")} className="btn-primary mt-1">
                  <Upload className="h-4 w-4" />
                  Upload dataset
                </button>
              )}
            </div>
          )}

          {/* List */}
          {!loading && !error && filtered.length > 0 && (
            <ul className="divide-y divide-line">
              {filtered.map((item) => (
                <li
                  key={item.session_id}
                  onClick={() => open(item)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-sunken/60"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-fg-subtle" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{item.file_name}</p>
                    <p className="truncate text-xs tabular-nums text-fg-subtle">
                      {item.row_count?.toLocaleString()} rows · {item.col_count} columns · {timeAgo(item.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {confirmDelete === item.session_id ? (
                      <>
                        <span className="mr-1 hidden text-xs text-fg-muted sm:inline">Delete permanently?</span>
                        <button onClick={(e) => handleDelete(e, item.session_id)} className="btn-danger h-8 px-2.5 py-0 text-xs">
                          Delete
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="btn-ghost h-8 px-2.5 py-0 text-xs">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => open(item)} className="btn-secondary h-8 px-2.5 py-0 text-xs">
                          Open
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.session_id)}
                          className="btn-icon hover:text-negative"
                          aria-label={`Delete ${item.file_name}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
