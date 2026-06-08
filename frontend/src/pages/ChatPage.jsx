import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ChatBox from "../components/ChatBox";
import InsightCard from "../components/InsightCard";

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state?.sessionData;

  useEffect(() => {
    if (!sessionData) navigate("/");
  }, [sessionData, navigate]);

  if (!sessionData) return null;

  const { session_id, file_name, summary, insights } = sessionData;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">
          Data<span className="text-blue-500">Pilot</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">📄 {file_name}</span>
          <span className="text-gray-500 text-xs">
            {summary.row_count} rows × {summary.col_count} cols
          </span>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Upload New File
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 overflow-y-auto space-y-4">
          {/* Dataset Info */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              📊 Dataset Info
            </h2>
            <div className="space-y-2">
              {summary.columns.map((col) => (
                <div key={col.name} className="bg-gray-800 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{col.name}</span>
                    <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full">
                      {col.dtype}
                    </span>
                  </div>
                  {col.null_count > 0 && (
                    <p className="text-red-400 text-xs mt-1">⚠ {col.null_count} nulls</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {insights?.length > 0 && <InsightCard insights={insights} />}
        </div>

        {/* Right — Chat */}
        <div className="flex-1 bg-gray-900 rounded-2xl p-5 flex flex-col overflow-hidden">
          <ChatBox sessionId={session_id} />
        </div>
      </div>
    </div>
  );
}