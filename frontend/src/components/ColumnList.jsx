import Badge from "./ui/Badge";
import Card, { CardHeader } from "./ui/Card";
import { DatabaseIcon } from "./ui/Icons";
import EmptyState from "./ui/EmptyState";

export default function ColumnList({ columns = [], search = "" }) {
  const filtered = columns.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="animate-fade-in-up stagger-2">
      <CardHeader
        title="Schema"
        subtitle={`${columns.length} columns`}
        icon={DatabaseIcon}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={DatabaseIcon}
          title="No columns found"
          description={search ? "Try a different search term." : "Upload a dataset to see its schema."}
        />
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((col) => (
            <div
              key={col.name}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-overlay/40 border border-border-subtle/40 hover:border-border-subtle transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-content truncate">{col.name}</p>
                {col.null_count > 0 && (
                  <p className="text-xs text-amber-400 mt-0.5">{col.null_count} missing</p>
                )}
              </div>
              <Badge variant={col.null_count > 0 ? "warning" : "default"}>
                {col.dtype}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
