import StatCard from "./StatCard";
import { Rows, Columns, AlertTriangle, HardDrive } from "lucide-react";
import { formatNumber, getTotalMissingValues, estimateDatasetSize } from "../utils/formatters";

export default function DatasetOverview({ summary }) {
  if (!summary) return null;

  const missing = getTotalMissingValues(summary.columns);

  const stats = [
    { label: "Total Rows", value: formatNumber(summary.row_count), icon: Rows },
    { label: "Total Columns", value: formatNumber(summary.col_count), icon: Columns },
    { label: "Missing Values", value: formatNumber(missing), icon: AlertTriangle },
    { label: "Est. Size", value: estimateDatasetSize(summary.row_count, summary.col_count), icon: HardDrive },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </div>
  );
}
