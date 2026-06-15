export function formatNumber(num) {
  if (num == null) return "—";
  return new Intl.NumberFormat().format(num);
}

export function formatFileSize(bytes) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function getTotalMissingValues(columns = []) {
  return columns.reduce((sum, col) => sum + (col.null_count || 0), 0);
}

export function estimateDatasetSize(rowCount, colCount) {
  const estimatedBytes = rowCount * colCount * 50;
  return formatFileSize(estimatedBytes);
}

export function truncate(str, max = 28) {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
