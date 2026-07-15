import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Upload,
  Table2,
  MessageSquare,
  Code2,
  BarChart3,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Database,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload Dataset", icon: Upload, path: "/upload" },
  { label: "Data Explorer", icon: Table2, path: "/explorer" },
  { label: "AI Chat", icon: MessageSquare, path: "/chat" },
  { label: "SQL Workspace", icon: Code2, path: "/sql" },
  { label: "Visualizations", icon: BarChart3, path: "/visualizations" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "History", icon: History, path: "/history" },
];

const BOTTOM_NAV = [
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("datapilot-datasets") || "[]");
      setHistory(stored.slice(0, 5));
    } catch { setHistory([]); }
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-800/60 shrink-0">
        <motion.button
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">
                  Data<span className="gradient-text">Pilot</span>
                </span>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                  Analytics AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Mobile close / Desktop collapse */}
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost p-1.5 rounded-lg"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex btn-ghost p-1.5 rounded-lg"
            aria-label="Toggle sidebar"
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* ── New Analysis Button ── */}
      <div className={`px-3 py-4 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        <motion.button
          onClick={() => handleNavigate("/upload")}
          className={`btn-primary ${collapsed ? "!px-2.5 !py-2.5 !rounded-xl" : "w-full"}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Analysis</span>}
        </motion.button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2 mt-1">
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`nav-item ${active ? "active" : ""} ${collapsed ? "justify-center !px-2.5" : ""}`}
              whileHover={{ x: collapsed ? 0 : 2 }}
              whileTap={{ scale: 0.97 }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                />
              )}
            </motion.button>
          );
        })}

        {/* ── Recent Datasets ── */}
        {!collapsed && history.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2">
              Recent Datasets
            </p>
            {history.map((item) => (
              <motion.button
                key={item.session_id}
                onClick={() => {
                  navigate("/chat", { state: { sessionData: item } });
                  onClose?.();
                }}
                className="nav-item w-full"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-4 h-4 rounded bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Database className="w-2.5 h-2.5 text-indigo-400" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="truncate text-xs">{item.file_name}</p>
                  <p className="text-[10px] text-zinc-600">
                    {item.summary?.row_count?.toLocaleString()} rows
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Bottom: Settings + User ── */}
      <div className={`px-3 py-4 border-t border-zinc-800/60 space-y-1 shrink-0`}>
        {BOTTOM_NAV.map((item) => (
          <motion.button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`nav-item ${isActive(item.path) ? "active" : ""} ${collapsed ? "justify-center !px-2.5" : ""}`}
            whileHover={{ x: collapsed ? 0 : 2 }}
            whileTap={{ scale: 0.97 }}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </motion.button>
        ))}

        {/* User Card */}
        {(() => {
          const displayName =
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split("@")[0] ||
            "User";
          const initial = displayName.charAt(0).toUpperCase();
          return (
            <div className={`flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 ${collapsed ? "justify-center px-0" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm">
                {initial}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email || ""}</p>
                </div>
              )}
            </div>
          );
        })()}
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed inset-y-0 left-0 z-50 w-72 glass-strong border-r border-zinc-800/60 lg:hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 264 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="hidden lg:flex flex-col glass-strong border-r border-zinc-800/60 h-screen sticky top-0 overflow-hidden shrink-0"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
