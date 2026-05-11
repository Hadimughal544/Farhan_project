import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { sendChatbotMessage } from "../services/chatbotService";

const QUICK_ACTIONS = [
  "How does the assessment work?",
  "How are universities recommended?",
  "How can I update my profile?",
  "How do I change my password?",
  "What does Strong Match mean?",
  "How do I contact support?",
];

const STORAGE_KEY = "support_chat_session_v1";

function formatTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const listRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const element = listRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  const canSend = useMemo(() => input.trim().length >= 2 && !sending, [input, sending]);

  const pushUserAndGetReply = async (text) => {
    const userMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const data = await sendChatbotMessage(text);
      const botMessage = {
        id: `${Date.now()}-b`,
        role: "assistant",
        text: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        source: data.source,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Support assistant is temporarily unavailable.");
      const fallback = {
        id: `${Date.now()}-e`,
        role: "assistant",
        text: "I could not process that request right now. Please try again shortly.",
        timestamp: new Date().toISOString(),
        source: "not_found",
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    await pushUserAndGetReply(text);
  };

  const onQuickAction = async (text) => {
    if (sending) return;
    await pushUserAndGetReply(text);
  };

  const clearSession = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {open ? (
          <section className="chatbot-panel w-[calc(100vw-1.5rem)] max-w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
            <header className="chatbot-header flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-800/80">Platform support</p>
                <h3 className="mt-0.5 text-sm font-semibold text-slate-900">FutureCampus Assistant</h3>
                <p className="text-xs text-slate-600">Website, account, assessment, and recommendations only.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/70 hover:text-slate-800"
                aria-label="Close support chat"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="border-b border-slate-100 px-3 pb-3">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {QUICK_ACTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={sending}
                    onClick={() => onQuickAction(item)}
                    className="shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[11px] font-medium text-cyan-900 transition hover:border-cyan-200 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div ref={listRef} className="max-h-[360px] min-h-[280px] space-y-3 overflow-y-auto px-3 py-3">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  Ask a question about the platform: assessment workflow, profile updates, dashboard features, recommendations,
                  authentication, or admin tools.
                </div>
              ) : null}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <article
                    className={`max-w-[86%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-md bg-slate-900 text-white"
                        : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[10px] ${message.role === "user" ? "text-slate-300" : "text-slate-500"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </article>
                </div>
              ))}

              {sending ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={onSubmit} className="border-t border-slate-100 bg-white px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your platform support question..."
                  rows={2}
                  className="max-h-28 min-h-[42px] flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">This assistant only answers platform-related questions.</p>
                <button
                  type="button"
                  onClick={clearSession}
                  className="text-[11px] font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="chatbot-fab grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(15,23,42,0.24)]"
          aria-label={open ? "Close support chat" : "Open support chat"}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h8M8 14h5m6 7-3.8-2.1a2 2 0 0 0-.98-.24H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6.8A4 4 0 0 1 19 21Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
