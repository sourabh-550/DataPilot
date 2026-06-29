import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  FileText,
  Download,
  Share2,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Filter,
  ArrowRight,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";

const MOCK_REPORTS = [
  {
    id: 1,
    title: "Q4 2024 Sales Analysis",
    desc: "Comprehensive breakdown of quarterly sales performance, top products, and regional insights.",
    date: "Jun 28, 2026",
    status: "ready",
    charts: 8,
    insights: 12,
    rows: "24.5k",
    color: "indigo",
    gradient: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
  {
    id: 2,
    title: "Customer Segmentation Report",
    desc: "AI-generated customer segments with behavioral patterns and revenue contribution analysis.",
    date: "Jun 25, 2026",
    status: "ready",
    charts: 5,
    insights: 8,
    rows: "12.3k",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
  {
    id: 3,
    title: "Monthly Revenue Trends",
    desc: "Time-series analysis of monthly revenue with forecasting and anomaly detection.",
    date: "Jun 20, 2026",
    status: "ready",
    charts: 6,
    insights: 9,
    rows: "8.7k",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  {
    id: 4,
    title: "Product Performance Analysis",
    desc: "SKU-level performance metrics, inventory analysis, and top/bottom performer identification.",
    date: "Jun 15, 2026",
    status: "processing",
    charts: 4,
    insights: 6,
    rows: "31.2k",
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
  },
];

const STATS = [
  { label: "Total Reports", value: "24", icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "Ready to Export", value: "18", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Charts Included", value: "142", icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "AI Insights", value: "89", icon: Sparkles, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports" subtitle="AI-generated analysis reports from your data">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/12 border border-indigo-500/20 mb-4">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400">Report Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Your <span className="gradient-text">Reports</span>
            </h2>
            <p className="text-zinc-400 text-sm">AI-generated reports with insights, charts, and downloadable exports</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost gap-2 rounded-xl border border-zinc-800 text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="btn-primary gap-2 rounded-xl text-sm">
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="card rounded-2xl p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reports Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {MOCK_REPORTS.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="card rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all duration-300"
              whileHover={{ y: -3 }}
            >
              {/* Color bar */}
              <div className={`h-1 bg-gradient-to-r ${report.gradient}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${report.gradient} flex items-center justify-center shrink-0 shadow-glow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{report.desc}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{report.date}</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{report.charts} charts</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" />{report.insights} insights</span>
                  <span className={`ml-auto ${report.status === "ready" ? "badge-success" : "badge-warning"} text-[10px]`}>
                    {report.status === "ready" ? <CheckCircle2 className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {report.status === "ready" ? "Ready" : "Processing"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-zinc-800/60">
                  <button className="btn-ghost gap-1.5 text-xs rounded-xl flex-1 border border-zinc-800 hover:border-zinc-700">
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <button className="btn-ghost gap-1.5 text-xs rounded-xl flex-1 border border-zinc-800 hover:border-zinc-700">
                    <FileDown className="w-3.5 h-3.5 text-red-400" />
                    PDF
                  </button>
                  <button className="btn-ghost gap-1.5 text-xs rounded-xl flex-1 border border-zinc-800 hover:border-zinc-700">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    CSV
                  </button>
                  <button className="btn-ghost gap-1.5 text-xs rounded-xl border border-zinc-800 hover:border-zinc-700 px-3">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center py-8"
        >
          <p className="text-xs text-zinc-600">
            Reports are automatically generated from AI chat sessions.{" "}
            <button className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
              Start a new analysis <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
