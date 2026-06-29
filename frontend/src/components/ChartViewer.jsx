import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Maximize2, X } from "lucide-react";

export default function ChartViewer({ chartJson }) {
  const plotRef = useRef(null);
  const plotlyRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
            font: { color: "#A1A1AA", family: "Inter, system-ui, sans-serif", size: 12 },
            margin: { t: 48, l: 52, r: 20, b: 52 },
            legend: {
              bgcolor: "transparent",
              font: { color: "#71717A", size: 11 },
            },
            xaxis: {
              gridcolor: "rgba(63,63,70,0.4)",
              linecolor: "rgba(63,63,70,0.3)",
              tickcolor: "rgba(63,63,70,0.3)",
              ...chartData.layout?.xaxis,
            },
            yaxis: {
              gridcolor: "rgba(63,63,70,0.4)",
              linecolor: "rgba(63,63,70,0.3)",
              tickcolor: "rgba(63,63,70,0.3)",
              ...chartData.layout?.yaxis,
            },
          },
          { responsive: true, displayModeBar: false }
        ).then(() => setLoaded(true));
      });
    } catch (e) {
      console.error("Chart error:", e);
    }
  }, [chartJson]);

  useEffect(() => {
    setLoaded(false);
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
      width: 1400,
      height: 800,
      filename: "datapilot-chart",
    });
  };

  if (!chartJson) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/50 group ${
          fullscreen ? "fixed inset-4 sm:inset-8 z-[200] flex flex-col" : "mt-3"
        }`}
      >
        {fullscreen && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md -z-10"
            onClick={() => setFullscreen(false)}
          />
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-xs text-zinc-500 ml-2">DataPilot Chart</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDownload}
              className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 text-xs gap-1.5 flex items-center"
              title="Download PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Export</span>
            </button>
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <X className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Skeleton while loading */}
        {!loaded && (
          <div className="absolute inset-0 top-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-zinc-500">Rendering chart...</span>
            </div>
          </div>
        )}

        <div
          ref={plotRef}
          style={{ width: "100%", height: fullscreen ? "calc(100% - 44px)" : "380px" }}
          className={`flex-1 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </motion.div>
    </>
  );
}
