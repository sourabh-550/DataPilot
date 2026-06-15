import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";
import ChartViewer from "./ChartViewer";
import Avatar from "./ui/Avatar";
import MessageContent from "./MessageContent";
import { SendIcon, SparklesIcon } from "./ui/Icons";

const SUGGESTIONS = [
  "What are the key trends in this dataset?",
  "Show me a chart of the top categories",
  "Are there any outliers I should know about?",
  "Summarize the most important findings",
];

export default function ChatBox({ sessionId }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm **DataPilot**, your AI data analyst. Ask me anything about your dataset — trends, comparisons, visualizations, or summaries.",
      chart: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;

    setInput("");
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

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-fade-in-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            style={{ animationDelay: `${Math.min(i * 0.03, 0.15)}s` }}
          >
            <Avatar variant={msg.role === "user" ? "user" : "ai"} name={msg.role === "user" ? "You" : "AI"} />

            <div
              className={`max-w-[85%] sm:max-w-[75%] ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-glow"
                  : msg.chart
                    ? "w-full max-w-full"
                    : "glass rounded-2xl rounded-tl-md px-4 py-3"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : (
                <>
                  <MessageContent content={msg.content} />
                  {msg.chart && <ChartViewer chartJson={msg.chart} />}
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <Avatar variant="ai" />
            <div className="glass rounded-2xl rounded-tl-md px-5 py-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="pt-2 animate-fade-in-up stagger-2">
            <p className="text-xs text-content-subtle mb-3 flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-2 rounded-xl glass border border-border-subtle/60 text-content-muted hover:text-content hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="mt-auto pt-4 border-t border-border-subtle/40">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your data..."
            rows={1}
            className="input-field flex-1 resize-none min-h-[48px] max-h-32 py-3"
            aria-label="Chat message input"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary !px-4 !py-3 shrink-0"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-[10px] text-content-subtle mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
