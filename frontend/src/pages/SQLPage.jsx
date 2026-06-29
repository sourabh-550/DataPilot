import { useState } from "react";
import { uploadSQLiteDB, connectSQLDB, sendSQLMessage } from "../services/api";
import ChartViewer from "../components/ChartViewer";
import ResultTable from "../components/ResultTable";
import { useNavigate } from "react-router-dom";

export default function SQLPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // 'upload' or 'connect'
  const [sessionId, setSessionId] = useState(null);
  const [schema, setSchema] = useState(null);
  const [tables, setTables] = useState([]);
  const [dbName, setDbName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Connection form state
  const [connForm, setConnForm] = useState({
    connection_type: "mysql",
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
  });

  // ── Handle SQLite upload ──────────────────────────────────
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
        content: `Connected to ${data.db_name} 🎉 Found ${data.table_count} tables: ${data.tables.join(", ")}. Ask me anything!`,
        table: null,
        chart: null,
        sql: null
      }]);
    } catch (err) {
      setError("Failed to upload database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle connection string ──────────────────────────────
  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await connectSQLDB({
        ...connForm,
        port: connForm.port ? parseInt(connForm.port) : undefined,
      });
      setSessionId(data.session_id);
      setSchema(data.schema);
      setTables(data.tables);
      setDbName(data.db_name);
      setMessages([{
        role: "assistant",
        content: `Connected to ${data.db_name} 🎉 Found ${data.table_count} tables: ${data.tables.join(", ")}. Ask me anything!`,
        table: null,
        chart: null,
        sql: null
      }]);
    } catch (err) {
      setError("Connection failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle chat ───────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, {
      role: "user", content: question, table: null, chart: null, sql: null
    }]);
    setChatLoading(true);
    try {
      const data = await sendSQLMessage(sessionId, question);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sql: data.sql,
        table: data.table,
        chart: data.chart
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again.",
        table: null, chart: null, sql: null
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Render connection setup ───────────────────────────────
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">
            Data<span className="text-blue-500">Pilot</span>
          </h1>
          <p className="text-gray-400 mt-2">SQL Mode — Chat with your database</p>
        </div>

        {/* Mode Selection */}
        {!mode && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMode("upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition"
            >
              📁 Upload SQLite .db File
            </button>
            <button
              onClick={() => setMode("connect")}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition border border-gray-600"
            >
              🔌 Connect to Database
            </button>
          </div>
        )}

        {/* Upload Mode */}
        {mode === "upload" && (
          <div className="w-full max-w-md">
            <div
              className="border-2 border-dashed border-gray-700 bg-gray-900 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-600 transition"
              onClick={() => document.getElementById("dbInput").click()}
            >
              <div className="text-5xl mb-4">🗄️</div>
              <p className="text-white text-lg font-semibold">
                Drop your .db file here
              </p>
              <p className="text-gray-400 text-sm mt-2">SQLite database files only</p>
              <input
                id="dbInput"
                type="file"
                accept=".db"
                className="hidden"
                onChange={(e) => handleDBUpload(e.target.files[0])}
              />
            </div>
            <button
              onClick={() => setMode(null)}
              className="mt-4 text-gray-400 hover:text-white text-sm w-full text-center"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Connect Mode */}
        {mode === "connect" && (
          <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 space-y-4">
            <select
              value={connForm.connection_type}
              onChange={(e) => setConnForm({ ...connForm, connection_type: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mssql">Microsoft SQL Server</option>
            </select>
            {["host", "port", "username", "password", "database"].map((field) => (
              <input
                key={field}
                type={field === "password" ? "password" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={connForm[field]}
                onChange={(e) => setConnForm({ ...connForm, [field]: e.target.value })}
                className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-gray-400 hover:text-white text-sm w-full text-center"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-4 flex items-center gap-3 text-blue-400">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to database...</span>
          </div>
        )}

        {/* Error */}
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {/* Back to CSV */}
        <button
          onClick={() => navigate("/")}
          className="mt-8 text-gray-500 hover:text-gray-300 text-sm transition"
        >
          ← Back to CSV Mode
        </button>
      </div>
    );
  }

  // ── Render Chat Interface ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">
          Data<span className="text-blue-500">Pilot</span>
          <span className="ml-2 text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
            SQL Mode
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">🗄️ {dbName}</span>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            CSV Mode
          </button>
          <button
            onClick={() => { setSessionId(null); setMode(null); }}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            New Connection
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">

        {/* Left Sidebar — Schema */}
        <div className="w-72 flex-shrink-0 overflow-y-auto space-y-4">
          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              🗃️ Database Schema
            </h2>
            {tables.map((table) => (
              <div key={table} className="mb-4">
                <p className="text-blue-400 font-medium text-sm mb-2">
                  📋 {table}
                </p>
                <div className="space-y-1">
                  {schema[table]?.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-1.5"
                    >
                      <span className="text-gray-300 text-xs">{col.name}</span>
                      <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full">
                        {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sample Queries */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              💡 Try Asking
            </h2>
            <div className="space-y-2">
              {[
                "Show all customers from India",
                "Top 5 products by price",
                "Total revenue per customer",
                "How many orders per month?",
                "Show products with stock less than 50"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Chat */}
        <div className="flex-1 bg-gray-900 rounded-2xl p-5 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm
                    ${msg.role === "user"
                      ? "max-w-[70%] bg-blue-600 text-white rounded-br-none"
                      : "w-full bg-gray-800 text-gray-200 rounded-bl-none"
                    }`}
                >
                  {/* Message text */}
                  <p>{msg.content}</p>

                  {/* SQL Query Badge */}
                  {msg.sql && (
                    <div className="mt-3 bg-gray-900 rounded-xl p-3 border border-gray-700">
                      <p className="text-xs text-blue-400 mb-1 font-medium">
                        Generated SQL:
                      </p>
                      <code className="text-xs text-green-400 break-all">
                        {msg.sql}
                      </code>
                    </div>
                  )}

                  {/* Results Table */}
                  {msg.table && (
                    <ResultTable
                      columns={msg.table.columns}
                      rows={msg.table.rows}
                    />
                  )}

                  {/* Chart */}
                  {msg.chart && <ChartViewer chartJson={msg.chart} />}
                </div>
              </div>
            ))}

            {/* Loading */}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your database..."
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={chatLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}