export default function InsightCard({ insights }) {
  if (!insights?.length) return null;

  return (
    <section className="card">
      <div className="flex h-11 items-center justify-between border-b border-line px-4">
        <h3 className="text-sm font-semibold text-fg">Insights</h3>
        <span className="text-xs tabular-nums text-fg-subtle">{insights.length}</span>
      </div>
      <ol className="max-h-80 space-y-3 overflow-y-auto p-4">
        {insights.map((insight, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg-muted">
            <span className="mt-px shrink-0 text-xs tabular-nums text-fg-subtle">{i + 1}.</span>
            <span>{insight}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
