export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "badge-primary",
    primary: "badge-primary",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    cyan: "badge-cyan",
    muted: "badge-muted",
  };

  return (
    <span className={`${variants[variant] || "badge-muted"} ${className}`}>
      {children}
    </span>
  );
}
