import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({ children, title, subtitle, sessionId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // App shell: exactly one viewport tall (dvh handles mobile browser bars).
  // Only <main> scrolls, so the sidebar and top bar always stay in place.
  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        currentSessionId={sessionId}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNavbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
