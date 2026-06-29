import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({ children, title, subtitle, sessionId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        currentSessionId={sessionId}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 overflow-auto scrollbar-thin"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
