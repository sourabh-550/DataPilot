import { BarChart3, Database, FileSpreadsheet } from "lucide-react";

// Totals from the sample sales dataset (sales by region), largest first —
// the same order the real chart tool draws them in.
const EXAMPLE_BARS = [
  { label: "North", value: 271352 },
  { label: "West", value: 244952 },
  { label: "South", value: 206458 },
  { label: "East", value: 171219 },
];

const CAPABILITIES = [
  { icon: FileSpreadsheet, text: "CSV and Excel questions, answered with pandas" },
  { icon: Database, text: "SQL questions on SQLite files, behind a read-only guard" },
  { icon: BarChart3, text: "Bar, line, scatter, pie and histogram charts in one request" },
];

const fmt = (n) => n.toLocaleString("en-US");

// A static picture of one chat exchange. Drawn with CSS so the login page
// never loads Plotly; bars use the first chart palette colour like real charts.
function ExampleChart() {
  const max = Math.max(...EXAMPLE_BARS.map((b) => b.value));
  const summary = EXAMPLE_BARS.map((b) => `${b.label} ${fmt(b.value)}`).join(", ");

  return (
    <div role="img" aria-label={`Bar chart, sales by region: ${summary}`}>
      <p className="text-xs font-medium text-fg">Sales by region</p>
      <div className="relative mt-3 flex h-36 items-end gap-4 border-b border-line px-2">
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            className="pointer-events-none absolute inset-x-0 border-t border-line/70"
            style={{ bottom: `${pct}%` }}
            aria-hidden="true"
          />
        ))}
        {EXAMPLE_BARS.map((bar) => (
          <div key={bar.label} className="relative flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-1 text-2xs tabular-nums text-fg-muted">{fmt(bar.value)}</span>
            <div
              className="w-full max-w-12 rounded-t-sm"
              style={{ height: `${(bar.value / max) * 82}%`, backgroundColor: "var(--chart-1)" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-4 px-2" aria-hidden="true">
        {EXAMPLE_BARS.map((bar) => (
          <span key={bar.label} className="flex-1 text-center text-2xs text-fg-subtle">{bar.label}</span>
        ))}
      </div>
    </div>
  );
}

function DotPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full text-line-strong opacity-30" aria-hidden="true">
      <defs>
        <pattern id="login-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-dots)" />
    </svg>
  );
}

export default function LoginShowcase() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-line bg-sunken lg:flex lg:flex-col">
      <DotPattern />

      <div className="relative flex items-center gap-2 px-10 pt-8">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
          <BarChart3 className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold text-fg">DataPilot</span>
      </div>

      <div className="relative flex flex-1 items-center px-10 py-10">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-xl font-semibold text-fg">Ask questions about your data in plain English</h2>

          <figure className="card mt-6">
            <div className="flex h-11 items-center border-b border-line px-4">
              <span className="section-label">Example from the sample sales dataset</span>
            </div>
            <div className="space-y-4 p-4">
              <div className="flex justify-end">
                <div className="rounded-lg border border-line bg-sunken px-3 py-2 text-sm text-fg">
                  Bar chart of sales by region
                </div>
              </div>
              <p className="text-sm text-fg">
                North has the highest total sales at 271,352, followed by West, South and East.
              </p>
              <ExampleChart />
            </div>
          </figure>

          <ul className="mt-6 space-y-2.5">
            {CAPABILITIES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-fg-muted">
                <Icon className="h-4 w-4 shrink-0 text-fg-subtle" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
