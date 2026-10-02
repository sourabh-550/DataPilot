import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRecentDatasets } from "../../utils/recentDatasets";
import { sessionPath } from "../../hooks/useSessionData";
import {
  LayoutDashboard,
  Table2,
  MessageSquare,
  Code2,
  BarChart3,
  History,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Database,
  X,
} from "lucide-react";

// Uploading is the "New analysis" button above the nav. Reports and
// Visualizations still have routes but are hidden: Reports is demo data and
// Visualizations was a static list (chart types are listed in Chat instead).
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Data explorer", icon: Table2, path: "/explorer" },
  { label: "Chat", icon: MessageSquare, path: "/chat" },
  { label: "SQL workspace", icon: Code2, path: "/sql" },
  { label: "History", icon: History, path: "/history" },
];

const BOTTOM_NAV = [
  { label: "Settings", icon: Settings, path: "/settings" },
];

// Pages that work on one dataset — the sidebar links keep the dataset that's open.
const DATASET_PAGES = ["/chat", "/explorer"];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse, currentSessionId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // Scoped to the signed-in user — see utils/recentDatasets.js
  const history = getRecentDatasets(user?.id).slice(0, 5);

  const handleNavigate = (path) => {
    const keepDataset = currentSessionId && DATASET_PAGES.includes(path);
    navigate(keepDataset ? sessionPath(path, currentSessionId) : path);
    onClose?.();
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isGuest = Boolean(user?.is_anonymous);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (isGuest ? "Guest" : user?.email?.split("@")[0]) ||
    "User";

  // `compact` = desktop collapsed rail; the mobile drawer is always full width.
  const renderContent = (compact) => (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div className={`flex h-12 shrink-0 items-center border-b border-line px-3 ${compact ? "justify-center" : "justify-between"}`}>
        <button
          onClick={() => handleNavigate("/")}
          className="flex min-w-0 items-center gap-2 rounded-md"
          aria-label="DataPilot home"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-white">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          {!compact && <span className="truncate text-sm font-semibold text-fg">DataPilot</span>}
        </button>

        {/* Mobile close */}
        <button onClick={onClose} className="btn-icon lg:hidden" aria-label="Close navigation">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── New analysis ── */}
      <div className={`shrink-0 px-3 pt-3 ${compact ? "flex justify-center" : ""}`}>
        <button
          onClick={() => handleNavigate("/upload")}
          className={`btn-secondary ${isActive("/upload") ? "!border-line-strong !bg-sunken" : ""} ${compact ? "!h-8 !w-8 !p-0" : "w-full justify-start"}`}
          aria-current={isActive("/upload") ? "page" : undefined}
          title={compact ? "New analysis" : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!compact && <span>New analysis</span>}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`nav-item ${isActive(item.path) ? "active" : ""} ${compact ? "justify-center !px-0" : ""}`}
            title={compact ? item.label : undefined}
            aria-current={isActive(item.path) ? "page" : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!compact && <span className="truncate">{item.label}</span>}
          </button>
        ))}

        {/* ── Recent datasets ── */}
        {!compact && history.length > 0 && (
          <div className="pt-5">
            <p className="section-label mb-1.5 px-2.5">Recent datasets</p>
            {history.map((item) => (
              <button
                key={item.session_id}
                onClick={() => {
                  navigate(sessionPath("/chat", item.session_id), { state: { sessionData: item } });
                  onClose?.();
                }}
                className="nav-item"
              >
                <Database className="h-4 w-4 shrink-0 text-fg-subtle" />
                <span className="min-w-0 flex-1 truncate text-left">{item.file_name}</span>
                {item.summary?.row_count != null && (
                  <span className="shrink-0 text-2xs tabular-nums text-fg-subtle">
                    {item.summary.row_count.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Bottom: settings, user, collapse ── */}
      <div className="shrink-0 space-y-0.5 border-t border-line p-3">
        {BOTTOM_NAV.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`nav-item ${isActive(item.path) ? "active" : ""} ${compact ? "justify-center !px-0" : ""}`}
            title={compact ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!compact && <span>{item.label}</span>}
          </button>
        ))}

        <div className={`flex items-center gap-2.5 px-2.5 py-1.5 ${compact ? "justify-center !px-0" : ""}`}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-sunken text-2xs font-medium text-fg-muted">
            {displayName.charAt(0).toUpperCase()}
          </span>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-sm text-fg">{displayName}</p>
              <p className="truncate text-2xs text-fg-subtle">{isGuest ? "Guest session" : (user?.email || "")}</p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className={`nav-item hidden lg:flex ${compact ? "justify-center !px-0" : ""}`}
          aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
          title={compact ? "Expand sidebar" : undefined}
        >
          {compact ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!compact && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-panel shadow-popover lg:hidden"
      >
        {renderContent(false)}
      </motion.aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-line bg-panel transition-[width] duration-150 lg:flex"
        style={{ width: collapsed ? 56 : 232 }}
      >
        {renderContent(collapsed)}
      </aside>
    </>
  );
}
