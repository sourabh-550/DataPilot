import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";
import ChartViewer from "./ChartViewer";

export default function ChatBox({ sessionId }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm DataPilot Ask me anything about your dataset!",
      chart: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
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
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
            className={`rounded-2xl px-4 py-3 text-sm
                ${msg.role === "user"
                ? "max-w-[80%] bg-blue-600 text-white rounded-br-none"
                : msg.chart
                    ? "w-full bg-gray-800 text-gray-200 rounded-bl-none"
                    : "max-w-[80%] bg-gray-800 text-gray-200 rounded-bl-none"
                }`}
            >
              {msg.content}
              {msg.chart && <ChartViewer chartJson={msg.chart} />}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your data..."
          className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}