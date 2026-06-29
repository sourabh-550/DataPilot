import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChatBox from "../components/ChatBox";
import InsightCard from "../components/InsightCard";
import ColumnList from "../components/ColumnList";
import {
  MessageSquare,
  FileSpreadsheet,
  Database,
  Columns,
  Rows,
  HardDrive,
  Sparkles,
  ChevronRight,
  Upload,
} from "lucide-react";

function DatasetCard({ summary, fileName }) {
  const stats = [
    { icon: Rows, label: "Rows", value: summary.row_count?.toLocaleString() || "—", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { icon: Columns, label: "Columns", value: summary.col_count || "—", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { icon: HardDrive, label: "Memory", value: summary.memory_usage || "—", color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Database, label: "Format", value: fileName?.split(".").pop()?.toUpperCase() || "—", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{fileName}</p>
          <p className="text-xs text-zinc-500">Active Dataset</p>
        </div>
        <span className="badge-success ml-auto text-[10px] shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{s.value}</p>
              <p className="text-[10px] text-zinc-600">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state?.sessionData;
  const [columnSearch, setColumnSearch] = useState("");

  useEffect(() => {
    if (!sessionData) navigate("/upload");
  }, [sessionData, navigate]);

  if (!sessionData) return null;

  const { session_id, file_name, summary, insights } = sessionData;

  return (
    <DashboardLayout
      title={file_name}
      subtitle={`${summary.row_count?.toLocaleString()} rows · ${summary.col_count} columns · AI Chat Mode`}
      sessionId={session_id}
    >
      <div className="h-[calc(100vh-57px)] flex overflow-hidden">

        {/* ── Left Panel (dataset info) ── */}
        <div className="hidden xl:flex flex-col w-72 shrink-0 border-r border-zinc-800/60 overflow-y-auto scrollbar-thin p-4 space-y-4">
          <DatasetCard summary={summary} fileName={file_name} />

          {/* Column List */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Columns className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-white">Columns</h3>
              <span className="badge-muted ml-auto text-[10px]">{summary.col_count}</span>
            </div>
            <div className="relative mb-3">
              <input
                type="text"
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                placeholder="Filter columns..."
                className="input-field py-2 text-xs"
              />
            </div>
            <ColumnList columns={summary.columns} search={columnSearch} />
          </motion.div>

          {/* Insights */}
          {insights?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InsightCard insights={insights} />
            </motion.div>
          )}

          {/* New Upload */}
          <motion.button
            onClick={() => navigate("/upload")}
            className="btn-outline w-full gap-2 rounded-2xl py-2.5 mt-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Upload className="w-4 h-4" />
            New Upload
          </motion.button>
        </div>

        {/* ── Main Chat Panel ── */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6">
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800/60"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Data Analyst</h2>
              <p className="text-xs text-zinc-500">Powered by DataPilot AI</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="badge-success text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
              {/* Mobile: dataset info toggle */}
              <button className="xl:hidden btn-ghost p-1.5 rounded-lg text-xs gap-1 border border-zinc-800">
                <Database className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* ChatBox */}
          <div className="flex-1 min-h-0">
            <ChatBox sessionId={session_id} />
          </div>
        </div>

        {/* ── Right Panel (insights, mobile) ── */}
        <div className="hidden 2xl:flex flex-col w-64 shrink-0 border-l border-zinc-800/60 overflow-y-auto scrollbar-thin p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              AI Suggestions
            </p>
            {[
              "What are the top 5 products by revenue?",
              "Show profit trend over time",
              "Which region performs best?",
              "Find correlations in numeric columns",
            ].map((q, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 mb-2 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer transition-all group"
              >
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                {q}
                <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
