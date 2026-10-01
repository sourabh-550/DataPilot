import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Zap,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function TopNavbar({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isGuest, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive display name and subtitle from the Supabase user.
  // Guests (anonymous sign-in) have email "" — use || so empty strings fall through.
  const userEmail = isGuest ? "Guest session" : (user?.email || "");
  const userName =
    user?.user_metadata?.full_name ||
    (isGuest ? "Guest" : user?.email?.split("@")[0]) ||
    "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate("/login");
  };

  // Click outside handler
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" / ") || "Dashboard";
  };

  return (
    <header className="glass-strong border-b border-zinc-800/60 px-4 lg:px-6 py-3 flex items-center gap-4 shrink-0 z-30 sticky top-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-ghost p-2 -ml-1 rounded-xl"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title / Breadcrumb */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400 shrink-0 hidden sm:block" />
          <h1 className="text-sm font-semibold text-white truncate">
            {title || getBreadcrumb()}
          </h1>
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-500 truncate mt-0.5 hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2 relative">
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative overflow-hidden"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                ref={searchRef}
                autoFocus
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search datasets, queries..."
                className="input-field pl-9 py-2 text-sm w-full"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchValue(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="btn-ghost gap-2 px-3 py-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 text-sm"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">⌘K</kbd>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search */}
        <button
          className="md:hidden btn-ghost p-2 rounded-xl"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* AI Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">AI Ready</span>
        </div>

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-xl border border-zinc-800 hover:border-zinc-700"
          whileHover={{ rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle theme"
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4" />
          }
        </motion.button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
              {userInitial}
            </div>
            <span className="text-xs font-medium text-zinc-300 hidden sm:block">{userName}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500 hidden sm:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 glass-strong border border-zinc-800 rounded-2xl shadow-card overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
                  <span className="badge-primary text-[10px] mt-2">Pro Plan</span>
                </div>
                <div className="py-2">
                  {[
                    { icon: User, label: "Profile", action: () => { navigate("/settings"); setProfileOpen(false); } },
                    { icon: Settings, label: "Settings", action: () => { navigate("/settings"); setProfileOpen(false); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="py-2 border-t border-zinc-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
