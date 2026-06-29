import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChatBox from "../components/ChatBox";
import InsightCard from "../components/InsightCard";
import ColumnList from "../components/ColumnList";
import {
  Table2,
  Database,
  Rows,
  Columns,
  HardDrive,
  FileSpreadsheet,
  Sparkles,
  ChevronLeft,
  Filter,
  Search as SearchIcon,
  ArrowUpDown,
  Download,
} from "lucide-react";

function DataPreviewTable({ summary }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  if (!summary?.columns?.length) return null;

  const columns = summary.columns;
  const filteredCols = columns.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCols.length / rowsPerPage);
  const pageCols = filteredCols.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const TYPE_COLORS = {
    int64: "text-cyan-400 bg-cyan-500/10",
    float64: "text-violet-400 bg-violet-500/10",
    object: "text-emerald-400 bg-emerald-500/10",
    datetime64: "text-amber-400 bg-amber-500/10",
    bool: "text-pink-400 bg-pink-500/10",
  };

  const getTypeColor = (dtype) => {
    const key = Object.keys(TYPE_COLORS).find(k => dtype?.includes(k));
    return TYPE_COLORS[key] || "text-zinc-400 bg-zinc-700/30";
  };

  return (
    <div className="card rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-white">Column Overview</span>
          <span className="badge-muted text-[10px]">{columns.length} cols</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter columns..."
              className="input-field py-1.5 pl-8 text-xs w-40"
            />
          </div>
          <button className="btn-ghost gap-1.5 text-xs rounded-xl border border-zinc-800 px-3 py-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="data-table">
          <thead>
            <tr>
              {["Column Name", "Data Type", "Non-Null Count", "Status"].map((h) => (
                <th key={h} className="text-left">
                  <div className="flex items-center gap-1.5">
                    {h}
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageCols.map((col, i) => (
              <tr key={col.name}>
                <td className="font-mono text-xs text-white font-medium">{col.name}</td>
                <td>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${getTypeColor(col.dtype)}`}>
                    {col.dtype || "unknown"}
                  </span>
                </td>
                <td className="text-zinc-400 text-xs">
                  {col.non_null_count?.toLocaleString() || "—"}
                </td>
                <td>
                  <span className={`badge text-[10px] ${col.non_null_count > 0 ? "badge-success" : "badge-warning"}`}>
                    {col.non_null_count > 0 ? "Available" : "Empty"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-zinc-800/60 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredCols.length)} of {filteredCols.length}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs transition-all ${
                  page === p
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataExplorerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state?.sessionData;

  useEffect(() => {
    if (!sessionData) navigate("/upload");
  }, [sessionData, navigate]);

  if (!sessionData) return null;

  const { session_id, file_name, summary } = sessionData;

  const OVERVIEW_STATS = [
    { icon: Rows, label: "Total Rows", value: summary.row_count?.toLocaleString() || "—", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { icon: Columns, label: "Total Columns", value: summary.col_count || "—", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { icon: HardDrive, label: "Memory Usage", value: summary.memory_usage || "—", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { icon: Database, label: "Format", value: file_name?.split(".").pop()?.toUpperCase() || "—", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <DashboardLayout
      title="Data Explorer"
      subtitle={`${file_name} · ${summary.row_count?.toLocaleString()} rows`}
      sessionId={session_id}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Dataset Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-5 card rounded-2xl"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{file_name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Active Dataset · AI Analysis Ready</p>
          </div>
          <span className="badge-success ml-auto text-[10px]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Session
          </span>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {OVERVIEW_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="card rounded-2xl p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-base font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-zinc-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataPreviewTable summary={summary} />
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">AI Summary</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Dataset <strong className="text-white">{file_name}</strong> contains{" "}
            <strong className="text-indigo-400">{summary.row_count?.toLocaleString()} rows</strong> and{" "}
            <strong className="text-indigo-400">{summary.col_count} columns</strong>.
            The data appears to be structured and ready for AI-powered analysis. Use the{" "}
            <button onClick={() => navigate("/chat", { state: { sessionData } })} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
              AI Chat
            </button>{" "}
            to ask questions in plain English.
          </p>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
