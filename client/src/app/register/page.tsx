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

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const WeatherBg = () => (
  <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
    <defs>
      <radialGradient id="rg1" cx="60%" cy="30%" r="55%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="rg2" cx="30%" cy="75%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="300" cy="150" r="210" fill="url(#rg1)"/>
    <circle cx="150" cy="380" r="190" fill="url(#rg2)"/>
    <circle cx="80"  cy="80"  r="50"  stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 7" strokeOpacity="0.5"/>
    <circle cx="420" cy="420" r="70"  stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 7" strokeOpacity="0.4"/>
    {/* Hexagonal grid pattern */}
    {[0,1,2,3,4].map(row =>
      [0,1,2,3,4].map(col => {
        const x = col * 110 + (row % 2) * 55;
        const y = row * 95;
        return (
          <polygon key={`${row}-${col}`}
            points={`${x+30},${y} ${x+55},${y+15} ${x+55},${y+45} ${x+30},${y+60} ${x+5},${y+45} ${x+5},${y+15}`}
            stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.2" fill="none"/>
        );
      })
    )}
  </svg>
);

/* Globe illustration for register panel */
const GlobeIllustration = () => (
  <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 260 }}>
    <defs>
      <linearGradient id="globeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6"/>
      </linearGradient>
      <clipPath id="globeClip">
        <circle cx="130" cy="100" r="70"/>
      </clipPath>
    </defs>
    {/* Globe base */}
    <circle cx="130" cy="100" r="70" fill="url(#globeGrad)" opacity="0.15" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4"/>
    {/* Longitude lines */}
    {[-50,-25,0,25,50].map((offset, i) => (
      <ellipse key={i} cx="130" cy="100" rx={Math.abs(offset) === 50 ? 20 : Math.abs(offset) === 25 ? 50 : 70} ry="70" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.3" fill="none" clipPath="url(#globeClip)"/>
    ))}
    {/* Latitude lines */}
    {[-40,-20,0,20,40].map((offset, i) => (
      <ellipse key={i} cx="130" cy={100 + offset} rx={Math.sqrt(70*70 - offset*offset)} ry={12 - Math.abs(offset)*0.1} stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.3" fill="none"/>
    ))}
    {/* Location pins */}
    {[[105,75,'#38bdf8'], [155,95,'#a78bfa'], [120,120,'#2dd4bf'], [148,70,'#f59e0b']].map(([cx, cy, color], i) => (
      <g key={i}>
        <circle cx={cx as number} cy={cy as number} r="5" fill={color as string} opacity="0.9"/>
        <circle cx={cx as number} cy={cy as number} r="9" stroke={color as string} strokeWidth="1" opacity="0.3" fill="none"/>
      </g>
    ))}
    {/* Connecting arcs */}
    <path d="M105 75 Q130 60 155 95" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.5" fill="none"/>
    <path d="M155 95 Q140 110 120 120" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.5" fill="none"/>
  </svg>
);

/* Password rule checker */
const rules = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number',     test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter',     test: (p: string) => /[a-zA-Z]/.test(p) },
];

export default function Register() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const router = useRouter();

  const pwMatch   = confirm === '' || password === confirm;
  const strength  = password.length === 0 ? 0 : rules.filter(r => r.test(password)).length;
  const strengthW = ['0%', '33%', '66%', '100%'][strength];
  const strengthC = ['', '#ef4444', '#f59e0b', '#22c55e'][strength];
  const strengthL = ['', 'Weak', 'Fair', 'Strong'][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwMatch || password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: '0 0 45%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #080a1c 0%, #0a0d28 50%, #0c1035 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
      }} className="hide-sm">
        <WeatherBg />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⛅</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.01em' }}>
              Sky<span style={{ color: 'var(--sky)' }}>Cast</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300 }}>AI Weather Intelligence</p>
        </div>

        {/* Globe illustration */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: 40 }} className="animate-float">
          <GlobeIllustration />
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 280 }}>
          {[
            { num: '∞',    label: 'Cities to track' },
            { num: '5m',   label: 'Refresh rate'   },
            { num: '70B',  label: 'AI parameters'  },
            { num: '100%', label: 'Free forever'   },
          ].map(({ num, label }) => (
            <div key={label} style={{ padding: '14px', borderRadius: 10, textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--sky)', lineHeight: 1, marginBottom: 4 }}>{num}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 300 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 64px)',
        overflowY: 'auto',
      }}>

        {/* Mobile brand */}
        <div className="hide-lg" style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⛅</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24 }}>
              Sky<span style={{ color: 'var(--sky)' }}>Cast</span>
            </span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Back */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 28, transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to home
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 300 }}>
              Start monitoring global weather for free.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6 }}>
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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required
                  placeholder="Create a strong password"
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

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Password strength</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: strengthC }}>{strengthL}</span>
                  </div>
                  {/* Bar track */}
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--surface3, #141f30)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strengthW, borderRadius: 99, background: strengthC, transition: 'width 0.4s ease, background 0.4s ease' }} />
                  </div>
                  {/* Rules */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                    {rules.map(r => {
                      const passed = r.test(password);
                      return (
                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: passed ? '#4ade80' : 'var(--text-muted)', transition: 'color 0.3s' }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: passed ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${passed ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`, transition: 'all 0.3s', color: passed ? '#4ade80' : 'var(--text-muted)', flexShrink: 0 }}>
                            {passed ? <CheckIcon /> : <span style={{ fontSize: 8 }}>•</span>}
                          </span>
                          {r.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6 }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCf ? 'text' : 'password'} required
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-dark"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 14px',
                    borderRadius: 11,
                    fontSize: 14,
                    borderColor: !pwMatch ? 'rgba(251,113,133,0.5)' : undefined,
                  }}
                />
                <button type="button" onClick={() => setShowCf(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2, transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>
                  <EyeIcon open={showCf} />
                </button>
              </div>
              {/* Match indicator */}
              {confirm.length > 0 && (
                <p style={{ fontSize: 12, marginTop: 6, color: pwMatch ? '#4ade80' : '#fb7185', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {pwMatch ? (
                    <><span style={{ fontSize: 14 }}>✓</span> Passwords match</>
                  ) : (
                    <><span style={{ fontSize: 14 }}>✗</span> Passwords do not match</>
                  )}
                </p>
              )}
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
            <button type="submit" disabled={loading || !pwMatch || strength < 1} className="btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: 11, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Login link */}
          <Link href="/login" style={{ display: 'block', textDecoration: 'none' }}>
            <button type="button" className="btn-ghost"
              style={{ width: '100%', padding: '12px', borderRadius: 11, fontSize: 14, cursor: 'pointer' }}>
              Sign in instead
            </button>
          </Link>

          {/* Trust note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 28 }}>
            {[
              { icon: '🔒', text: 'Bcrypt encrypted' },
              { icon: '🛡️', text: 'JWT secured'     },
              { icon: '🆓', text: 'Always free'     },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 13 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}