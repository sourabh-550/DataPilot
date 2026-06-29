import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadSQLiteDB, connectSQLDB, sendSQLMessage } from "../services/api";
import ChartViewer from "../components/ChartViewer";
import ResultTable from "../components/ResultTable";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Database,
  Upload,
  Plug,
  Send,
  Copy,
  Check,
  ChevronRight,
  Bot,
  User,
  Code2,
  Table2,
  BarChart3,
  Zap,
  AlertCircle,
  X,
  Loader2,
  Terminal,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const SAMPLE_QUERIES = [
  "Show all customers from India",
  "Top 5 products by price",
  "Total revenue per customer",
  "How many orders per month?",
  "Products with stock less than 50",
  "Average order value by region",
];

const DB_TYPES = [
  { value: "mysql", label: "MySQL", icon: "🐬" },
  { value: "postgresql", label: "PostgreSQL", icon: "🐘" },
  { value: "mssql", label: "SQL Server", icon: "🔷" },
];

function ModeSelector({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/12 border border-indigo-500/20 mb-5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400">SQL Workspace</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Connect to your <span className="gradient-text">database</span>
        </h2>
        <p className="text-zinc-400 text-base max-w-md">
          Upload a SQLite database file or connect to your MySQL / PostgreSQL server
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <motion.button
          onClick={() => onSelect("upload")}
          className="glass-card rounded-2xl p-7 text-left group hover:border-indigo-500/30 transition-all"
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-glow-sm group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
            Upload SQLite File
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Drop a .db SQLite database file and start querying instantly
          </p>
          <div className="flex items-center gap-1 mt-4 text-xs text-zinc-600 group-hover:text-indigo-400 transition-colors">
            <span>Get started</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          onClick={() => onSelect("connect")}
          className="glass-card rounded-2xl p-7 text-left group hover:border-cyan-500/30 transition-all"
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-glow-cyan group-hover:scale-110 transition-transform">
            <Plug className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
            Connect to Database
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Connect to MySQL, PostgreSQL, or SQL Server with credentials
          </p>
          <div className="flex items-center gap-1 mt-4 text-xs text-zinc-600 group-hover:text-cyan-400 transition-colors">
            <span>Connect now</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

function UploadMode({ onBack, onUpload, loading, error }) {
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); onUpload(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("dbFileInput").click()}
          className={`drop-zone p-12 text-center ${dragging ? "dragging" : ""}`}
        >
          <motion.div
            animate={dragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            className="mx-auto w-20 h-20 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mb-6"
          >
            <Database className="w-10 h-10 text-indigo-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">
            {dragging ? "Drop your .db file" : "Upload SQLite Database"}
          </h3>
          <p className="text-zinc-500 text-sm mb-6">Click to browse or drag & drop a .db file</p>
          <span className="badge-muted font-mono">.db files only</span>
          <input id="dbFileInput" type="file" accept=".db" className="hidden" onChange={(e) => onUpload(e.target.files[0])} />
        </div>

        {loading && (
          <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting to database...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </motion.div>
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
    { key: "host", label: "Host", placeholder: "localhost" },
    { key: "port", label: "Port", placeholder: "3306" },
    { key: "username", label: "Username", placeholder: "root" },
    { key: "password", label: "Password", placeholder: "••••••••", type: "password" },
    { key: "database", label: "Database", placeholder: "my_database" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8"
    >
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white mb-2">Database Connection</h3>

          <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900 rounded-xl">
            {DB_TYPES.map((db) => (
              <button
                key={db.value}
                onClick={() => setForm({ ...form, connection_type: db.value })}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  form.connection_type === db.value
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className="mr-1">{db.icon}</span>{db.label}
              </button>
            ))}
          </div>

          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">{f.label}</label>
              <input
                type={f.type || "text"}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="input-field py-2.5"
              />
            </div>
          ))}

          <motion.button
            onClick={() => onConnect({ ...form, port: form.port ? parseInt(form.port) : undefined })}
            disabled={loading}
            className="btn-primary w-full rounded-2xl gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting...</> : <><Plug className="w-4 h-4" />Connect</>}
          </motion.button>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SQLMessage({ msg, index }) {
  const [copiedSQL, setCopiedSQL] = useState(false);
  const isUser = msg.role === "user";

  const copySQL = () => {
    navigator.clipboard.writeText(msg.sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.15) }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isUser
          ? "bg-zinc-800 border border-zinc-700"
          : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow-sm"
      }`}>
        {isUser ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div className={`max-w-[80%] space-y-2 ${isUser ? "" : "flex-1"}`}>
        {isUser ? (
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-md px-4 py-3">
            <p className="text-sm">{msg.content}</p>
          </div>
        ) : (
          <>
            {msg.content && (
              <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3">
                <p className="text-sm text-zinc-300 leading-relaxed">{msg.content}</p>
              </div>
            )}
            {msg.sql && (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-medium text-zinc-400">Generated SQL</span>
                  </div>
                  <button onClick={copySQL} className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 text-xs gap-1">
                    {copiedSQL ? <><Check className="w-3 h-3 text-emerald-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                </div>
                <div className="code-block rounded-none border-0">
                  <code className="text-emerald-300 text-xs leading-relaxed">{msg.sql}</code>
                </div>
              </div>
            )}
            {msg.table && (
              <div className="rounded-2xl overflow-hidden border border-zinc-800">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                  <Table2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-medium text-zinc-400">Query Results</span>
                  <span className="badge-cyan ml-auto text-[10px]">{msg.table.rows?.length} rows</span>
                </div>
                <div className="overflow-x-auto scrollbar-thin max-h-64">
                  <ResultTable columns={msg.table.columns} rows={msg.table.rows} />
                </div>
              </div>
            )}
            {msg.chart && (
              <div className="rounded-2xl overflow-hidden border border-zinc-800">
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                  <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-medium text-zinc-400">Visualization</span>
                </div>
                <ChartViewer chartJson={msg.chart} />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function SQLPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [schema, setSchema] = useState(null);
  const [tables, setTables] = useState([]);
  const [dbName, setDbName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

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
      setMessages([{
        role: "assistant",
        content: `Connected to **${data.db_name}** 🎉 Found ${data.table_count} tables: ${data.tables.join(", ")}. Ask me anything!`,
        sql: null, table: null, chart: null,
      }]);
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
      setMessages([{
        role: "assistant",
        content: `Connected to **${data.db_name}** 🎉 Found ${data.table_count} tables: ${data.tables.join(", ")}. Ask me anything!`,
        sql: null, table: null, chart: null,
      }]);
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
      <DashboardLayout title="SQL Workspace" subtitle="Chat with your database using natural language">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!mode && <ModeSelector key="select" onSelect={setMode} />}
            {mode === "upload" && (
              <UploadMode
                key="upload"
                onBack={() => { setMode(null); setError(null); }}
                onUpload={handleDBUpload}
                loading={loading}
                error={error}
              />
            )}
            {mode === "connect" && (
              <ConnectMode
                key="connect"
                onBack={() => { setMode(null); setError(null); }}
                onConnect={handleConnect}
                loading={loading}
                error={error}
              />
            )}
          </AnimatePresence>
        </div>
      </DashboardLayout>
    );
  }

  // ── Connected Chat Interface ────────────────────────────────────
  return (
    <DashboardLayout title={`SQL · ${dbName}`} subtitle={`${tables.length} tables connected`}>
      <div className="h-[calc(100vh-57px)] flex overflow-hidden">

        {/* Schema Sidebar */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r border-zinc-800/60 overflow-y-auto scrollbar-thin">
          {/* DB Info */}
          <div className="p-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{dbName}</p>
                <p className="text-xs text-zinc-500">{tables.length} tables</p>
              </div>
              <button
                onClick={() => { setSessionId(null); setMode(null); }}
                className="ml-auto btn-ghost p-1.5 rounded-lg text-zinc-600 hover:text-zinc-400"
                title="Disconnect"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Schema */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Schema</p>
            {tables.map((table) => (
              <div key={table} className="card rounded-xl p-3">
                <p className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-1.5">
                  <Table2 className="w-3 h-3" />
                  {table}
                </p>
                <div className="space-y-1">
                  {schema[table]?.columns.map((col) => (
                    <div key={col.name} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{col.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded-md">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Sample Queries */}
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Try Asking</p>
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-xs text-zinc-500 hover:text-white px-2.5 py-2 rounded-lg hover:bg-zinc-800/60 transition-all mb-1 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4">
            {messages.map((msg, i) => (
              <SQLMessage key={i} msg={msg} index={i} />
            ))}
            <AnimatePresence>
              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span className="text-xs text-zinc-500">Generating SQL...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-zinc-800/60 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your database in plain English..."
              className="input-field flex-1"
            />
            <motion.button
              onClick={handleSend}
              disabled={chatLoading || !input.trim()}
              className="btn-primary !px-4 !py-3 shrink-0 rounded-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}