import { useNavigate } from "react-router-dom";
import { AlertCircle, Upload, History } from "lucide-react";

// Shown while a dataset session is being fetched (History link, refresh, bookmark).
export function SessionLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-fg-subtle" role="status">
      Opening your dataset…
    </div>
  );
}

// Shown when a session can't be opened (deleted, not yours, or file missing).
export function SessionError({ message }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-negative" />
          <div>
            <h2 className="text-sm font-semibold text-fg">Couldn't open this dataset</h2>
            <p className="mt-1 text-sm text-fg-muted">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => navigate("/history")} className="btn-secondary">
            <History className="h-4 w-4" /> History
          </button>
          <button onClick={() => navigate("/upload")} className="btn-primary">
            <Upload className="h-4 w-4" /> Upload a dataset
          </button>
        </div>
      </div>
    </div>
  );
}
