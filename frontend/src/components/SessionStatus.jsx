import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Upload, History } from "lucide-react";

// Shown while a dataset session is being fetched (History link, refresh, bookmark).
export function SessionLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-zinc-500">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      <p className="text-sm">Opening your dataset…</p>
    </div>
  );
}

// Shown when a session can't be opened (deleted, not yours, or file missing).
export function SessionError({ message }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="card rounded-2xl p-6 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white mb-1">Couldn't open this dataset</h2>
          <p className="text-sm text-zinc-400">{message}</p>
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={() => navigate("/history")} className="btn-outline gap-2 rounded-xl text-sm px-4 py-2">
            <History className="w-4 h-4" /> History
          </button>
          <button onClick={() => navigate("/upload")} className="btn-primary gap-2 rounded-xl text-sm px-4 py-2">
            <Upload className="w-4 h-4" /> Upload a dataset
          </button>
        </div>
      </div>
    </div>
  );
}
