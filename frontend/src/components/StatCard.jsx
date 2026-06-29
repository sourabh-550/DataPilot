import { motion } from "framer-motion";

const ACCENTS = [
  { bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "text-indigo-400", gradient: "from-indigo-500 to-violet-600" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-400", gradient: "from-cyan-500 to-blue-600" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-400", gradient: "from-violet-500 to-purple-600" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", gradient: "from-emerald-500 to-teal-600" },
];

export default function StatCard({ label, value, icon: Icon, index = 0, suffix, trend }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: "easeOut" }}
      className="stat-card group"
      whileHover={{ y: -3 }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-4 shadow-glow-sm group-hover:scale-110 transition-transform duration-300`}>
        {Icon && <Icon className="w-5 h-5 text-white" />}
      </div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">
        {value}
        {suffix && <span className="text-sm font-normal text-zinc-500 ml-1">{suffix}</span>}
      </p>
      {trend && (
        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
          <span>↑</span> {trend}
        </p>
      )}
    </motion.div>
  );
}
