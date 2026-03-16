'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const WeatherBg = () => (
  <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
    <defs>
      <radialGradient id="g1" cx="30%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="g2" cx="70%" cy="70%" r="50%">
        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="150" cy="150" r="200" fill="url(#g1)"/>
    <circle cx="350" cy="350" r="180" fill="url(#g2)"/>
    {/* Decorative circles */}
    <circle cx="100" cy="380" r="60" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.4"/>
    <circle cx="400" cy="100" r="80" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.3"/>
    {/* Grid lines */}
    {[0,1,2,3,4,5].map(i => (
      <line key={`h${i}`} x1="0" y1={i*100} x2="500" y2={i*100} stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.15"/>
    ))}
    {[0,1,2,3,4,5].map(i => (
      <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="500" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.15"/>
    ))}
  </svg>
);

const WeatherIllustration = () => (
  <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 280 }}>
    <defs>
      <linearGradient id="sunG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
      <linearGradient id="cloudG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8"/>
      </linearGradient>
      <linearGradient id="rainG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8"/>
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    {/* Sun */}
    <circle cx="200" cy="65" r="32" fill="url(#sunG)" opacity="0.9"/>
    {[0,45,90,135,180,225,270,315].map(deg => (
      <line key={deg}
        x1={200 + 40*Math.cos(deg*Math.PI/180)} y1={65 + 40*Math.sin(deg*Math.PI/180)}
        x2={200 + 50*Math.cos(deg*Math.PI/180)} y2={65 + 50*Math.sin(deg*Math.PI/180)}
        stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
    ))}
    {/* Cloud body */}
    <ellipse cx="130" cy="110" rx="55" ry="32" fill="url(#cloudG)"/>
    <ellipse cx="90"  cy="118" rx="36" ry="28" fill="url(#cloudG)"/>
    <ellipse cx="162" cy="118" rx="36" ry="28" fill="url(#cloudG)"/>
    <ellipse cx="120" cy="100" rx="34" ry="28" fill="white" opacity="0.9"/>
    <ellipse cx="148" cy="105" rx="28" ry="24" fill="white" opacity="0.85"/>
    {/* Rain drops */}
    {[85,105,125,145,165].map((x, i) => (
      <g key={x} opacity="0.8">
        <line x1={x} y1={148 + (i%2)*6} x2={x-4} y2={163 + (i%2)*6} stroke="url(#rainG)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1={x+12} y1={152 + ((i+1)%2)*6} x2={x+8} y2={167 + ((i+1)%2)*6} stroke="url(#rainG)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </g>
    ))}
    {/* Stars */}
    {[[40,40],[55,80],[30,100]].map(([x,y], i) => (
      <circle key={i} cx={x} cy={y} r={i===0?3:2} fill="white" opacity={0.5-i*0.1}/>
    ))}
  </svg>
);

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── LEFT PANEL (hidden on mobile) ── */}
      <div style={{
        flex: '0 0 45%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #080d1a 0%, #0a1628 50%, #0c1535 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }} className="hide-sm">
        <WeatherBg />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⛅</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.01em' }}>
              Sky<span style={{ color: 'var(--sky)' }}>Cast</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300 }}>AI Weather Intelligence</p>
        </div>

        {/* Illustration */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: 40 }} className="animate-float">
          <WeatherIllustration />
        </div>

        {/* Features list */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 300 }}>
          {[
            { icon: '🌍', text: 'Monitor unlimited cities worldwide' },
            { icon: '🤖', text: 'AI briefings powered by Groq LLaMA 3.3' },
            { icon: '⚡', text: 'Real-time risk assessment & alerts' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, marginBottom: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 300 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 64px)',
        overflowY: 'auto',
        position: 'relative',
      }}>

        {/* Mobile brand */}
        <div className="hide-lg" style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⛅</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>
              Sky<span style={{ color: 'var(--sky)' }}>Cast</span>
            </span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Back link */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to home
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 32px)', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 300 }}>
              Sign in to your SkyCast dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email" required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-dark"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 11, fontSize: 14 }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark"
                  style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 11, fontSize: 14 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2, transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderRadius: 10, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 13, color: '#fb7185', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>New to SkyCast?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Register link */}
          <Link href="/register" style={{ display: 'block', textDecoration: 'none' }}>
            <button type="button" className="btn-ghost"
              style={{ width: '100%', padding: '12px', borderRadius: 11, fontSize: 14, cursor: 'pointer' }}>
              Create a free account
            </button>
          </Link>

          {/* Footer note */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 28, fontWeight: 300, lineHeight: 1.6 }}>
            Protected by JWT authentication &amp; bcrypt encryption
          </p>
        </div>
      </div>
    </div>
  );
}