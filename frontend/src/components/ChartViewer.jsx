import { useEffect, useRef } from "react";

export default function ChartViewer({ chartJson }) {
  const plotRef = useRef(null);

  useEffect(() => {
    if (!chartJson || !plotRef.current) return;

    try {
      const chartData = JSON.parse(chartJson);
      import("plotly.js-dist-min").then((Plotly) => {
        Plotly.newPlot(plotRef.current, chartData.data, {
          ...chartData.layout,
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "#e5e7eb" },
          margin: { t: 40, l: 40, r: 20, b: 40 },
        }, { responsive: true, displayModeBar: false });
      });
    } catch (e) {
      console.error("Chart error:", e);
    }
  }, [chartJson]);

  if (!chartJson) return null;

  return (
    <div
      ref={plotRef}
      style={{ width: "100%", height: "350px" }}
      className="mt-4 rounded-2xl overflow-hidden"
    />
  );
}