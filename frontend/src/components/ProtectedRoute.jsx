import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

function BrandedLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "#09090B" }}
    >
      {/* Glowing logo */}
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          boxShadow: "0 0 40px -8px rgba(99,102,241,0.7)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <BarChart3 size={28} className="text-white" />
      </motion.div>

      {/* Brand name */}
      <motion.p
        className="text-xl font-bold tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-white">Data</span>
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #818CF8, #A78BFA, #67E8F9)",
          }}
        >
          Pilot
        </span>
      </motion.p>

      {/* Progress bar */}
      <div
        className="w-32 h-0.5 rounded-full overflow-hidden"
        style={{ background: "rgba(63,63,70,0.4)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <p className="text-xs font-medium" style={{ color: "#52525B" }}>
        Verifying session…
      </p>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <BrandedLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}