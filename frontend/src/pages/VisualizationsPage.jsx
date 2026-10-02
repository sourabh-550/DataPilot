import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { BarChart3, PieChart, TrendingUp, ScatterChart, Activity, MessageSquare } from "lucide-react";

// The chart types the CSV agent can draw (backend/agent/tools/chart_gen.py).
// Not linked from the sidebar — Chat lists these types next to its suggestions.
const CHART_TYPES = [
  { icon: BarChart3, label: "Bar chart", desc: "Compare values across categories", example: "Bar chart of sales by region" },
  { icon: TrendingUp, label: "Line chart", desc: "Show a trend over time", example: "Line chart of revenue by month" },
  { icon: ScatterChart, label: "Scatter plot", desc: "Look for a relationship between two numbers", example: "Scatter plot of price vs quantity" },
  { icon: PieChart, label: "Pie chart", desc: "Show each category's share of the count", example: "Pie chart of orders by payment method" },
  { icon: Activity, label: "Histogram", desc: "See how one numeric column is distributed", example: "Histogram of order value" },
];

export default function VisualizationsPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Visualizations" subtitle="Chart types the chat can create">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-fg">Chart types</h2>
            <p className="mt-1 text-sm text-fg-muted">Ask for one of these in Chat, in plain English.</p>
          </div>
          <button onClick={() => navigate("/chat")} className="btn-secondary">
            <MessageSquare className="h-4 w-4" />
            Open chat
          </button>
        </div>

        <ul className="card divide-y divide-line">
          {CHART_TYPES.map((chart) => (
            <li key={chart.label} className="flex items-start gap-3 px-4 py-3">
              <chart.icon className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{chart.label}</p>
                <p className="text-sm text-fg-muted">{chart.desc}</p>
                <p className="mt-1 text-xs text-fg-subtle">e.g. “{chart.example}”</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
