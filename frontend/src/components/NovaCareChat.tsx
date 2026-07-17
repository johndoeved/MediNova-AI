"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Stethoscope, Minimize2, Maximize2 } from "lucide-react";

/* ─────────────────────────────────────────────
   NovaCare AI — Medical Chatbot
   Powered by Pollinations.ai (free, no API key, works in India)
   Model: openai (GPT-4o via Pollinations proxy)
───────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are NovaCare AI, an intelligent, empathetic, and highly knowledgeable medical health assistant created by MediNova AI. You are named after the Latin word "Nova" (new/innovation) and "Care" (compassion in healthcare).

Your capabilities:
- Provide accurate, evidence-based health information
- Help users understand symptoms, medications, and conditions
- Explain medical test results in simple language
- Offer general wellness, nutrition, and preventive health advice
- Guide users on when to seek emergency care
- Answer questions about drugs, dosages (general guidance only)
- Support mental health awareness

Your personality:
- Warm, compassionate, and professional
- Use clear, simple language (avoid excessive jargon)
- Be concise — responses should be 2-5 sentences unless detail is needed
- Always recommend consulting a qualified doctor for diagnosis/treatment
- For emergencies, immediately direct to call emergency services

Disclaimer: Always remind users this is informational and not a substitute for professional medical advice.`;

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content: "👋 Hi! I'm **NovaCare AI**, your personal health intelligence assistant. I can help with symptoms, medications, test results, wellness tips, and general health questions. How can I assist you today?",
};

/* Render markdown-like bold (**text**) */
function RenderText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>
      )}
    </>
  );
}

export default function NovaCareChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); endRef.current?.scrollIntoView({ behavior: "smooth" }); }
  }, [open, msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput("");
    setLoading(true);

    try {
      // Pollinations.ai — free, no API key, works globally
      const res = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map((m) => ({ role: m.role, content: m.content })),
          ],
          model: "openai",
          seed: Math.floor(Math.random() * 9999),
          private: true,
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const replyText = await res.text();

      const aiMsg: Msg = {
        role: "assistant",
        content: replyText.trim() || "I apologise, I couldn't generate a response. Please try again.",
      };
      setMsgs((prev) => [...prev, aiMsg]);
      if (!open) setUnread((u) => u + 1);
    } catch (err) {
      setMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check your internet connection and try again. For medical emergencies, call **112** (India) immediately.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="novacare-widget">
      {/* ── Chat window ── */}
      {open && !minimized && (
        <div className="novacare-window chat-bounce-in">
          {/* Header */}
          <div className="novacare-header">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
                NovaCare AI
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-medium">Online · Medical Health Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Disclaimer banner */}
          <div className="px-4 py-2 text-[10px] text-amber-700 bg-amber-50/80 border-b border-amber-100/80 leading-relaxed">
            ⚕️ <strong>Educational only.</strong> Not a substitute for professional medical advice. For emergencies call <strong>112</strong>.
          </div>

          {/* Messages */}
          <div className="novacare-messages">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "assistant" ? "novacare-msg-ai" : "novacare-msg-user"}
              >
                {m.role === "assistant" && (
                  <span className="block text-[9px] font-bold text-cyan-600 uppercase tracking-wider mb-1">
                    🤖 NovaCare AI
                  </span>
                )}
                {m.role === "user" && (
                  <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                    You
                  </span>
                )}
                <span className="text-sm leading-relaxed">
                  <RenderText text={m.content} />
                </span>
              </div>
            ))}

            {loading && (
              <div className="novacare-msg-ai">
                <span className="block text-[9px] font-bold text-cyan-600 uppercase tracking-wider mb-1.5">
                  🤖 NovaCare AI
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          {msgs.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                "What are common cold symptoms?",
                "How to lower blood pressure naturally?",
                "What does a CBC blood test measure?",
                "Signs of diabetes?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => { setInput(""); setMsgs((p) => [...p, { role: "user", content: q }]); }, 0); send(); }}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-all font-medium"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="novacare-input-row">
            <textarea
              ref={inputRef}
              className="novacare-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask NovaCare AI anything about your health..."
              disabled={loading}
            />
            <button
              className="novacare-send"
              onClick={send}
              disabled={!input.trim() || loading}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 text-center border-t border-black/[0.04] bg-white/30">
            <p className="text-[9px] text-slate-400">
              Powered by <span className="text-cyan-600 font-semibold">Pollinations AI</span> · MediNova AI Platform
            </p>
          </div>
        </div>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <div
          className="mb-2 px-4 py-2.5 rounded-2xl border border-white/90 cursor-pointer flex items-center gap-3 chat-bounce-in"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          }}
          onClick={() => setMinimized(false)}
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <Stethoscope className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700" style={{ fontFamily: "Outfit, sans-serif" }}>NovaCare AI</p>
            <p className="text-[10px] text-slate-400">Click to expand</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); setMinimized(false); }}
            className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bubble launcher */}
      <button
        className="novacare-bubble"
        onClick={() => { setOpen(!open); setMinimized(false); }}
        title="Chat with NovaCare AI"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Stethoscope className="w-7 h-7 text-white" />
        )}
        {unread > 0 && !open && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unread}
          </div>
        )}
      </button>
    </div>
  );
}
