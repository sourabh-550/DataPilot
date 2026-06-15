import Card, { CardHeader } from "./ui/Card";
import Badge from "./ui/Badge";
import { SparklesIcon, INSIGHT_ICONS } from "./ui/Icons";

const BADGE_VARIANTS = ["default", "success", "warning", "default", "success"];

export default function InsightCard({ insights }) {
  if (!insights?.length) return null;

  return (
    <Card className="animate-fade-in-up stagger-3">
      <CardHeader
        title="AI Insights"
        subtitle={`${insights.length} findings from your data`}
        icon={SparklesIcon}
        action={<Badge variant="success">Auto-generated</Badge>}
      />

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-surface-overlay/40 border border-border-subtle/40 hover:border-indigo-500/20 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant={BADGE_VARIANTS[i % BADGE_VARIANTS.length]} className="mb-2">
                  Insight {i + 1}
                </Badge>
                <p className="text-sm text-content-muted leading-relaxed">{insight}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
