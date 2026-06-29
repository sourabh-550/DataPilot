import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X, Sparkles } from "lucide-react";

const ToastContext = createContext(null);
let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    text: "text-red-300",
    iconColor: "text-red-400",
  },
  info: {
    icon: Info,
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    iconColor: "text-indigo-400",
  },
  ai: {
    icon: Sparkles,
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    iconColor: "text-violet-400",
  },
};

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full sm:max-w-sm pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`glass-strong rounded-2xl px-4 py-3.5 border shadow-card flex items-start gap-3 pointer-events-auto ${config.border} ${config.bg}`}
              role="alert"
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
              <p className={`text-sm flex-1 font-medium ${config.text}`}>{toast.message}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 p-0.5"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
