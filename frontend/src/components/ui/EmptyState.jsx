export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-border-subtle flex items-center justify-center text-content-subtle mb-5">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-content mb-2">{title}</h3>
      <p className="text-sm text-content-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
