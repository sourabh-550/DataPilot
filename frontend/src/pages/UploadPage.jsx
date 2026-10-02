import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { uploadFile } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { addRecentDataset } from "../utils/recentDatasets";
import { sessionPath } from "../hooks/useSessionData";
import { formatFileSize } from "../utils/formatters";
import { Upload, FileSpreadsheet, CheckCircle2, X, AlertCircle, ArrowRight } from "lucide-react";

function UploadZone({ onUpload, loading, progress }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Only CSV and Excel files are supported.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setSuccess(false);
    const result = await onUpload(file);
    if (result !== false) setSuccess(true);
  }, [onUpload]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setSelectedFile(null);
    setSuccess(false);
    setError(null);
  };

  if (selectedFile && (loading || success)) {
    const uploading = loading && progress < 100;
    return (
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-fg-subtle" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg">{selectedFile.name}</p>
                <p className="text-xs tabular-nums text-fg-subtle">{formatFileSize(selectedFile.size)}</p>
              </div>
              {!loading && (
                <button onClick={reset} className="btn-icon h-7 w-7" aria-label="Choose another file">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {loading && (
              <div className="mt-4" role="status">
                <div className="mb-1.5 flex justify-between text-xs text-fg-muted">
                  <span>{uploading ? "Uploading" : "Analyzing columns and generating insights…"}</span>
                  {uploading && <span className="tabular-nums">{Math.round(progress)}%</span>}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div
                    className={`h-full rounded-full bg-accent transition-[width] duration-300 ${uploading ? "" : "animate-pulse"}`}
                    style={{ width: `${uploading ? progress : 100}%` }}
                  />
                </div>
              </div>
            )}

            {success && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-positive" role="status">
                <CheckCircle2 className="h-4 w-4" />
                Done — opening chat…
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Upload dataset"
        className={`drop-zone flex flex-col items-center px-6 py-14 text-center ${dragging ? "dragging" : ""}`}
      >
        <Upload className="h-7 w-7 text-fg-subtle" />
        <p className="mt-3 text-sm font-medium text-fg">
          {dragging ? "Drop the file to upload" : "Drag and drop a file, or click to browse"}
        </p>
        <p className="mt-1 text-sm text-fg-muted">.csv, .xlsx or .xls · up to 10 MB</p>
        <span className="btn-secondary pointer-events-none mt-5">Choose file</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-negative/25 bg-negative/10 px-3 py-2 text-sm text-negative" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto rounded p-0.5 hover:bg-negative/10" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const handleUpload = async (file) => {
    setLoading(true);
    setProgress(0);
    try {
      const data = await uploadFile(file, (pct) => setProgress(pct));
      addRecentDataset(user?.id, { ...data, uploadedAt: new Date().toISOString() });
      addToast("Dataset uploaded successfully!", "success");
      setProgress(100);
      setTimeout(() => navigate(sessionPath("/chat", data.session_id), { state: { sessionData: data } }), 800);
      return true;
    } catch {
      addToast("Upload failed. Please try again.", "error");
      setLoading(false);
      setProgress(0);
      return false;
    }
  };

  return (
    <DashboardLayout title="Upload dataset" subtitle="CSV or Excel">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h2 className="text-xl font-semibold text-fg">Upload a dataset</h2>
        <p className="mb-6 mt-1 text-sm text-fg-muted">
          You'll get a column summary and four insights, then you can ask questions about the data.
        </p>

        <UploadZone onUpload={handleUpload} loading={loading} progress={progress} />

        <button
          onClick={() => navigate("/sql")}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
        >
          Have a SQLite file or a database? Use the SQL workspace
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </DashboardLayout>
  );
}
