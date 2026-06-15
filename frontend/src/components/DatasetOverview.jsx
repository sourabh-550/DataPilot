import StatCard from "./StatCard";
import { RowsIcon, ColumnsIcon, AlertIcon, SizeIcon } from "./ui/Icons";
import { formatNumber, getTotalMissingValues, estimateDatasetSize } from "../utils/formatters";

export default function DatasetOverview({ summary }) {
  if (!summary) return null;

  const missing = getTotalMissingValues(summary.columns);

  const stats = [
    { label: "Total Rows", value: formatNumber(summary.row_count), icon: RowsIcon },
    { label: "Total Columns", value: formatNumber(summary.col_count), icon: ColumnsIcon },
    {
      label: "Missing Values",
      value: formatNumber(missing),
      icon: AlertIcon,
    },
    {
      label: "Est. Size",
      value: estimateDatasetSize(summary.row_count, summary.col_count),
      icon: SizeIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </div>
  );
}
