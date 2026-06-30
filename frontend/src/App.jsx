import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import SQLPage from "./pages/SQLPage";
import DashboardPage from "./pages/DashboardPage";
import VisualizationsPage from "./pages/VisualizationsPage";
import ReportsPage from "./pages/ReportsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import DataExplorerPage from "./pages/DataExplorerPage";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected */}
              <Route path="/" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute><UploadPage /></ProtectedRoute>
              } />
              <Route path="/explorer" element={
                <ProtectedRoute><DataExplorerPage /></ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute><ChatPage /></ProtectedRoute>
              } />
              <Route path="/sql" element={
                <ProtectedRoute><SQLPage /></ProtectedRoute>
              } />
              <Route path="/visualizations" element={
                <ProtectedRoute><VisualizationsPage /></ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute><ReportsPage /></ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute><HistoryPage /></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}