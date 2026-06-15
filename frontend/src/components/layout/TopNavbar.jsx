import { useTheme } from "../../context/ThemeContext";
import { SearchIcon, SunIcon, MoonIcon, MenuIcon } from "../ui/Icons";

export default function TopNavbar({
  title = "DataPilot",
  subtitle,
  onMenuClick,
  searchValue,
  onSearchChange,
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass border-b border-border-subtle/60 px-4 lg:px-6 py-3.5 flex items-center gap-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-ghost p-2 -ml-1"
        aria-label="Open navigation menu"
      >
        <MenuIcon />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-base font-semibold text-content truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-content-muted truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {onSearchChange && (
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-subtle" />
            <input
              type="search"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search columns..."
              className="input-field pl-10 py-2 text-sm"
              aria-label="Search columns"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2.5 rounded-xl border border-border-subtle/60 hover:border-border"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border-subtle/60">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
