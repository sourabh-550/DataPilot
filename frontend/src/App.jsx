import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

// Pages
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import SQLPage from "./pages/SQLPage";
import VisualizationsPage from "./pages/VisualizationsPage";
import ReportsPage from "./pages/ReportsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import DataExplorerPage from "./pages/DataExplorerPage";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/sql" element={<SQLPage />} />
            <Route path="/explorer" element={<DataExplorerPage />} />
            <Route path="/visualizations" element={<VisualizationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}