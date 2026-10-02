import { useState, useRef, useEffect } from "react";
import { sendMessage, getChatHistory } from "../services/api";
import ChartViewer from "../components/ChartViewer";
import MessageContent from "../components/MessageContent";
import { CHART_TYPES_NOTE } from "../utils/chartTypes";
import { ArrowUp, RotateCcw, Copy, Check } from "lucide-react";

const SUGGESTIONS = [
  "What are the key trends in this dataset?",
  "Show me a chart of the top categories",
  "Are there any outliers I should know about?",
  "Summarize the most important findings",
  "What is the total sales revenue?",
  "Show highest revenue city",
];

const GREETING =
  "Ask anything about this dataset — totals, comparisons, trends or a chart. Answers are computed from your data with pandas.";

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-lg border border-line bg-sunken px-3 py-2 text-sm text-fg sm:max-w-[75%]">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative max-w-full space-y-3 pr-8">
      {msg.content && <MessageContent content={msg.content} />}
      {msg.content && (
        <button
          onClick={copyText}
          className="btn-icon absolute right-0 top-0 h-7 w-7 opacity-0 focus:opacity-100 group-hover:opacity-100"
          aria-label="Copy answer"
          title="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
      {msg.chart && <ChartViewer chartJson={msg.chart} />}
      {msg.chartNotSaved && (
        <p className="text-xs text-fg-subtle">Charts from earlier visits aren't saved — ask again to redraw it.</p>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-fg-subtle" role="status">
      <span className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="h-1.5 w-1.5 animate-pulse rounded-full bg-fg-subtle" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
      Analyzing…
    </div>
  );
}

export default function ChatBox({ sessionId, sendRef }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING, chart: null }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Restore this dataset's earlier conversation (saved server-side in chat_history).
  useEffect(() => {
    let cancelled = false;
    getChatHistory(sessionId)
      .then(({ history }) => {
        if (cancelled || !history?.length) return;
        const restored = history.map((m) => ({
          role: m.role,
          content: m.message,
          chart: null,
          chartNotSaved: m.tool_used === "chart",
        }));
        // Keep the greeting first, and anything typed while history was loading last.
        setMessages((prev) => [prev[0], ...restored, ...prev.slice(1)]);
      })
      .catch(() => { /* history is a nice-to-have — chatting still works */ });
    return () => { cancelled = true; };
  }, [sessionId]);

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
    setMessages([{ role: "assistant", content: GREETING, chart: null }]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}

          {showSuggestions && (
            <div>
              <p className="section-label mb-2">Suggested questions</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSend(text)}
                    className="rounded-md border border-line bg-panel px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                  >
                    {text}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-fg-subtle">{CHART_TYPES_NOTE}</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-line bg-panel">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={(el) => { textareaRef.current = el; inputRef.current = el; }}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your data"
                rows={1}
                className="input-field max-h-32 min-h-[40px] resize-none pr-10 leading-6"
                aria-label="Chat message input"
              />
              {messages.length > 1 && (
                <button
                  onClick={handleReset}
                  className="absolute bottom-1.5 right-1.5 rounded p-1.5 text-fg-subtle transition-colors hover:text-fg"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn-primary h-10 w-10 shrink-0 !p-0"
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 hidden text-2xs text-fg-subtle sm:block">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
}
