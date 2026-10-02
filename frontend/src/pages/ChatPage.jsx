import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChatBox from "../components/ChatBox";
import { CHART_TYPES_NOTE } from "../utils/chartTypes";
import InsightCard from "../components/InsightCard";
import ColumnList from "../components/ColumnList";
import { SessionLoading, SessionError } from "../components/SessionStatus";
import { useSessionData } from "../hooks/useSessionData";
import { PanelLeft, Upload, X } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "What are the top 5 products by revenue?",
  "Show profit trend over time",
  "Which region performs best?",
  "Find correlations in numeric columns",
];

function DatasetDetails({ summary, fileName }) {
  const facts = [
    ["Rows", summary.row_count?.toLocaleString() ?? "—"],
    ["Columns", summary.col_count ?? "—"],
    ["Format", fileName?.split(".").pop()?.toUpperCase() || "—"],
  ];
  return (
    <section className="card">
      <div className="border-b border-line px-4 py-3">
        <p className="truncate text-sm font-semibold text-fg" title={fileName}>{fileName}</p>
        <p className="text-xs text-fg-subtle">Active dataset</p>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-line">
        {facts.map(([label, value]) => (
          <div key={label} className="px-4 py-2.5">
            <dt className="section-label">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ColumnsCard({ columns, count, search, onSearch }) {
  return (
    <section className="card">
      <div className="flex h-11 items-center justify-between border-b border-line px-4">
        <h3 className="text-sm font-semibold text-fg">Columns</h3>
        <span className="text-xs tabular-nums text-fg-subtle">{count}</span>
      </div>
      <div className="p-3 pb-1.5">
        {onSearch && (
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Filter columns…"
            className="input-field mb-1.5 h-8 py-1 text-xs"
          />
        )}
        <ColumnList columns={columns} search={search} />
      </div>
    </section>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { sessionData, loading, error } = useSessionData();
  const [columnSearch, setColumnSearch] = useState("");
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  // Ref to the ChatBox's sendMessage function — lets parent inject suggestions.
  const chatboxSendRef = useRef(null);

  const handleSuggestion = (text) => {
    chatboxSendRef.current?.(text);
  };

  if (error) {
    return <DashboardLayout title="Chat"><SessionError message={error} /></DashboardLayout>;
  }
  if (loading || !sessionData) {
    return <DashboardLayout title="Chat"><SessionLoading /></DashboardLayout>;
  }

  const { session_id, file_name, summary, insights } = sessionData;

  return (
    <DashboardLayout
      title={file_name}
      subtitle={`${summary.row_count?.toLocaleString()} rows · ${summary.col_count} columns`}
      sessionId={session_id}
    >
      <div className="flex h-full overflow-hidden">

        {/* ── Left panel: dataset details ── */}
        <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-canvas p-4 xl:flex">
          <DatasetDetails summary={summary} fileName={file_name} />
          <ColumnsCard columns={summary.columns} count={summary.col_count} search={columnSearch} onSearch={setColumnSearch} />
          {insights?.length > 0 && <InsightCard insights={insights} />}
          <button onClick={() => navigate("/upload")} className="btn-secondary mt-auto w-full">
            <Upload className="h-4 w-4" />
            New upload
          </button>
        </aside>

        {/* ── Chat ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Below xl the dataset panel is hidden — open it from here */}
          <div className="flex h-10 shrink-0 items-center border-b border-line px-3 xl:hidden">
            <button onClick={() => setMobileInfoOpen(true)} className="btn-ghost -ml-1 px-2 py-1 text-xs">
              <PanelLeft className="h-4 w-4" />
              Dataset details
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {/* key: a different dataset gets a fresh ChatBox, not the previous conversation */}
            <ChatBox key={session_id} sessionId={session_id} sendRef={chatboxSendRef} />
          </div>
        </div>

        {/* ── Right panel: suggested questions (wide screens) ── */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-line bg-canvas p-4 2xl:block">
          <p className="section-label mb-2">Suggested questions</p>
          <ul className="space-y-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <li key={q}>
                <button
                  onClick={() => handleSuggestion(q)}
                  className="w-full rounded-md px-2.5 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-fg-subtle">{CHART_TYPES_NOTE}</p>
        </aside>

        {/* ── Mobile dataset drawer ── */}
        <AnimatePresence>
          {mobileInfoOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/40 xl:hidden"
                onClick={() => setMobileInfoOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[90vw] flex-col gap-4 overflow-y-auto border-r border-line bg-canvas p-4 shadow-popover xl:hidden"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-fg">Dataset details</p>
                  <button onClick={() => setMobileInfoOpen(false)} className="btn-icon" aria-label="Close dataset details">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <DatasetDetails summary={summary} fileName={file_name} />
                <ColumnsCard columns={summary.columns} count={summary.col_count} search="" />
                {insights?.length > 0 && <InsightCard insights={insights} />}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
