import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  User,
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

  const [profileOpen, setProfileOpen] = useState(false);
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
    <header className="relative z-30 flex h-12 shrink-0 items-center gap-3 border-b border-line bg-panel px-3 sm:px-4">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="btn-icon lg:hidden" aria-label="Open navigation">
        <Menu className="h-4 w-4" />
      </button>

      {/* Title */}
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <h1 className="truncate text-sm font-semibold text-fg">{title || getBreadcrumb()}</h1>
        {subtitle && (
          <p className="hidden truncate text-sm text-fg-subtle sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-8 items-center gap-2 rounded-md px-1.5 transition-colors hover:bg-sunken"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-sunken text-2xs font-medium text-fg-muted">
              {userInitial}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm text-fg sm:block">{userName}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-fg-subtle sm:block" />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-line bg-panel py-1 shadow-popover"
            >
              <div className="border-b border-line px-3 py-2">
                <p className="truncate text-sm font-medium text-fg">{userName}</p>
                <p className="truncate text-2xs text-fg-subtle">{userEmail}</p>
              </div>
              <div className="py-1">
                {[
                  { icon: User, label: "Profile", action: () => { navigate("/settings"); setProfileOpen(false); } },
                  { icon: Settings, label: "Settings", action: () => { navigate("/settings"); setProfileOpen(false); } },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    role="menuitem"
                    onClick={action}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="border-t border-line py-1">
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm text-negative transition-colors hover:bg-sunken"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
