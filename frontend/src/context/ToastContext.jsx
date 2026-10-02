import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

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

// Neutral panel for every type; only the icon carries the status colour.
const TOAST_CONFIG = {
  success: { icon: CheckCircle2, iconColor: "text-positive" },
  error: { icon: XCircle, iconColor: "text-negative" },
  info: { icon: Info, iconColor: "text-accent-text" },
};
TOAST_CONFIG.ai = TOAST_CONFIG.info; // legacy type name

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col items-end gap-2 sm:left-auto"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto flex w-full items-start gap-2.5 rounded-lg border border-line bg-panel px-3 py-2.5 shadow-popover sm:w-80"
              role="alert"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconColor}`} />
              <p className="flex-1 text-sm text-fg">{toast.message}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded p-0.5 text-fg-subtle transition-colors hover:text-fg"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
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
