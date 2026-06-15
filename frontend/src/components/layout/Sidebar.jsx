import { useNavigate } from "react-router-dom";
import {
  LogoIcon,
  PlusIcon,
  DatabaseIcon,
  ChatIcon,
  SettingsIcon,
  CloseIcon,
} from "../ui/Icons";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { truncate, timeAgo } from "../../utils/formatters";

export default function Sidebar({ isOpen, onClose, currentSessionId }) {
  const navigate = useNavigate();
  const [history] = useLocalStorage("datapilot-datasets", []);

  const navItemClass = (active) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
        : "text-content-muted hover:text-content hover:bg-surface-overlay/60"
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col glass-strong border-r border-border-subtle/60 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-5 border-b border-border-subtle/60">
          <button
            onClick={() => { navigate("/"); onClose(); }}
            className="flex items-center gap-3 group"
            aria-label="Go to home"
          >
            <LogoIcon />
            <div className="text-left">
              <span className="font-bold text-content text-lg tracking-tight">
                Data<span className="gradient-text">Pilot</span>
              </span>
              <p className="text-[10px] text-content-subtle uppercase tracking-widest">Analytics AI</p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost p-2"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => { navigate("/"); onClose(); }}
            className="btn-primary w-full"
          >
            <PlusIcon />
            New Analysis
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-6">
          <div>
            <p className="text-[11px] font-semibold text-content-subtle uppercase tracking-wider px-3 mb-2">
              Dataset History
            </p>
            {history.length === 0 ? (
              <p className="text-xs text-content-subtle px-3 py-2">No datasets yet</p>
            ) : (
              <ul className="space-y-1">
                {history.slice(0, 8).map((item) => (
                  <li key={item.session_id}>
                    <button
                      onClick={() => {
                        navigate("/chat", { state: { sessionData: item } });
                        onClose();
                      }}
                      className={navItemClass(currentSessionId === item.session_id)}
                    >
                      <DatabaseIcon className="shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="truncate">{truncate(item.file_name, 22)}</p>
                        <p className="text-[10px] text-content-subtle">
                          {item.summary?.row_count?.toLocaleString()} rows · {timeAgo(item.uploadedAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold text-content-subtle uppercase tracking-wider px-3 mb-2">
              Recent Conversations
            </p>
            {history.length === 0 ? (
              <p className="text-xs text-content-subtle px-3 py-2">Start by uploading data</p>
            ) : (
              <ul className="space-y-1">
                {history.slice(0, 5).map((item) => (
                  <li key={`chat-${item.session_id}`}>
                    <button
                      onClick={() => {
                        navigate("/chat", { state: { sessionData: item } });
                        onClose();
                      }}
                      className={navItemClass(currentSessionId === item.session_id)}
                    >
                      <ChatIcon className="shrink-0" />
                      <span className="truncate">{truncate(item.file_name, 24)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-border-subtle/60 space-y-1">
          <button className={navItemClass(false)}>
            <SettingsIcon />
            Settings
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-surface-overlay/40">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              DP
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-content truncate">Analyst</p>
              <p className="text-[10px] text-content-subtle">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
