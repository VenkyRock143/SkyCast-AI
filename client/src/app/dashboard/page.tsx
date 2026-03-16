'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import AIChat from '@/components/AIChat';
import { City } from '@/types/city';
import { useRouter } from 'next/navigation';

/* ── RISK STYLES ── */
const RISK_META: Record<string, { cls: string; dot: string }> = {
  'Extreme Heat': { cls: 'risk-extreme', dot: '#ef4444' },
  'High Heat':    { cls: 'risk-high',    dot: '#fb923c' },
  'Freezing':     { cls: 'risk-freeze',  dot: '#63b3ed' },
  'Cold Risk':    { cls: 'risk-cold',    dot: '#38bdf8' },
  'High Humidity':{ cls: 'risk-humid',   dot: '#2dd4bf' },
  'Strong Wind':  { cls: 'risk-wind',    dot: '#a78bfa' },
  'Normal':       { cls: 'risk-normal',  dot: '#4ade80' },
};

const weatherEmoji = (desc?: string) => {
  if (!desc) return '🌡️';
  const d = desc.toLowerCase();
  if (d.includes('thunder'))                        return '⛈️';
  if (d.includes('snow'))                           return '🌨️';
  if (d.includes('rain') || d.includes('drizzle'))  return '🌧️';
  if (d.includes('cloud'))                          return '☁️';
  if (d.includes('mist')  || d.includes('fog'))     return '🌫️';
  if (d.includes('clear') || d.includes('sun'))     return '☀️';
  return '🌤️';
};

const windDegToDir = (deg?: number) => {
  if (deg === undefined) return '–';
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
};

/* ── ICONS ── */
const Icon = {
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  grid:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  list:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  menu:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

export default function Dashboard() {
  const [cities,        setCities]        = useState<City[]>([]);
  const [cityInput,     setCityInput]     = useState('');
  const [searchFilter,  setSearchFilter]  = useState('');
  const [loading,       setLoading]       = useState(true);
  const [adding,        setAdding]        = useState(false);
  const [addError,      setAddError]      = useState('');
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);
  const [sortBy,        setSortBy]        = useState<'name'|'temp'|'humidity'>('name');
  const [view,          setView]          = useState<'grid'|'list'>('grid');
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const router = useRouter();

  const favorites = cities.filter(c => c.isFavorite);
  const nonFavs = cities
    .filter(c => !c.isFavorite && c.name.toLowerCase().includes(searchFilter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'temp')     return (b.weather?.temp ?? 0) - (a.weather?.temp ?? 0);
      if (sortBy === 'humidity') return (b.weather?.humidity ?? 0) - (a.weather?.humidity ?? 0);
      return a.name.localeCompare(b.name);
    });

  const avgTemp = cities.length
    ? (cities.reduce((s, c) => s + (c.weather?.temp ?? 0), 0) / cities.length).toFixed(1)
    : null;
  const hottest = cities.length ? cities.reduce((a, b) => (a.weather?.temp ?? 0) > (b.weather?.temp ?? 0) ? a : b) : null;
  const coldest = cities.length ? cities.reduce((a, b) => (a.weather?.temp ?? 0) < (b.weather?.temp ?? 0) ? a : b) : null;

  const fetchCities = useCallback(async () => {
    try {
      const res = await api.get('/cities');
      setCities(Array.isArray(res.data) ? res.data : []);
      setLastUpdated(new Date());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCities();
    const t = setInterval(fetchCities, 60000);
    return () => clearInterval(t);
  }, [fetchCities]);

  const addCity = async () => {
    if (!cityInput.trim() || adding) return;
    setAdding(true); setAddError('');
    try {
      await api.post('/cities', { name: cityInput.trim() });
      setCityInput('');
      await fetchCities();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add city');
    } finally { setAdding(false); }
  };

  const toggleFavorite = async (id: string) => {
    setCities(prev => prev.map(c => c._id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    try { await api.patch(`/cities/${id}/favorite`); await fetchCities(); }
    catch { fetchCities(); }
  };

  const deleteCity = async (id: string) => {
    if (!confirm('Remove this city?')) return;
    setDeletingId(id);
    try { await api.delete(`/cities/${id}`); setCities(prev => prev.filter(c => c._id !== id)); }
    catch { fetchCities(); }
    finally { setDeletingId(null); }
  };

  const logout = () => { localStorage.removeItem('token'); router.push('/login'); };

  /* ── SIDEBAR CONTENT (reused in both desktop + mobile drawer) ── */
  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⛅</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
            Sky<span style={{ color: 'var(--sky)' }}>Cast</span>
          </span>
        </div>
        {lastUpdated && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div className="live-dot" style={{ width: 5, height: 5 }} />
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Overview stats */}
      {cities.length > 0 && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Overview</p>
          {[
            { label: 'Cities tracked', val: cities.length.toString() },
            { label: 'Average temp',   val: avgTemp ? `${avgTemp}°C` : '–' },
            { label: 'Hottest',        val: hottest ? `${hottest.name.split(',')[0]} · ${Math.round(hottest.weather?.temp ?? 0)}°` : '–' },
            { label: 'Coldest',        val: coldest ? `${coldest.name.split(',')[0]} · ${Math.round(coldest.weather?.temp ?? 0)}°` : '–' },
          ].map(({ label, val }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Favourites */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10, padding: '0 4px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
          ⭐ Favourites {favorites.length > 0 && `(${favorites.length})`}
        </p>
        {favorites.map(c => (
          <div key={c._id} style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'default', transition: 'border-color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(56,189,248,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{c.name}</p>
              <button onClick={() => toggleFavorite(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 2, opacity: 0.7 }} title="Unpin">⭐</button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--sky)', marginTop: 3 }}>
              {weatherEmoji(c.weather?.description)} {Math.round(c.weather?.temp ?? 0)}°C · {c.weather?.description || '–'}
            </p>
          </div>
        ))}
        {favorites.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 4px', fontStyle: 'italic', fontWeight: 300 }}>Star a city to pin it here.</p>
        )}
      </div>

      {/* Logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(251,113,133,0.2)', background: 'rgba(251,113,133,0.06)', color: 'var(--rose)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}>
          {Icon.logout} Sign Out
        </button>
      </div>
    </>
  );

  return (
    <AuthGuard>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>

        {/* ── MOBILE SIDEBAR OVERLAY ── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* ── MOBILE SIDEBAR DRAWER ── */}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
          width: 260,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2)',
        }}
          className="hide-lg"
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 14px 0', flexShrink: 0 }}>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
              {Icon.close}
            </button>
          </div>
          <SidebarContent />
        </div>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          className="hide-sm hide-md"
          style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}
        >
          <SidebarContent />
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* ── HEADER ── */}
          <header style={{ flexShrink: 0, padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>

            {/* Mobile menu button */}
            <button
              className="hide-lg"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              {Icon.menu}
            </button>

            {/* Add city input */}
            <div style={{ flex: 1, maxWidth: 380 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                    {Icon.search}
                  </span>
                  <input
                    value={cityInput}
                    onChange={e => { setCityInput(e.target.value); setAddError(''); }}
                    onKeyDown={e => e.key === 'Enter' && addCity()}
                    placeholder="Add a city…"
                    className="input-dark"
                    style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: 13 }}
                  />
                </div>
                <button
                  onClick={addCity}
                  disabled={adding || !cityInput.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {adding ? (
                    <span className="animate-spin-slow" style={{ display: 'block', width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  ) : '+ Add'}
                </button>
              </div>
              {addError && <p style={{ fontSize: 11, color: 'var(--rose)', marginTop: 4, paddingLeft: 2 }}>{addError}</p>}
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
              {/* Filter — hidden on smallest screens */}
              <input
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filter…"
                className="input-dark hide-sm"
                style={{ padding: '7px 12px', borderRadius: 9, fontSize: 12, width: 120 }}
              />

              {/* Sort — hidden on sm */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name'|'temp'|'humidity')}
                className="input-dark hide-sm"
                style={{ padding: '7px 10px', borderRadius: 9, fontSize: 12, cursor: 'pointer' }}
              >
                <option value="name">A–Z</option>
                <option value="temp">Temp ↓</option>
                <option value="humidity">Humid ↓</option>
              </select>

              {/* View toggle */}
              <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {(['grid','list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.15s, color 0.15s', background: view === v ? 'rgba(56,189,248,0.12)' : 'transparent', color: view === v ? 'var(--sky)' : 'var(--text-muted)' }}>
                    {v === 'grid' ? Icon.grid : Icon.list}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ── CONTENT ── */}
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px, 2vw, 24px)' }}>

            {/* Section title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
                Global Stations · {nonFavs.length} cities
              </p>
              {/* Mobile filter inline */}
              <input
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filter cities…"
                className="input-dark hide-lg"
                style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, width: 140 }}
              />
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 210, borderRadius: 14 }} />)}
              </div>
            ) : nonFavs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', gap: 12 }}>
                <div className="animate-float" style={{ fontSize: 56 }}>🌍</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
                  {cities.length === 0 ? 'No cities yet' : 'No results'}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300, maxWidth: 280 }}>
                  {cities.length === 0 ? 'Type a city name above and press Enter to start monitoring.' : 'Try a different search term.'}
                </p>
              </div>
            ) : view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 12, paddingBottom: 80 }}>
                {nonFavs.map((c, i) => <CityCard key={c._id} city={c} index={i} onFavorite={toggleFavorite} onDelete={deleteCity} deleting={deletingId === c._id} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
                {nonFavs.map((c, i) => <CityRow key={c._id} city={c} index={i} onFavorite={toggleFavorite} onDelete={deleteCity} deleting={deletingId === c._id} />)}
              </div>
            )}
          </div>
        </main>

        <AIChat />
      </div>
    </AuthGuard>
  );
}

/* ── CITY CARD ── */
function CityCard({ city, index, onFavorite, onDelete, deleting }: any) {
  const risk   = city.risk || { level: 'Normal' };
  const meta   = RISK_META[risk.level] || RISK_META['Normal'];
  const emoji  = weatherEmoji(city.weather?.description);

  return (
    <div
      className="animate-fade-up card-hover"
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        animationDelay: `${index * 0.04}s`,
        opacity: 0,
        animationFillMode: 'forwards',
        animationName: 'fadeUp',
        animationDuration: '0.45s',
        animationTimingFunction: 'cubic-bezier(.22,.68,0,1.2)',
      }}
    >
      {/* Subtle top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${meta.dot}44, transparent)` }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {city.name}
          </h3>
          {city.weather?.country && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {city.weather.country}
            </p>
          )}
        </div>
        <button
          onClick={() => onFavorite(city._id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px', marginLeft: 8, transition: 'transform 0.2s', flexShrink: 0 }}
          title={city.isFavorite ? 'Unpin' : 'Pin to favourites'}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          {city.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {/* Temperature + emoji */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {Math.round(city.weather?.temp ?? 0)}°
        </span>
        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, textTransform: 'capitalize', fontWeight: 300 }}>
            {city.weather?.description || '–'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {[
          { emoji: '💧', label: 'Humidity', val: `${city.weather?.humidity ?? 0}%` },
          { emoji: '💨', label: 'Wind',     val: city.weather?.wind ? `${Math.round(city.weather.wind)} m/s` : '–' },
          { emoji: '🌡️', label: 'Feels',    val: city.weather?.feelsLike != null ? `${Math.round(city.weather.feelsLike)}°` : '–' },
        ].map(({ emoji: ico, label, val }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 14 }}>{ico}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Extra row: pressure + visibility + wind dir */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Pressure', val: city.weather?.pressure ? `${city.weather.pressure} hPa` : '–' },
          { label: 'Visibility', val: city.weather?.visibility ? `${(city.weather.visibility / 1000).toFixed(1)} km` : '–' },
          { label: 'Wind Dir', val: windDegToDir(city.weather?.windDir) },
        ].map(({ label, val }) => (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <span className={meta.cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
          {risk.level}
        </span>
        <button
          onClick={() => onDelete(city._id)}
          disabled={deleting}
          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 7, border: '1px solid rgba(251,113,133,0.15)', background: 'rgba(251,113,133,0.06)', color: 'var(--rose)', cursor: 'pointer', opacity: 0, fontFamily: 'var(--font-body)', fontWeight: 500, transition: 'opacity 0.2s' }}
          className="remove-btn"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0'; }}
        >
          {deleting ? '…' : 'Remove'}
        </button>
      </div>
    </div>
  );
}

/* ── CITY ROW ── */
function CityRow({ city, index, onFavorite, onDelete, deleting }: any) {
  const risk  = city.risk || { level: 'Normal' };
  const meta  = RISK_META[risk.level] || RISK_META['Normal'];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="animate-fade-up"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 12,
        background: hovered ? 'rgba(255,255,255,0.025)' : 'var(--surface2)',
        border: `1px solid ${hovered ? 'rgba(56,189,248,0.2)' : 'var(--border)'}`,
        transition: 'background 0.2s, border-color 0.2s',
        animationDelay: `${index * 0.03}s`,
        opacity: 0,
        animationFillMode: 'forwards',
        animationName: 'fadeUp',
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(.22,.68,0,1.2)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{weatherEmoji(city.weather?.description)}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 300 }}>{city.weather?.description || '–'}</p>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', flexShrink: 0, minWidth: 56, textAlign: 'right' }}>
        {Math.round(city.weather?.temp ?? 0)}°C
      </div>

      <div className="hide-sm" style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0, minWidth: 120 }}>
        <span>💧 {city.weather?.humidity ?? 0}%</span>
        <span>💨 {Math.round(city.weather?.wind ?? 0)} m/s</span>
      </div>

      <span className={`hide-sm ${meta.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0, fontFamily: 'var(--font-body)' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
        {risk.level}
      </span>

      <button onClick={() => onFavorite(city._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, flexShrink: 0, transition: 'transform 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
        {city.isFavorite ? '⭐' : '☆'}
      </button>

      <button onClick={() => onDelete(city._id)} disabled={deleting} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--rose)', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
        {deleting ? '…' : '✕'}
      </button>
    </div>
  );
}