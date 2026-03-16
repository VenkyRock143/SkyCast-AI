'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { label: 'What to wear?',     icon: '👔' },
  { label: 'Best city weather', icon: '🏆' },
  { label: 'Travel advice',     icon: '✈️' },
  { label: 'Run outside?',      icon: '🏃' },
];

/* Unique SVG weather illustration for the AI avatar */
const AIAvatar = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="av1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0ea5e9"/>
        <stop offset="100%" stopColor="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#av1)"/>
    {/* Sun rays */}
    <circle cx="22" cy="16" r="5" fill="rgba(255,255,255,0.9)"/>
    {/* Cloud */}
    <ellipse cx="16" cy="24" rx="8" ry="5" fill="rgba(255,255,255,0.85)"/>
    <ellipse cx="12" cy="25" rx="5" ry="4" fill="rgba(255,255,255,0.85)"/>
    <ellipse cx="20" cy="25" rx="5" ry="4" fill="rgba(255,255,255,0.85)"/>
    {/* Rain drops */}
    <line x1="12" y1="30" x2="11" y2="34" stroke="rgba(56,189,248,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="31" x2="15" y2="35" stroke="rgba(56,189,248,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="30" x2="19" y2="34" stroke="rgba(56,189,248,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* Large decorative SVG for chat empty/header state */
const WeatherIllustration = () => (
  <svg width="72" height="72" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(56,189,248,0.15)"/>
        <stop offset="100%" stopColor="rgba(99,102,241,0.05)"/>
      </radialGradient>
      <linearGradient id="sun-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
      <linearGradient id="cloud-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2e8f0"/>
        <stop offset="100%" stopColor="#cbd5e1"/>
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="38" fill="url(#bg-grad)" stroke="rgba(56,189,248,0.1)" strokeWidth="1"/>
    {/* Sun */}
    <circle cx="52" cy="28" r="10" fill="url(#sun-grad)" opacity="0.9"/>
    {/* Sun rays */}
    {[0,45,90,135,180,225,270,315].map(deg => (
      <line key={deg}
        x1={52 + 13*Math.cos(deg*Math.PI/180)}
        y1={28 + 13*Math.sin(deg*Math.PI/180)}
        x2={52 + 17*Math.cos(deg*Math.PI/180)}
        y2={28 + 17*Math.sin(deg*Math.PI/180)}
        stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
    ))}
    {/* Main cloud */}
    <ellipse cx="34" cy="46" rx="16" ry="10" fill="url(#cloud-grad)" opacity="0.9"/>
    <ellipse cx="24" cy="48" rx="10" ry="8" fill="url(#cloud-grad)" opacity="0.9"/>
    <ellipse cx="42" cy="48" rx="10" ry="8" fill="url(#cloud-grad)" opacity="0.9"/>
    <ellipse cx="32" cy="42" rx="9" ry="8" fill="white" opacity="0.8"/>
    {/* Rain */}
    {[24,30,36,42].map((x, i) => (
      <line key={x}
        x1={x} y1={57 + i%2*2}
        x2={x-2} y2={63 + i%2*2}
        stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
    ))}
  </svg>
);

export default function AIChat() {
  const [open,            setOpen]            = useState(false);
  const [input,           setInput]           = useState('');
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [loading,         setLoading]         = useState(false);
  const [briefing,        setBriefing]        = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 250);
      if (!briefing && !briefingLoading) loadBriefing();
    }
  }, [open]);

  const loadBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/advisor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      setBriefing(data.advice);
    } catch {
      setBriefing(null);
    } finally {
      setBriefingLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    const history = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }));
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ message: msg, history }),
        }
      );
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.reply || 'Sorry, I could not process that.',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Connection issue. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isEmpty = messages.length === 0 && !briefing && !briefingLoading;

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close AI Chat' : 'Open AI Assistant'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          width: 52, height: 52,
          borderRadius: 16,
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          background: open
            ? 'rgba(251,113,133,0.85)'
            : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          boxShadow: open
            ? '0 8px 24px rgba(251,113,133,0.3)'
            : '0 8px 28px rgba(56,189,248,0.3)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.07)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <AIAvatar size={26} />
        )}
      </button>

      {/* ── CHAT PANEL ── */}
      <div
        style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 40,
          width: 'min(340px, calc(100vw - 32px))',
          height: open ? 520 : 0,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          overflow: 'hidden',
          borderRadius: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(56,189,248,0.04)',
          display: 'flex', flexDirection: 'column',
          transition: 'height 0.3s cubic-bezier(.22,.68,0,1.2), opacity 0.25s ease',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, rgba(99,102,241,0.06) 100%)',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <AIAvatar size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              SkyCast AI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Groq · LLaMA 3.3 70B
              </span>
            </div>
          </div>
          <button
            onClick={loadBriefing}
            disabled={briefingLoading}
            title="Refresh briefing"
            style={{
              padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'rgba(56,189,248,0.06)', color: 'var(--sky)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.2s', fontFamily: 'var(--font-body)',
              opacity: briefingLoading ? 0.4 : 1,
            }}
          >
            {briefingLoading ? '...' : '↻ Brief'}
          </button>
        </div>

        {/* ── BRIEFING BANNER ── */}
        {(briefing || briefingLoading) && (
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(56,189,248,0.03)',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sky)', marginBottom: 4, letterSpacing: '0.06em', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>
              📍 Live Briefing
            </div>
            {briefingLoading ? (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.55, fontWeight: 300 }}>
                {briefing}
              </p>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}
        >
          {/* Empty state with illustration */}
          {isEmpty && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, opacity: 0.85 }}>
              <div className="animate-float">
                <WeatherIllustration />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  Ask me anything
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 300 }}>
                  Weather, travel tips, what to wear...
                </p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className="animate-fade-up"
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 10,
                gap: 8,
                alignItems: 'flex-end',
                animationDelay: '0s',
              }}
            >
              {msg.role === 'ai' && (
                <div style={{ flexShrink: 0, marginBottom: 16 }}>
                  <AIAvatar size={22} />
                </div>
              )}
              <div style={{ maxWidth: '82%' }}>
                <div
                  className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}
                  style={{
                    padding: '9px 13px',
                    borderRadius: 14,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--text)',
                    fontWeight: 300,
                  }}
                >
                  {msg.content}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, paddingLeft: 2, paddingRight: 2, textAlign: msg.role === 'user' ? 'right' : 'left', fontFamily: 'var(--font-mono)' }}>
                  {fmt(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
              <AIAvatar size={22} />
              <div className="chat-bubble-ai" style={{ padding: '10px 14px', borderRadius: 14 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── SUGGESTIONS ── */}
        {messages.length === 0 && !loading && (
          <div className="no-scrollbar" style={{ display: 'flex', gap: 6, padding: '0 14px 10px', overflowX: 'auto', flexShrink: 0 }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.label)}
                style={{
                  padding: '6px 10px', borderRadius: 8, whiteSpace: 'nowrap', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  color: 'var(--text-dim)', fontSize: 11, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(56,189,248,0.07)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(56,189,248,0.2)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)';
                }}
              >
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        )}

        {/* ── INPUT ── */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0, background: 'rgba(255,255,255,0.01)' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about weather, travel, outfits..."
            className="input-dark"
            style={{ flex: 1, padding: '9px 13px', borderRadius: 10, fontSize: 13 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary"
            style={{
              width: 38, height: 38, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: 'none', cursor: 'pointer',
            }}
          >
            {loading ? (
              <span className="animate-spin-slow" style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}