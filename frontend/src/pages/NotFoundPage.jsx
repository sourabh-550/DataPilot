import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart3, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4"
      style={{ background: "#09090B" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          boxShadow: "0 0 40px -8px rgba(99,102,241,0.6)",
        }}
      >
        <BarChart3 size={28} className="text-white" />
      </motion.div>

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <p className="text-7xl font-bold text-white mb-3">404</p>
        <h1 className="text-xl font-semibold text-zinc-300 mb-2">Page not found</h1>
        <p className="text-zinc-500 text-sm max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="flex gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
      </motion.div>
    </div>
  );
}
