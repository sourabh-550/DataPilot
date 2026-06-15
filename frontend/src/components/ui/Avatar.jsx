export default function Avatar({ name = "U", variant = "user", size = "md" }) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const variants = {
    user: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
    ai: "bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30",
  };

  const initial = variant === "ai" ? "AI" : (name?.[0]?.toUpperCase() || "U");

  return (
    <div
      className={`${sizes[size]} ${variants[variant]} rounded-xl flex items-center justify-center font-semibold shrink-0`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
