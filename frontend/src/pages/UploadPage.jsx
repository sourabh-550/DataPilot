import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import { uploadFile } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  Upload,
  FileSpreadsheet,
  Brain,
  BarChart3,
  CheckCircle2,
  File,
  Rows,
  Columns,
  HardDrive,
  Database,
  Code2,
  Sparkles,
  ArrowRight,
  X,
  CloudUpload,
  AlertCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Natural Language Queries",
    description: "Ask questions in plain English — no SQL knowledge required. AI handles the rest.",
    gradient: "from-indigo-500 to-violet-600",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
  {
    icon: BarChart3,
    title: "Auto Visualizations",
    description: "AI generates stunning charts, plots, and graphs from your queries instantly.",
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
  {
    icon: Sparkles,
    title: "Smart Insights",
    description: "Automatic pattern detection, anomaly alerts, and business-ready findings.",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
];

function UploadZone({ onUpload, loading, progress }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = { current: null };

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
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card rounded-3xl p-8"
      >
        <div className="flex items-start gap-5">
          <motion.div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
              success ? "bg-emerald-500/15 border border-emerald-500/25" : "bg-indigo-500/15 border border-indigo-500/25"
            }`}
            animate={success ? { scale: [1, 1.1, 1] } : {}}
          >
            {success
              ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              : <FileSpreadsheet className="w-8 h-8 text-indigo-400" />
            }
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-white text-lg truncate">{selectedFile.name}</p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!loading && (
                <button onClick={reset} className="btn-ghost p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading && (
              <div className="mt-5">
                <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
                  <span className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </motion.div>
                    Analyzing dataset with AI...
                  </span>
                  <span className="font-semibold text-indigo-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  {["Reading file", "Processing rows", "AI analysis"].map((step, i) => (
                    <div key={step} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${progress > i * 33 ? "bg-indigo-400" : "bg-zinc-700"}`} />
                      <span className="text-xs text-zinc-500">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Analysis complete — redirecting to chat...</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && document.getElementById("fileInput").click()}
        aria-label="Upload dataset"
        className={`drop-zone relative p-12 sm:p-16 text-center ${dragging ? "dragging" : ""}`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-indigo-500/5"
            />
          )}
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-8, 8, -8],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <motion.div
          animate={dragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all duration-300 ${
            dragging
              ? "bg-indigo-500/20 border-2 border-indigo-500/50 shadow-glow"
              : "bg-zinc-900 border border-zinc-800"
          }`}
        >
          <motion.div
            animate={dragging ? { y: [-2, 2, -2] } : { y: 0 }}
            transition={{ duration: 0.5, repeat: dragging ? Infinity : 0 }}
          >
            <CloudUpload className={`w-10 h-10 ${dragging ? "text-indigo-400" : "text-zinc-500"}`} />
          </motion.div>
        </motion.div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {dragging ? "Drop your file here ✨" : "Drag & drop your dataset"}
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          or click to browse · CSV, XLSX, XLS · Max 10MB
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["CSV", "XLSX", "XLS"].map((fmt) => (
            <span key={fmt} className="badge-muted font-mono text-xs">
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>

        <motion.button
          className="btn-primary gap-2 px-6 py-2.5 rounded-2xl pointer-events-none"
          whileHover={{ scale: 1.03 }}
        >
          <Upload className="w-4 h-4" />
          Choose File
        </motion.button>

        <input
          id="fileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [, setHistory] = useLocalStorage("datapilot-datasets", []);

  const handleUpload = async (file) => {
    setLoading(true);
    setProgress(0);
    try {
      const data = await uploadFile(file, (pct) => setProgress(pct));
      const entry = { ...data, uploadedAt: new Date().toISOString() };
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.session_id !== data.session_id);
        return [entry, ...filtered].slice(0, 20);
      });
      addToast("Dataset uploaded successfully!", "success");
      setProgress(100);
      setTimeout(() => navigate("/chat", { state: { sessionData: data } }), 800);
      return true;
    } catch {
      addToast("Upload failed. Please try again.", "error");
      setLoading(false);
      setProgress(0);
      return false;
    }
  };

  return (
    <DashboardLayout title="Upload Dataset" subtitle="Import your data to start AI-powered analysis">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/12 border border-indigo-500/20 mb-5">
            <CloudUpload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">AI-Powered Data Import</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Upload your dataset
          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Upload a CSV or Excel file. Our AI will analyze your data, detect patterns,
            and prepare it for intelligent querying.
          </p>
        </motion.section>

        {/* Upload Zone */}
        <UploadZone onUpload={handleUpload} loading={loading} progress={progress} />

        {/* SQL Mode Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate("/sql")}
            className="btn-outline gap-2 px-6 py-3 rounded-2xl group"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Switch to SQL Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="card rounded-2xl p-6 group hover:border-zinc-700 transition-all duration-300"
              whileHover={{ y: -3 }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-glow-sm group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>
      </div>
    </DashboardLayout>
  );
}
