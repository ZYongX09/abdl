import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { forumAPI } from '../api';

function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/diapers?search=${encodeURIComponent(q.trim())}`);
    setQ('');
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 300 }}>
      <i className="fa-solid fa-magnifying-glass" style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-muted)', fontSize: '0.85rem'
      }} />
      <input
        value={q} onChange={e => setQ(e.target.value)}
        placeholder="搜索纸尿裤..."
        aria-label="搜索纸尿裤"
        style={{
          width: '100%', padding: '8px 12px 8px 36px', borderRadius: 24,
          border: '1px solid var(--border)', background: 'var(--input-bg)',
          fontSize: '0.85rem', color: 'var(--text)',
          outline: 'none', transition: 'all 0.2s'
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'var(--bg-card)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--input-bg)'; }}
      />
    </form>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setMobileOpen(false);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMobile(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const d = await forumAPI.notifications();
        if (!cancelled) setNotifCount(d.unread_count || 0);
      } catch {}
    };
    load();
    const timer = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [user]);

  const links = [
    { path: '/', label: '论坛', icon: 'fa-regular fa-comments' },
    { path: '/diapers', label: '纸尿裤', icon: 'fa-solid fa-box' },
    { path: '/rankings', label: '排行榜', icon: 'fa-solid fa-trophy' },
    { path: '/recommend', label: 'AI推荐', icon: 'fa-solid fa-robot' },
    ...(user ? [
      { path: '/messages', label: '私信', icon: 'fa-regular fa-envelope' },
      { path: '/notifications', label: '通知', icon: 'fa-solid fa-bell', badge: notifCount },
    ] : []),
    { path: '/compare', label: '对比工具', icon: 'fa-solid fa-chart-simple' },
    { path: '/termwiki', label: '术语百科', icon: 'fa-solid fa-book' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: '管理后台', icon: 'fa-solid fa-screwdriver-wrench' }] : []),
  ];

  const sidebarContent = (
    <>
      <Link to="/" onClick={closeMobile} style={{
        textDecoration: 'none', color: 'var(--primary-dark)',
        fontSize: '1.3rem', fontWeight: 800, padding: '8px 20px', marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <i className="fa-solid fa-baby" style={{ fontSize: '1.5rem' }} />
        ABDL Space
      </Link>

      <div style={{ padding: '0 14px', marginBottom: 8 }}>
        <SearchBar onSearch={closeMobile} />
      </div>

      <nav style={{ flex: 1 }}>
        {links.map(l => (
          <Link key={l.path} to={l.path} onClick={closeMobile}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 20px', margin: '1px 8px', borderRadius: 28,
              textDecoration: 'none',
              color: isActive(l.path) ? 'white' : 'var(--text)',
              fontWeight: isActive(l.path) ? 700 : 500,
              fontSize: '0.95rem',
              background: isActive(l.path) ? 'var(--primary)' : 'transparent',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { if (!isActive(l.path)) e.target.style.background = 'var(--primary-light)'; }}
            onMouseOut={e => { if (!isActive(l.path)) e.target.style.background = 'transparent'; }}
          >
            <i className={l.icon} style={{ fontSize: '1.15rem', width: 24, textAlign: 'center' }} />
            <span>{l.label}</span>
            {l.badge > 0 && (
              <span className="notif-badge" style={{ marginLeft: 'auto' }}>{l.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '0 20px', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
        {user ? (
          <div>
            <Link to="/profile" onClick={closeMobile} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 28,
              textDecoration: 'none', color: 'inherit', marginBottom: 8
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <i className="fa-solid fa-user" style={{ display: user.avatar ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</div>
              </div>
            </Link>
            <button onClick={() => { logout(); navigate('/'); closeMobile(); }} style={{
              width: '100%', padding: '8px', borderRadius: 20, border: '1px solid var(--border)',
              background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)',
              transition: 'background 0.15s'
            }}
              onMouseOver={e => e.target.style.background = 'var(--input-bg)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              <i className="fa-solid fa-right-from-bracket" style={{ marginRight: 6 }} />
              退出登录
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" onClick={closeMobile} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>登录</Link>
            <Link to="/register" onClick={closeMobile} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>注册</Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}>
        <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
      </button>
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={closeMobile} />
      <div className="sidebar" style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
        padding: '16px 0', overflowY: 'auto'
      }}>
        <style>{`@media (min-width: 769px) { .sidebar { width: 240px; min-width: 240px; } }`}</style>
        {sidebarContent}
      </div>
      <div className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ display: 'none' }}>
        <style>{`@media (max-width: 768px) { .sidebar { display: flex !important; flex-direction: column; width: 280px; min-width: 280px; } }`}</style>
        {sidebarContent}
      </div>
    </>
  );
}
