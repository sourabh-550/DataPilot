import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({
  children,
  title,
  subtitle,
  sessionId,
  searchValue,
  onSearchChange,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSessionId={sessionId}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
