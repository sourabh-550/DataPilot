export default function InsightCard({ insights }) {
  const emojis = ["💰", "🏆", "📦", "🌍", "📈"];

  return (
    <div className="bg-gray-900 rounded-2xl p-5 mb-4">
      <h2 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
        ✨ Auto Insights
      </h2>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-gray-800 rounded-xl p-3"
          >
            <span className="text-lg">{emojis[i] || "📊"}</span>
            <p className="text-gray-300 text-sm">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}