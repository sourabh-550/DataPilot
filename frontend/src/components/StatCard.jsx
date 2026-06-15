import Card from "./ui/Card";

const ACCENTS = [
  { bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "text-indigo-400" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-400" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400" },
];

export default function StatCard({ label, value, icon: Icon, index = 0, suffix }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <Card hover>
        <div className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center ${accent.icon} mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-content-muted uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-content mt-1 tabular-nums">
          {value}
          {suffix && <span className="text-sm font-normal text-content-muted ml-1">{suffix}</span>}
        </p>
      </Card>
    </div>
  );
}
