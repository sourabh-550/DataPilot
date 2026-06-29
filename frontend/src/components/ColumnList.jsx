import { motion } from "framer-motion";
import { Database, AlertTriangle } from "lucide-react";

const TYPE_COLORS = {
  int64: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  float64: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  object: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  datetime64: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  bool: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  category: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function getTypeStyle(dtype) {
  const key = Object.keys(TYPE_COLORS).find((k) => dtype?.includes(k));
  return TYPE_COLORS[key] || "text-zinc-400 bg-zinc-700/30 border-zinc-700/30";
}

export default function ColumnList({ columns = [], search = "" }) {
  const filtered = columns.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center">
        <Database className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
        <p className="text-xs text-zinc-500">
          {search ? "No columns match your search" : "No columns to display"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
      {filtered.map((col, i) => (
        <motion.div
          key={col.name}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03, duration: 0.3 }}
          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/60 transition-colors group"
        >
          <div className="min-w-0 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-indigo-400 transition-colors" />
            <p className="text-xs font-medium text-zinc-300 truncate font-mono">{col.name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {col.null_count > 0 && (
              <AlertTriangle className="w-3 h-3 text-amber-400" title={`${col.null_count} missing`} />
            )}
            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border ${getTypeStyle(col.dtype)}`}>
              {col.dtype?.replace("64", "").replace("object", "str") || "?"}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
