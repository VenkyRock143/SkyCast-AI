'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Global City Monitoring',
    desc: 'Track unlimited cities worldwide. Live data refreshes every 5 minutes with pressure, wind, visibility and more.',
    accent: '#38bdf8',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2 12 12"/><path d="m22 2-5 5"/><path d="m22 2-5 14-4-4-4 4-2-9"/>
      </svg>
    ),
    title: 'Groq AI Intelligence',
    desc: 'LLaMA 3.3 70B powered assistant gives you personalized weather briefings, travel tips and activity advice.',
    accent: '#a78bfa',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: 'Smart Risk Assessment',
    desc: 'Automatic heat, cold, wind and humidity risk alerts colour-coded on every city card in real time.',
    accent: '#fb923c',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Favourites & Pinning',
    desc: 'Pin your most important locations to the sidebar for instant access. Organise your personal weather network.',
    accent: '#f59e0b',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    title: 'Grid & List Views',
    desc: 'Switch between a beautiful card grid and a compact list view. Sort by name, temperature or humidity.',
    accent: '#2dd4bf',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Secure JWT Auth',
    desc: 'Your account is protected with bcrypt-hashed passwords and JWT tokens. Your data never leaves your dashboard.',
    accent: '#4ade80',
  },
];

const STATS = [
  { val: '∞',     label: 'Cities tracked'  },
  { val: '5 min', label: 'Update interval' },
  { val: '70B',   label: 'AI parameters'   },
  { val: '100%',  label: 'Free to use'     },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ background: 'var(--bg)' }}>

      {/* ── AMBIENT ORBS ── */}
      {mounted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '8%', left: '15%',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
            animation: 'orb 18s ease-in-out infinite',
            filter: 'blur(1px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', right: '10%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
            animation: 'orb 22s ease-in-out infinite reverse',
          }} />
          <div style={{
            position: 'absolute', top: '55%', left: '45%',
            width: 350, height: 350,
            background: 'radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 70%)',
            animation: 'orb 15s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* ── GRID BACKGROUND ── */}
      <div className="fixed inset-0 grid-pattern opacity-40 pointer-events-none" style={{ zIndex: 0 }} />

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--grad-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>⛅</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
                Sky<span style={{ color: 'var(--sky)' }}>Cast</span>
              </span>
            </div>

            {/* Nav links — hidden on mobile */}
            <div className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {['Features', 'Dashboard', 'About'].map(l => (
                <a key={l} href="#features"
                  style={{ color: 'var(--text-dim)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                  {l}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/login">
                <button className="btn-ghost" style={{ padding: '8px 8px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="btn-primary" style={{ padding: '8px 20px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10" style={{ padding: '80px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>

          {/* Status pill */}
          <div className="animate-fade-up" style={{ animationDelay: '0s', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, marginBottom: 32, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <div className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sky)', letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>
              LIVE · GROQ AI + LLAMA 3.3 70B
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up" style={{ animationDelay: '0.08s', fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 700, marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Weather intelligence,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #2dd4bf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              beautifully simple
            </span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up" style={{ animationDelay: '0.16s', fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-dim)', marginBottom: 40, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 300 }}>
            Monitor cities across the globe in real time. Ask your AI assistant anything —
            outfit advice, travel plans, weather risks — all powered by Groq.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up" style={{ animationDelay: '0.24s', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register">
              <button className="btn-primary" style={{ padding: '14px 32px', borderRadius: 12, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Launch Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-ghost" style={{ padding: '14px 28px', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="animate-fade-up" style={{ animationDelay: '0.32s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1, marginTop: 72, maxWidth: 640, margin: '72px auto 0', background: 'var(--border)' }}>
          {STATS.map(({ val, label }) => (
            <div key={label} style={{ background: 'var(--surface2)', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--sky)', lineHeight: 1, marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="relative z-10" style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="animate-fade-up glass" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.04)' }}>
          {/* Fake browser bar */}
          <div style={{ background: 'var(--surface)', padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: 240, margin: '0 auto' }}>
              skycast.app/dashboard
            </div>
          </div>
          {/* Mock dashboard */}
          <div style={{ display: 'flex', height: 280 }}>
            {/* Sidebar mock */}
            <div className="hide-sm" style={{ width: 180, background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: 16, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Sky<span style={{ color: 'var(--sky)' }}>Cast</span></div>
              {['London', 'Tokyo', 'New York'].map((c, i) => (
                <div key={c} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 6, background: i === 0 ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(56,189,248,0.2)' : 'var(--border)'}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{c}</div>
                  <div style={{ fontSize: 10, color: 'var(--sky)', marginTop: 2 }}>{['☀️ 18°C', '🌧️ 12°C', '☁️ 9°C'][i]}</div>
                </div>
              ))}
            </div>
            {/* Cards mock */}
            <div style={{ flex: 1, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, alignContent: 'start', overflow: 'hidden' }}>
              {[
                { city: 'Pune', temp: '21°', desc: 'Partly cloudy', emoji: '⛅', risk: 'Normal', rc: 'var(--mint)' },
                { city: 'Hyderabad', temp: '38°', desc: 'Clear sky', emoji: '☀️', risk: 'High Heat', rc: '#fb923c' }
              ].map(({ city, temp, desc, emoji, risk, rc }) => (
                <div key={city} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{city}</div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{temp}</div>
                  <div style={{ fontSize: 16, margin: '4px 0' }}>{emoji}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 6 }}>{desc}</div>
                  <div style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, display: 'inline-block', fontWeight: 600, background: `${rc}18`, color: rc }}>{risk}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10" style={{ padding: '60px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--sky)', marginBottom: 12, fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>
            What&apos;s included
          </div>
          <h2 className="animate-fade-up" style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, marginBottom: 12 }}>
            Everything you need to monitor the world
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 15, fontWeight: 300 }}>
            Professional-grade weather intelligence, built for everyone.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title}
              className="animate-fade-up glass glass-hover"
              style={{ animationDelay: `${i * 0.07}s`, borderRadius: 16, padding: '24px', transition: 'all 0.25s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = f.accent + '44'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: f.accent, background: f.accent + '14', border: `1px solid ${f.accent}28` }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10" style={{ padding: '0 24px 100px', maxWidth: 800, margin: '0 auto' }}>
        <div className="animate-fade-up" style={{ borderRadius: 24, padding: 'clamp(32px, 5vw, 56px)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(56,189,248,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(56,189,248,0.1), transparent)', borderRadius: '50%' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--sky)', marginBottom: 16, textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
            Get started for free
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, marginBottom: 14 }}>
            Ready to track the world?
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 15, marginBottom: 32, fontWeight: 300 }}>
            Create your free account and start monitoring global weather in seconds.
          </p>
          <Link href="/register">
            <button className="btn-primary" style={{ padding: '14px 36px', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>
              Create Free Account →
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10" style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Built with Next.js · Node.js · MongoDB · Groq AI ·{' '}
          <span style={{ color: 'var(--sky)' }}>SkyCast</span>
        </p>
      </footer>
    </div>
  );
}