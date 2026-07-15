import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getHistory, deleteSession } from "../services/api";
import { timeAgo } from "../utils/formatters";
import { useToast } from "../context/ToastContext";
import {
  History, Database, MessageSquare, Clock,
  Rows, Columns, ChevronRight, Upload,
  Sparkles, Search, Trash2, RefreshCw, AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      addToast("Dataset removed from history.", "success");
    } catch {
      addToast("Failed to delete session. Please try again.", "error");
    }
  };

  const filtered = history.filter((h) =>
    h.file_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="History" subtitle="All your past dataset uploads and analyses">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/12 border border-indigo-500/20 mb-4">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400">Activity History</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Dataset History</h2>
            <p className="text-zinc-400 text-sm mt-1">
              {loading ? "Loading..." : `${history.length} dataset${history.length !== 1 ? "s" : ""} uploaded`}
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="btn-ghost gap-2 text-sm rounded-xl border border-zinc-800 px-3 py-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.div>

        {/* Search */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets..."
              className="input-field pl-11"
            />
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-10 text-red-400 text-sm">{error}</div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <History className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {search ? "No datasets found" : "No history yet"}
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs mb-6">
              {search ? "Try a different search term" : "Upload a dataset to start analyzing your data with AI"}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/upload")}
                className="btn-primary gap-2 rounded-2xl"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </button>
            )}
          </motion.div>
        )}

        {/* History list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.session_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="card rounded-2xl p-5 group hover:border-zinc-700 transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/chat", { state: { sessionData: item } })}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {item.file_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Rows className="w-3 h-3" />
                        {item.row_count?.toLocaleString()} rows
                      </span>
                      <span className="flex items-center gap-1">
                        <Columns className="w-3 h-3" />
                        {item.col_count} columns
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                    <div className="flex items-center gap-2 shrink-0">
                     <span className="badge-primary text-[10px] hidden sm:flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Ready
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/chat", { state: { sessionData: item } });
                        }}
                        className="btn-ghost gap-1.5 text-xs rounded-xl border border-zinc-800 px-3 py-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                      </button>
                      {confirmDelete === item.session_id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(e, item.session_id)}
                            className="btn-ghost gap-1 text-xs rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 px-2.5 py-2"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Confirm
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                            className="btn-ghost text-xs rounded-xl border border-zinc-800 px-2.5 py-2 text-zinc-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleDelete(e, item.session_id)}
                          className="btn-ghost gap-1.5 text-xs rounded-xl border border-zinc-800/60 text-zinc-600 hover:text-red-400 hover:border-red-500/20 px-3 py-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}