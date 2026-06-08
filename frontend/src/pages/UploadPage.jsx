import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../services/api";

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Only CSV and Excel files are supported.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await uploadFile(file);
      // Pass session data to chat page
      navigate("/chat", { state: { sessionData: data } });
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-white">
          Data<span className="text-blue-500">Pilot</span>
        </h1>
        <p className="text-gray-400 mt-3 text-lg">
          Your AI-powered data analyst — just upload and ask.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${dragging
            ? "border-blue-500 bg-blue-950"
            : "border-gray-700 bg-gray-900 hover:border-blue-600 hover:bg-gray-800"
          }`}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="text-6xl mb-4">📂</div>
        <p className="text-white text-xl font-semibold mb-2">
          Drop your file here
        </p>
        <p className="text-gray-400 text-sm">
          Supports CSV, XLSX, XLS — max 10MB
        </p>
        <input
          id="fileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-blue-400">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing your dataset...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 text-red-400 text-sm">{error}</p>
      )}

      {/* Supported formats */}
      <div className="mt-10 flex gap-4">
        {["CSV", "XLSX", "XLS"].map((fmt) => (
          <span
            key={fmt}
            className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-xs"
          >
            {fmt}
          </span>
        ))}
      </div>
    </div>
  );
}