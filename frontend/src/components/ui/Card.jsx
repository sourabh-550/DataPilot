import { motion } from "framer-motion";

export default function Card({ children, className = "", hover = false, padding = true }) {
  return (
    <div
      className={`card ${padding ? "p-5" : ""} ${
        hover ? "card-hover cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
