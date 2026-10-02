import { useMemo, useState } from "react";
import { uploadSQLiteDB, connectSQLDB, sendSQLMessage } from "../services/api";
import ChartViewer from "../components/ChartViewer";
import ResultTable from "../components/ResultTable";
import MessageContent from "../components/MessageContent";
import DashboardLayout from "../components/layout/DashboardLayout";
import { buildSqlExamples } from "../utils/sqlExamples";
import {
  Database,
  Upload,
  Plug,
  ArrowUp,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  X,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const DB_TYPES = [
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mssql", label: "SQL Server" },
];

function ErrorNote({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-negative/25 bg-negative/10 px-3 py-2 text-sm text-negative" role="alert">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function BackLink({ onBack }) {
  return (
    <button onClick={onBack} className="btn-ghost -ml-2 mb-4 px-2 py-1">
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function ModeSelector({ onSelect }) {
  const options = [
    { mode: "upload", icon: Upload, title: "Upload a SQLite file", desc: "Query a .db file in your browser session" },
    { mode: "connect", icon: Plug, title: "Connect to a database", desc: "MySQL, PostgreSQL or SQL Server" },
  ];
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h2 className="text-xl font-semibold text-fg">Connect a database</h2>
      <p className="mt-1 text-sm text-fg-muted">
        Ask questions in plain English — DataPilot writes the SQL, runs it read-only, and shows the result.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <button key={o.mode} onClick={() => onSelect(o.mode)} className="card-hover flex items-start gap-3 p-4 text-left">
            <o.icon className="mt-0.5 h-5 w-5 shrink-0 text-fg-subtle" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{o.title}</span>
              <span className="mt-0.5 block text-sm text-fg-muted">{o.desc}</span>
            </span>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadMode({ onBack, onUpload, loading, error }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <BackLink onBack={onBack} />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); onUpload(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById("dbFileInput").click()}
        onKeyDown={(e) => e.key === "Enter" && document.getElementById("dbFileInput").click()}
        role="button"
        tabIndex={0}
        aria-label="Upload a SQLite database file"
        className={`drop-zone flex flex-col items-center px-6 py-12 text-center ${dragging ? "dragging" : ""}`}
      >
        <Database className="h-8 w-8 text-fg-subtle" />
        <p className="mt-3 text-sm font-medium text-fg">{dragging ? "Drop the .db file" : "Upload a SQLite database"}</p>
        <p className="mt-1 text-sm text-fg-muted">Drag and drop a .db file, or click to browse</p>
        <input id="dbFileInput" type="file" accept=".db" className="hidden" onChange={(e) => onUpload(e.target.files[0])} />
      </div>

      <div className="mt-3 space-y-2">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-fg-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reading database…
          </p>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
      </div>
    </div>
  );
}

function ConnectMode({ onBack, onConnect, loading, error }) {
  const [form, setForm] = useState({
    connection_type: "mysql",
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
  });

  const fields = [
    { key: "host", label: "Host", placeholder: "localhost", span: "sm:col-span-2" },
    { key: "port", label: "Port", placeholder: "3306" },
    { key: "database", label: "Database", placeholder: "my_database" },
    { key: "username", label: "Username", placeholder: "root" },
    { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <BackLink onBack={onBack} />
      <div className="card p-5">
        <h2 className="text-base font-semibold text-fg">Database connection</h2>
        <p className="mt-1 text-sm text-fg-muted">Use a read-only database user if you can.</p>

        <div className="mt-4 inline-flex rounded-md border border-line bg-sunken p-0.5" role="radiogroup" aria-label="Database type">
          {DB_TYPES.map((db) => (
            <button
              key={db.value}
              role="radio"
              aria-checked={form.connection_type === db.value}
              onClick={() => setForm({ ...form, connection_type: db.value })}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                form.connection_type === db.value ? "bg-panel font-medium text-fg shadow-xs" : "text-fg-muted hover:text-fg"
              }`}
            >
              {db.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className={`block ${f.span || ""}`}>
              <span className="mb-1 block text-xs font-medium text-fg-muted">{f.label}</span>
              <input
                type={f.type || "text"}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="input-field"
              />
            </label>
          ))}
        </div>

        {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => onConnect({ ...form, port: form.port ? parseInt(form.port) : undefined })}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</> : <><Plug className="h-4 w-4" />Connect</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Failed queries the backend sent back to the LLM before it found one that ran.
function CorrectionAttempts({ attempts, fixed }) {
  const n = attempts.length;
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="flex items-center gap-2 border-b border-line bg-sunken px-3 py-2 text-xs font-medium text-fg">
        <RotateCcw className="h-3.5 w-3.5 text-warning" />
        {fixed
          ? `Self-corrected after ${n} failed attempt${n > 1 ? "s" : ""}`
          : `${n} attempt${n > 1 ? "s" : ""} failed`}
      </div>
      <ol className="divide-y divide-line">
        {attempts.map((attempt, i) => (
          <li key={i} className="space-y-1 px-3 py-2">
            <p className="text-xs text-fg-muted">
              <span className="font-medium text-fg">Attempt {i + 1}</span>
              <span className="text-fg-subtle"> · </span>
              <span className="font-mono text-negative">{attempt.error}</span>
            </p>
            <pre className="whitespace-pre-wrap break-all font-mono text-2xs text-fg-subtle">{attempt.sql}</pre>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SQLMessage({ msg }) {
  const [copiedSQL, setCopiedSQL] = useState(false);

  const copySQL = () => {
    navigator.clipboard.writeText(msg.sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg border border-line bg-sunken px-3 py-2 text-sm text-fg sm:max-w-[75%]">
          {msg.content}
        </div>
      </div>
    );
  }

  const attempts = msg.attempts || [];
  return (
    <div className="min-w-0 space-y-3">
      {msg.content && <MessageContent content={msg.content} />}

      {attempts.length > 0 && <CorrectionAttempts attempts={attempts} fixed={Boolean(msg.table)} />}

      {msg.sql && (
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="flex h-9 items-center justify-between border-b border-line bg-sunken pl-3 pr-1.5">
            <span className="text-xs font-medium text-fg-muted">
              SQL{attempts.length > 0 && msg.table ? ` · attempt ${attempts.length + 1}` : ""}
            </span>
            <button onClick={copySQL} className="btn-ghost h-7 px-2 py-0 text-xs">
              {copiedSQL ? <><Check className="h-3.5 w-3.5 text-positive" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
            </button>
          </div>
          <pre className="overflow-x-auto bg-panel p-3 font-mono text-xs leading-relaxed text-fg">{msg.sql}</pre>
        </div>
      )}

      {msg.table && (
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="flex h-9 items-center justify-between border-b border-line bg-sunken px-3">
            <span className="text-xs font-medium text-fg-muted">Results</span>
            <span className="text-xs tabular-nums text-fg-subtle">
              {msg.table.rows?.length.toLocaleString()} row{msg.table.rows?.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="max-h-72 overflow-auto bg-panel">
            <ResultTable columns={msg.table.columns} rows={msg.table.rows} />
          </div>
        </div>
      )}

      {msg.chart && <ChartViewer chartJson={msg.chart} />}
    </div>
  );
}

function SchemaPanel({ dbName, tables, schema, examples, onDisconnect, onPickQuery }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-hidden border-r border-line bg-canvas lg:flex">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
        <Database className="h-4 w-4 shrink-0 text-fg-subtle" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg" title={dbName}>{dbName}</p>
        </div>
        <button onClick={onDisconnect} className="btn-icon h-7 w-7" title="Disconnect" aria-label="Disconnect">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-3">
        <div>
          <p className="section-label mb-2 px-1">Schema · {tables.length} table{tables.length === 1 ? "" : "s"}</p>
          <div className="space-y-2">
            {tables.map((table) => (
              <div key={table} className="card">
                <p className="border-b border-line px-3 py-1.5 font-mono text-xs font-medium text-fg">{table}</p>
                <ul className="px-3 py-1.5">
                  {schema[table]?.columns.map((col) => (
                    <li key={col.name} className="flex items-center justify-between gap-2 py-0.5">
                      <span className="truncate font-mono text-2xs text-fg-muted">{col.name}</span>
                      <span className="shrink-0 font-mono text-2xs text-fg-subtle">{col.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-1 px-1">Example questions</p>
          {examples.map((q) => (
            <button
              key={q}
              onClick={() => onPickQuery(q)}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-fg-muted transition-colors hover:bg-sunken hover:text-fg"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function SQLPage() {
  const [mode, setMode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [schema, setSchema] = useState(null);
  const examples = useMemo(() => buildSqlExamples(schema), [schema]);
  const [tables, setTables] = useState([]);
  const [dbName, setDbName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const connectedMessage = (data) => ({
    role: "assistant",
    content: `Connected to **${data.db_name}**. Found ${data.table_count} table${data.table_count === 1 ? "" : "s"}: ${data.tables.join(", ")}.`,
    sql: null, table: null, chart: null,
  });

  const handleDBUpload = async (file) => {
    if (!file || !file.name.endsWith(".db")) {
      setError("Please upload a .db (SQLite) file");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await uploadSQLiteDB(file);
      setSessionId(data.session_id);
      setSchema(data.schema);
      setTables(data.tables);
      setDbName(data.db_name);
      setMessages([connectedMessage(data)]);
    } catch {
      setError("Failed to upload database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (connData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await connectSQLDB(connData);
      setSessionId(data.session_id);
      setSchema(data.schema);
      setTables(data.tables);
      setDbName(data.db_name);
      setMessages([connectedMessage(data)]);
    } catch {
      setError("Connection failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question, sql: null, table: null, chart: null }]);
    setChatLoading(true);
    try {
      const data = await sendSQLMessage(sessionId, question);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sql: data.sql,
        attempts: data.attempts,
        table: data.table,
        chart: data.chart,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again.",
        sql: null, table: null, chart: null,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Pre-connection screens ──────────────────────────────────────
  if (!sessionId) {
    return (
      <DashboardLayout title="SQL workspace" subtitle="Ask questions about a database in plain English">
        {!mode && <ModeSelector onSelect={setMode} />}
        {mode === "upload" && (
          <UploadMode
            onBack={() => { setMode(null); setError(null); }}
            onUpload={handleDBUpload}
            loading={loading}
            error={error}
          />
        )}
        {mode === "connect" && (
          <ConnectMode
            onBack={() => { setMode(null); setError(null); }}
            onConnect={handleConnect}
            loading={loading}
            error={error}
          />
        )}
      </DashboardLayout>
    );
  }

  // ── Connected ────────────────────────────────────────────────────
  return (
    <DashboardLayout title={`SQL · ${dbName}`} subtitle={`${tables.length} table${tables.length === 1 ? "" : "s"}`}>
      <div className="flex h-full overflow-hidden">
        <SchemaPanel
          dbName={dbName}
          tables={tables}
          schema={schema}
          examples={examples}
          onDisconnect={() => { setSessionId(null); setMode(null); }}
          onPickQuery={setInput}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
              {messages.map((msg, i) => (
                <SQLMessage key={i} msg={msg} />
              ))}

              {/* Example questions inline when the schema panel is hidden (below lg) */}
              {messages.length === 1 && (
                <div className="lg:hidden">
                  <p className="section-label mb-2">Example questions</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {examples.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="rounded-md border border-line bg-panel px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatLoading && (
                <p className="flex items-center gap-2 text-sm text-fg-subtle" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Writing and running SQL…
                </p>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-line bg-panel">
            <div className="mx-auto flex max-w-4xl gap-2 px-4 py-3 sm:px-6">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question about your database"
                className="input-field flex-1"
                aria-label="SQL question"
              />
              <button
                onClick={handleSend}
                disabled={chatLoading || !input.trim()}
                className="btn-primary h-10 w-10 shrink-0 !p-0"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
