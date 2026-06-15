import { useEffect, useRef, useState, useCallback } from "react";
import { DownloadIcon, ExpandIcon, CloseIcon } from "./ui/Icons";

export default function ChartViewer({ chartJson }) {
  const plotRef = useRef(null);
  const plotlyRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  const renderChart = useCallback((element) => {
    if (!chartJson || !element) return;

    try {
      const chartData = JSON.parse(chartJson);
      import("plotly.js-dist-min").then((Plotly) => {
        plotlyRef.current = Plotly;
        Plotly.newPlot(
          element,
          chartData.data,
          {
            ...chartData.layout,
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#c4c4d4", family: "Inter, sans-serif" },
            margin: { t: 48, l: 48, r: 24, b: 48 },
          },
          { responsive: true, displayModeBar: false }
        );
      });
    } catch (e) {
      console.error("Chart error:", e);
    }
  }, [chartJson]);

  useEffect(() => {
    renderChart(plotRef.current);
    return () => {
      if (plotRef.current && plotlyRef.current) {
        plotlyRef.current.purge(plotRef.current);
      }
    };
  }, [renderChart]);

  useEffect(() => {
    if (fullscreen && plotRef.current && plotlyRef.current) {
      setTimeout(() => plotlyRef.current.Plots.resize(plotRef.current), 100);
    }
  }, [fullscreen]);

  const handleDownload = () => {
    if (!plotRef.current || !plotlyRef.current) return;
    plotlyRef.current.downloadImage(plotRef.current, {
      format: "png",
      width: 1200,
      height: 700,
      filename: "datapilot-chart",
    });
  };

  if (!chartJson) return null;

  return (
    <div
      className={`mt-4 glass rounded-2xl p-4 border border-border-subtle/40 animate-fade-in relative group ${
        fullscreen ? "fixed inset-4 sm:inset-8 z-[200] flex flex-col" : ""
      }`}
    >
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md -z-10"
          onClick={() => setFullscreen(false)}
          aria-hidden="true"
        />
      )}

      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
        <button
          onClick={handleDownload}
          className="p-2 rounded-xl glass-strong text-content-muted hover:text-content transition-colors"
          aria-label="Download chart"
          title="Download PNG"
        >
          <DownloadIcon />
        </button>
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="p-2 rounded-xl glass-strong text-content-muted hover:text-content transition-colors"
          aria-label={fullscreen ? "Exit fullscreen" : "View fullscreen"}
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <CloseIcon /> : <ExpandIcon />}
        </button>
      </div>

      <div
        ref={plotRef}
        style={{ width: "100%", height: fullscreen ? "calc(100% - 2rem)" : "380px" }}
        className="rounded-xl overflow-hidden flex-1"
      />
    </div>
  );
}
