import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import FileUpload from "../components/FileUpload";
import { uploadFile } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SparklesIcon, ChartIcon, DatabaseIcon } from "../components/ui/Icons";
import Card from "../components/ui/Card";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Natural Language",
    description: "Ask questions in plain English — no SQL required.",
  },
  {
    icon: ChartIcon,
    title: "Auto Visualizations",
    description: "AI generates charts and graphs from your queries instantly.",
  },
  {
    icon: DatabaseIcon,
    title: "Smart Insights",
    description: "Automatic pattern detection and business-ready findings.",
  },
];

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [, setHistory] = useLocalStorage("datapilot-datasets", []);

  const handleUpload = async (file, validationError) => {
    if (validationError) {
      addToast(validationError, "error");
      return false;
    }
    if (!file) return false;

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

      setTimeout(() => {
        navigate("/chat", { state: { sessionData: data } });
      }, 800);

      return true;
    } catch {
      addToast("Upload failed. Please try again.", "error");
      setLoading(false);
      setProgress(0);
      return false;
    }
  };

  return (
    <DashboardLayout
      title="Welcome to DataPilot"
      subtitle="Upload a dataset to start your AI-powered analysis"
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-10">
        <section className="text-center animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-content tracking-tight mb-3">
            Analyze data with{" "}
            <span className="gradient-text">natural language</span>
          </h2>
          <p className="text-content-muted text-base sm:text-lg max-w-xl mx-auto">
            Upload your CSV or Excel file and chat with an AI analyst that understands your data.
          </p>
        </section>

        <FileUpload onUpload={handleUpload} loading={loading} progress={progress} />

        <section className="grid sm:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <Card key={feature.title} hover className={`animate-fade-in-up stagger-${i + 1}`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-content mb-1.5">{feature.title}</h3>
              <p className="text-sm text-content-muted leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
