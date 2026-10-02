import { useEffect, useRef, useState, useCallback } from "react";
import { Download, Maximize2, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Reads the current theme's tokens (see index.css) so charts match light/dark.
function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const rgb = (name) => `rgb(${css.getPropertyValue(name).trim().split(/\s+/).join(",")})`;
  return {
    palette: Array.from({ length: 8 }, (_, i) => css.getPropertyValue(`--chart-${i + 1}`).trim()),
    text: rgb("--fg-muted"),
    subtle: rgb("--fg-subtle"),
    grid: rgb("--line"),
    panel: rgb("--panel"),
    fg: rgb("--fg"),
  };
}

// The backend's Plotly Express figures carry Plotly's default template, which
// writes default colours into each trace. Drop the template and single-colour
// trace values so our validated palette (layout.colorway) applies in order.
// Arrays are left alone — they encode data, not series identity.
function applyTheme(chartData, c) {
  const data = (chartData.data || []).map((trace) => {
    const t = { ...trace };
    if (t.marker && typeof t.marker.color === "string") t.marker = { ...t.marker, color: undefined };
    if (t.line && typeof t.line.color === "string") t.line = { ...t.line, color: undefined };
    return t;
  });

  const axis = (a = {}) => ({
    ...a,
    gridcolor: c.grid,
    linecolor: c.grid,
    zerolinecolor: c.grid,
    tickfont: { color: c.subtle, size: 11 },
    title: { ...(a.title || {}), font: { color: c.text, size: 12 } },
    automargin: true,
  });

  const layout = {
    ...chartData.layout,
    template: undefined,
    colorway: c.palette,
    piecolorway: c.palette,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Inter, system-ui, sans-serif", color: c.text, size: 12 },
    title: { ...(chartData.layout?.title || {}), font: { color: c.fg, size: 14 }, x: 0, xanchor: "left", pad: { l: 4 } },
    margin: { t: 44, l: 48, r: 16, b: 44 },
    legend: { bgcolor: "rgba(0,0,0,0)", font: { color: c.text, size: 11 } },
    hoverlabel: { bgcolor: c.panel, bordercolor: c.grid, font: { color: c.fg, family: "Inter, system-ui, sans-serif", size: 12 } },
    bargap: 0.3,
    barcornerradius: 4,
    xaxis: axis(chartData.layout?.xaxis),
    yaxis: axis(chartData.layout?.yaxis),
  };
  return { data, layout };
}

export default function ChartViewer({ chartJson }) {
  const { theme } = useTheme();
  const plotRef = useRef(null);
  const plotlyRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const renderChart = useCallback((element) => {
    if (!chartJson || !element) return;
    try {
      const { data, layout } = applyTheme(JSON.parse(chartJson), themeColors());
      import("plotly.js-dist-min").then((Plotly) => {
        plotlyRef.current = Plotly;
        Plotly.newPlot(element, data, layout, { responsive: true, displayModeBar: false })
          .then(() => setLoaded(true));
      });
    } catch (e) {
      console.error("Chart error:", e);
    }
    // theme: re-draw with the other palette when the user switches themes
  }, [chartJson, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const element = plotRef.current;
    renderChart(element);
    return () => {
      if (element && plotlyRef.current) {
        plotlyRef.current.purge(element);
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
      {fullscreen && (
        <div className="fixed inset-0 z-[190] bg-black/40" onClick={() => setFullscreen(false)} />
      )}
      <div
        className={`overflow-hidden rounded-lg border border-line bg-panel ${
          fullscreen ? "fixed inset-4 z-[200] flex flex-col shadow-popover sm:inset-8" : "relative"
        }`}
      >
        <div className="flex h-9 items-center justify-end gap-0.5 border-b border-line px-1.5">
          <button onClick={handleDownload} className="btn-icon h-7 w-7" title="Download PNG" aria-label="Download chart as PNG">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="btn-icon h-7 w-7"
            title={fullscreen ? "Exit full screen" : "Full screen"}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <X className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!loaded && (
          <div className="absolute inset-0 top-9 flex items-center justify-center text-xs text-fg-subtle">
            Rendering chart…
          </div>
        )}

        <div
          ref={plotRef}
          style={{ width: "100%", height: fullscreen ? "calc(100% - 36px)" : "340px" }}
          className={`flex-1 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </>
  );
}
