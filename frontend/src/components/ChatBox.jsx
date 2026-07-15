import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage } from "../services/api";
import ChartViewer from "../components/ChartViewer";
import {
  Send,
  Sparkles,
  Bot,
  User,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Search,
  RotateCcw,
  Copy,
  Check,
  Zap,
} from "lucide-react";

const SUGGESTIONS = [
  { icon: TrendingUp, text: "What are the key trends in this dataset?" },
  { icon: BarChart3, text: "Show me a chart of the top categories" },
  { icon: AlertTriangle, text: "Are there any outliers I should know about?" },
  { icon: Search, text: "Summarize the most important findings" },
  { icon: Sparkles, text: "What is the total sales revenue?" },
  { icon: TrendingUp, text: "Show highest revenue city" },
  { icon: BarChart3, text: "Average monthly profit trend" },
  { icon: Search, text: "Find anomalies in the data" },
];

function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm shrink-0">
      <Bot className="w-4 h-4 text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
      <User className="w-4 h-4 text-zinc-300" />
    </div>
  );
}

function MessageBubble({ msg, index }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.03, 0.1) }}
      className={`flex gap-3 group ${isUser ? "flex-row-reverse" : ""}`}
    >
      {isUser ? <UserAvatar /> : <AIAvatar />}

      <div className={`max-w-[80%] sm:max-w-[72%] ${isUser ? "" : "flex-1"}`}>
        {isUser ? (
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-glow-sm">
            <p className="text-sm leading-relaxed">{msg.content}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {msg.content && (
              <div className="relative glass-card rounded-2xl rounded-tl-md px-4 py-3">
                <div className="message-prose">
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={line === "" ? "mb-3" : "mb-1 last:mb-0"}>
                      {line.startsWith("**") && line.endsWith("**")
                        ? <strong className="text-white">{line.slice(2, -2)}</strong>
                        : line
                      }
                    </p>
                  ))}
                </div>
                <button
                  onClick={copyText}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
            {msg.chart && (
              <div className="rounded-2xl overflow-hidden border border-zinc-800">
                <ChartViewer chartJson={msg.chart} />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex gap-3"
    >
      <AIAvatar />
      <div className="glass-card rounded-2xl rounded-tl-md px-5 py-4">
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay, i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400"
              animate={{ y: [-3, 3, -3], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: delay / 1000 }}
            />
          ))}
          <span className="ml-2 text-xs text-zinc-500">DataPilot is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatBox({ sessionId, sendRef }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm **DataPilot**, your AI data analyst. Ask me anything about your dataset — trends, comparisons, visualizations, or summaries. I'll convert your questions to SQL and explain the results.",
      chart: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Expose handleSend to parent via sendRef so suggestions can inject messages.
  useEffect(() => {
    if (sendRef) sendRef.current = (text) => handleSend(text);
  });
  const handleSend = async (text) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setMessages((prev) => [...prev, { role: "user", content: userMessage, chart: null }]);
    setLoading(true);

    try {
      const data = await sendMessage(sessionId, userMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, chart: data.chart },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again.", chart: null },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    setInput(el.value);
  };

  const showSuggestions = messages.length <= 1 && !loading;
  const handleReset = () => {
    setMessages([{
      role: "assistant",
      content: "Hi! I'm **DataPilot**, your AI data analyst. Ask me anything about your dataset — trends, comparisons, visualizations, or summaries.",
      chart: null,
    }]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4 pr-1">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} index={i} />
        ))}

        <AnimatePresence>{loading && <TypingIndicator />}</AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-2"
            >
              <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Try asking one of these</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.slice(0, 6).map((s) => (
                  <motion.button
                    key={s.text}
                    onClick={() => handleSend(s.text)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl glass-card text-left text-xs text-zinc-400 hover:text-white transition-all group"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <s.icon className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                    {s.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="mt-auto pt-4 border-t border-zinc-800/60">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={(el) => { textareaRef.current = el; inputRef.current = el; }}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your data... (Enter to send)"
              rows={1}
              className="input-field resize-none min-h-[48px] max-h-32 py-3 pr-12 leading-relaxed"
              aria-label="Chat message input"
            />
            {/* Reset button inside input */}
            {messages.length > 1 && (
              <button
                onClick={handleReset}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <motion.button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary !px-4 !py-3 shrink-0 rounded-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
              ) : (
                <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Send className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono text-[9px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
