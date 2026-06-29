import { motion } from "framer-motion";
import { Sparkles, TrendingUp, BarChart3, Database, Lightbulb } from "lucide-react";

const ICONS = [Sparkles, TrendingUp, BarChart3, Database, Lightbulb];
const COLORS = [
  { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", badge: "badge-primary" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "badge-success" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", badge: "badge-primary" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", badge: "badge-cyan" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", badge: "badge-warning" },
];

export default function InsightCard({ insights }) {
  if (!insights?.length) return null;

  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-white">AI Insights</span>
        <span className="badge-success ml-auto text-[10px]">{insights.length} found</span>
      </div>
      <div className="p-3 space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
        {insights.map((insight, i) => {
          const Icon = ICONS[i % ICONS.length];
          const color = COLORS[i % COLORS.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-3 p-3 rounded-xl ${color.bg} border ${color.border}`}
            >
              <div className={`w-7 h-7 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${color.text}`} />
              </div>
              <div>
                <span className={`${color.badge} text-[10px] mb-1`}>Insight {i + 1}</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{insight}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
