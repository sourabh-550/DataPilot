import { useState, useRef } from "react";
import { UploadIcon, CheckIcon, FileIcon } from "./ui/Icons";
import Badge from "./ui/Badge";
import { formatFileSize } from "../utils/formatters";

export default function FileUpload({ onUpload, loading, progress = 0 }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      onUpload(null, "Only CSV and Excel files are supported.");
      return;
    }

    setSelectedFile(file);
    setSuccess(false);
    const result = await onUpload(file);
    if (result !== false) {
      setSuccess(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setSelectedFile(null);
    setSuccess(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      {!selectedFile || (!loading && !success) ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload dataset file"
          className={`relative gradient-border rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 group
            ${dragging
              ? "scale-[1.02] shadow-glow"
              : "hover:shadow-card-hover hover:scale-[1.01]"
            }`}
        >
          <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
            ${dragging
              ? "bg-indigo-500/20 text-indigo-300 animate-float"
              : "bg-surface-overlay text-content-muted group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
            }`}
          >
            <UploadIcon className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-content mb-2">
            {dragging ? "Drop to upload" : "Drag & drop your dataset"}
          </h2>
          <p className="text-content-muted text-sm mb-6">
            or click to browse · CSV, XLSX, XLS · max 10MB
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {["CSV", "XLSX", "XLS"].map((fmt) => (
              <Badge key={fmt} variant="muted">{fmt}</Badge>
            ))}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="glass rounded-3xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300
              ${success ? "bg-emerald-500/15 text-emerald-400" : "bg-indigo-500/15 text-indigo-400"}`}
            >
              {success ? <CheckIcon /> : <FileIcon />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-content truncate">{selectedFile.name}</p>
              <p className="text-sm text-content-muted mt-0.5">
                {formatFileSize(selectedFile.size)}
              </p>

              {loading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-content-muted mb-2">
                    <span>Analyzing dataset...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {success && (
                <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4" />
                  Ready — redirecting to analysis...
                </p>
              )}
            </div>

            {!loading && (
              <button onClick={reset} className="btn-ghost text-xs shrink-0">
                Change file
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
