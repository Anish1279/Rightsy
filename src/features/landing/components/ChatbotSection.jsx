"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

const INITIAL_MESSAGES = [
  {
    role: "bot",
    content: "Hi there! 👋 I can help you learn about your rights and laws. What would you like to know?",
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function ChatbotSection() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const [cRef, inView] = useInView(0.1);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      {
        role: "bot",
        content: "Thanks for your question! I'm here to help you understand your rights and laws in a simple way. 😊",
      },
    ]);
    setInput("");
  }, [input]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const SUGGESTIONS = [
    "What are my rights?",
    "Tell me about child labor laws",
    "How can I stay safe online?",
  ];

  return (
    <section id="chatbot" className="relative py-24 md:py-32 overflow-hidden">
      {/* Dark section */}
      <div className="absolute inset-0 bg-[#0f0a1f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(124,58,237,0.1)_0%,_transparent_60%)]" />

      <div ref={cRef} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left — Info */}
          <div className={`lg:col-span-5 transition-all duration-800 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold tracking-[0.15em] uppercase mb-4">
              <span className="w-8 h-px bg-violet-500" />
              AI Assistant
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Ask the{" "}
              <span className="bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
                Rights Bot
              </span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              Have a question about your rights? Our friendly AI assistant is always ready to help you understand laws in simple words.
            </p>

            {/* Quick suggestions */}
            <div className="space-y-2">
              <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Try asking:</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="block w-full text-left bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] rounded-2xl px-4 py-3 text-white/70 hover:text-white/90 text-sm transition-all cursor-pointer"
                >
                  &quot;{s}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Right — Chat UI */}
          <div className={`lg:col-span-7 transition-all duration-800 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-3xl overflow-hidden">
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Rights Bot</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-white/60 text-xs">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="h-80 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white rounded-br-lg"
                          : "bg-white/[0.06] text-white/70 rounded-bl-lg border border-white/[0.06]"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your rights..."
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-11 h-11 bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.05] disabled:text-white/20 rounded-2xl flex items-center justify-center text-white transition-all flex-shrink-0"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ChatbotSection);
