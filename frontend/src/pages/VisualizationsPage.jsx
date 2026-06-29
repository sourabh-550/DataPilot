import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ScatterChart,
  Grid3x3,
  Activity,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
  Zap,
  Eye,
} from "lucide-react";

const CHART_TYPES = [
  {
    icon: BarChart3,
    label: "Bar Chart",
    desc: "Compare categories and values",
    gradient: "from-indigo-500 to-violet-600",
    glow: "shadow-glow-sm",
    preview: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        {[40, 70, 50, 85, 55, 65, 45].map((h, i) => (
          <rect key={i} x={6 + i * 13} y={60 - h * 0.6} width="9" height={h * 0.6} rx="2"
            fill={`rgba(99,102,241,${0.4 + i * 0.08})`} />
        ))}
      </svg>
    ),
  },
  {
    icon: PieChart,
    label: "Pie Chart",
    desc: "Show proportional distributions",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-glow-cyan",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="20" strokeDasharray="66 44" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(6,182,212,0.25)" strokeWidth="20" strokeDasharray="44 66" strokeDashoffset="-66" />
        <circle cx="50" cy="50" r="20" fill="rgba(24,24,27,1)" />
      </svg>
    ),
  },
  {
    icon: TrendingUp,
    label: "Line Chart",
    desc: "Visualize trends over time",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-glow-green",
    preview: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <polyline points="5,50 20,35 35,40 50,20 65,25 80,10 95,15"
          fill="none" stroke="rgba(34,197,94,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="5,50 20,35 35,40 50,20 65,25 80,10 95,15 95,60 5,60"
          fill="rgba(34,197,94,0.08)" stroke="none" />
      </svg>
    ),
  },
  {
    icon: ScatterChart,
    label: "Scatter Plot",
    desc: "Find correlations in data",
    gradient: "from-violet-500 to-purple-600",
    glow: "",
    preview: (
      <svg viewBox="0 0 100 70" className="w-full h-full">
        {[[15,50],[30,30],[45,45],[60,20],[70,35],[80,15],[25,60],[55,55],[85,40]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={`rgba(139,92,246,${0.4 + (i % 3) * 0.2})`} />
        ))}
      </svg>
    ),
  },
  {
    icon: Grid3x3,
    label: "Heatmap",
    desc: "Show data density and patterns",
    gradient: "from-amber-500 to-orange-600",
    glow: "",
    preview: (
      <svg viewBox="0 0 100 70" className="w-full h-full">
        {[...Array(5)].map((_, r) => (
          [...Array(7)].map((_, c) => {
            const intensity = Math.random();
            return (
              <rect key={`${r}-${c}`} x={4 + c * 14} y={4 + r * 13} width="12" height="11" rx="2"
                fill={`rgba(245,158,11,${0.1 + intensity * 0.7})`} />
            );
          })
        ))}
      </svg>
    ),
  },
  {
    icon: Activity,
    label: "Histogram",
    desc: "Analyze data distributions",
    gradient: "from-pink-500 to-rose-600",
    glow: "",
    preview: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        {[20, 35, 50, 60, 55, 40, 30, 20, 15].map((h, i) => (
          <rect key={i} x={4 + i * 10.5} y={60 - h} width="9" height={h} rx="1"
            fill={`rgba(236,72,153,${0.3 + (i > 2 && i < 7 ? 0.3 : 0)})`} />
        ))}
      </svg>
    ),
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function VisualizationsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <DashboardLayout title="Visualizations" subtitle="Create beautiful charts from your data">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/12 border border-violet-500/20 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400">Chart Builder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Visualize Your <span className="gradient-text">Data</span>
            </h2>
            <p className="text-zinc-400 text-sm">
              Choose a chart type to visualize your data. AI auto-selects the best chart for each query.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="btn-ghost gap-2 rounded-xl border border-zinc-800 text-sm">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="btn-primary gap-2 rounded-xl text-sm">
              <Sparkles className="w-4 h-4" />
              AI Select
            </button>
          </div>
        </motion.div>

        {/* Chart Type Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHART_TYPES.map((chart, i) => (
            <motion.div
              key={chart.label}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              onClick={() => setSelected(selected === chart.label ? null : chart.label)}
              className={`card rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 ${
                selected === chart.label ? "border-indigo-500/40 shadow-card-glow" : "hover:border-zinc-700"
              }`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Chart Preview */}
              <div className="h-32 bg-zinc-900/80 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                <div className="w-full h-full relative">
                  {chart.preview}
                </div>
                {selected === chart.label && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center"
                  >
                    <span className="badge-primary text-xs">Selected</span>
                  </motion.div>
                )}
              </div>

              {/* Chart Info */}
              <div className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${chart.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <chart.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">{chart.label}</h3>
                  <p className="text-xs text-zinc-500 truncate">{chart.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-zinc-600 ml-auto shrink-0 transition-all duration-200 ${selected === chart.label ? "text-indigo-400 rotate-90" : "group-hover:translate-x-1"}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty / CTA State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent" />
          <div className="relative border border-zinc-800/60 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-glow">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Charts appear after AI queries</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Upload a dataset and ask questions in AI Chat mode. DataPilot will automatically generate
              the best visualization for each query result.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="btn-primary gap-2 rounded-2xl">
                <Eye className="w-4 h-4" />
                View Sample Charts
              </button>
              <button className="btn-outline gap-2 rounded-2xl">
                <Download className="w-4 h-4" />
                Export Charts
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
