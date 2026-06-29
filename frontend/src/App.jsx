import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import SQLPage from "./pages/SQLPage";   

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/sql" element={<SQLPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}