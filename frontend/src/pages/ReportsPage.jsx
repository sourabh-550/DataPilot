import DashboardLayout from "../components/layout/DashboardLayout";
import { FileText, Info } from "lucide-react";

// Demo content only — report generation isn't built. The page is not linked
// from the sidebar; it stays as a preview of a possible future feature.
const MOCK_REPORTS = [
  {
    id: 1,
    title: "Q4 2024 Sales Analysis",
    desc: "Quarterly sales performance, top products, and regional breakdown.",
    date: "Jun 28, 2026",
    status: "ready",
    charts: 8,
    insights: 12,
  },
  {
    id: 2,
    title: "Customer Segmentation Report",
    desc: "Customer segments with behaviour patterns and revenue contribution.",
    date: "Jun 25, 2026",
    status: "ready",
    charts: 5,
    insights: 8,
  },
  {
    id: 3,
    title: "Monthly Revenue Trends",
    desc: "Month-by-month revenue over time.",
    date: "Jun 20, 2026",
    status: "ready",
    charts: 6,
    insights: 9,
  },
  {
    id: 4,
    title: "Product Performance Analysis",
    desc: "Product-level metrics with top and bottom performers.",
    date: "Jun 15, 2026",
    status: "processing",
    charts: 4,
    insights: 6,
  },
];

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports" subtitle="Preview — sample reports, feature coming soon">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">

        {/* Demo data notice — everything on this page is sample content */}
        <div className="flex items-start gap-2.5 rounded-md border border-warning/25 bg-warning/10 px-3 py-2.5 text-sm text-fg">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            <span className="font-medium">Demo data.</span>{" "}
            Report generation isn't built yet — the reports below are examples,
            not generated from your datasets.
          </p>
        </div>

        <ul className="card divide-y divide-line">
          {MOCK_REPORTS.map((report) => (
            <li key={report.id} className="flex items-start gap-3 px-4 py-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{report.title}</p>
                <p className="text-sm text-fg-muted">{report.desc}</p>
                <p className="mt-1 text-xs tabular-nums text-fg-subtle">
                  {report.date} · {report.charts} charts · {report.insights} insights
                </p>
              </div>
              <span className={`shrink-0 ${report.status === "ready" ? "badge-muted" : "badge-warning"}`}>
                {report.status === "ready" ? "Ready" : "Processing"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
