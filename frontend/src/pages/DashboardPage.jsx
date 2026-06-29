import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Upload,
  MessageSquare,
  Database,
  BarChart3,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Zap,
  FileSpreadsheet,
  Brain,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  Code2,
} from "lucide-react";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "", duration = 1.5 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString()
  );
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        if (v >= 1000) setDisplay(`${(v / 1000).toFixed(1)}k`);
        else setDisplay(Math.round(v).toString());
      },
    });
    return controls.stop;
  }, [value]);

  return <span>{display}{suffix}</span>;
}

// ─── Stats Data ───────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Datasets Uploaded",
    value: 24,
    change: "+12%",
    positive: true,
    icon: Database,
    color: "indigo",
    gradient: "from-indigo-500 to-violet-600",
    glow: "rgba(99,102,241,0.3)",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  {
    label: "Queries Executed",
    value: 1847,
    change: "+28%",
    positive: true,
    icon: MessageSquare,
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.3)",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  {
    label: "Charts Generated",
    value: 312,
    change: "+18%",
    positive: true,
    icon: BarChart3,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.3)",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
  },
  {
    label: "AI Insights",
    value: 96,
    change: "+45%",
    positive: true,
    icon: Sparkles,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(34,197,94,0.3)",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
];

const QUICK_ACTIONS = [
  { label: "Upload Dataset", desc: "CSV, Excel up to 10MB", icon: Upload, path: "/upload", color: "indigo", gradient: "from-indigo-500 to-violet-600" },
  { label: "Start AI Chat", desc: "Ask questions in plain English", icon: MessageSquare, path: "/chat", color: "cyan", gradient: "from-cyan-500 to-blue-600" },
  { label: "SQL Workspace", desc: "Natural language to SQL", icon: Code2, path: "/sql", color: "violet", gradient: "from-violet-500 to-purple-600" },
  { label: "Visualizations", desc: "Create beautiful charts", icon: BarChart3, path: "/visualizations", color: "emerald", gradient: "from-emerald-500 to-teal-600" },
];

const RECENT_ACTIVITY = [
  { icon: CheckCircle2, label: "Uploaded sales_q4_2024.xlsx", time: "2 min ago", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Brain, label: "AI analyzed revenue trends — 5 insights found", time: "15 min ago", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: BarChart3, label: "Generated bar chart for monthly profit", time: "32 min ago", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Code2, label: "SQL: SELECT city, SUM(revenue) — 48 rows", time: "1h ago", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Upload, label: "Uploaded customer_data.csv", time: "3h ago", color: "text-amber-400", bg: "bg-amber-500/10" },
];

const FEATURES = [
  { icon: Brain, title: "Natural Language AI", desc: "Ask questions in plain English — AI converts to SQL instantly", gradient: "from-indigo-500 to-violet-600" },
  { icon: BarChart3, title: "Smart Visualizations", desc: "Auto-generated charts from your data queries", gradient: "from-cyan-500 to-blue-600" },
  { icon: Zap, title: "Instant Insights", desc: "Pattern detection and business intelligence in seconds", gradient: "from-emerald-500 to-teal-600" },
  { icon: FileSpreadsheet, title: "Multi-format Support", desc: "Upload CSV, Excel, and connect to SQL databases", gradient: "from-violet-500 to-purple-600" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back — your AI data workspace">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

        {/* ── Hero Section ────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-cyan-600/5" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative px-8 py-12 sm:px-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-400">AI-Powered Analytics Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl"
            >
              Transform Your Data Into{" "}
              <span className="gradient-text">Insights Using AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-zinc-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
            >
              Upload datasets, ask questions in plain English, and receive intelligent
              visual insights instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                onClick={() => navigate("/upload")}
                className="btn-primary gap-2 px-6 py-3 text-base rounded-2xl"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Upload className="w-5 h-5" />
                Upload Dataset
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => navigate("/chat")}
                className="btn-outline gap-2 px-6 py-3 text-base rounded-2xl"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles className="w-5 h-5" />
                Start AI Analysis
              </motion.button>
            </motion.div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { label: "Accuracy Rate", value: "99.8%" },
                { label: "Avg Response", value: "<2s" },
                { label: "Chart Types", value: "12+" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg font-bold gradient-text">{s.value}</span>
                  <span className="text-xs text-zinc-500">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Stats Cards ─────────────────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="stat-card group"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
                <span className="badge-success text-xs">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} duration={1.2 + i * 0.2} />
              </div>
              <p className="text-sm text-zinc-500">{stat.label}</p>
              {/* Progress bar */}
              <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stat.value / 2000) * 100 + 30, 95)}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                />
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ── Quick Actions + Recent Activity ─────────────────── */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Quick Actions</h2>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="glass-card rounded-2xl p-5 text-left group transition-all duration-300"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-glow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">
                    {action.label}
                  </h3>
                  <p className="text-xs text-zinc-500">{action.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-zinc-600 group-hover:text-indigo-400 transition-colors">
                    <span>Get started</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Recent Activity */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Activity</h2>
              <button
                onClick={() => navigate("/history")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                View history <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="card rounded-2xl divide-y divide-zinc-800/60 overflow-hidden">
              {RECENT_ACTIVITY.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-300 leading-snug">{item.label}</p>
                    <p className="text-xs text-zinc-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ── Feature Highlights ──────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Platform Capabilities</h2>
              <p className="text-sm text-zinc-500 mt-1">Everything you need to turn data into decisions</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.08 }}
                className="card rounded-2xl p-5 group hover:border-zinc-700 transition-all duration-300"
                whileHover={{ y: -3 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow-sm`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </DashboardLayout>
  );
}
