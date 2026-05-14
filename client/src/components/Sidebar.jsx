import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { forumAPI, messagesAPI } from '../api';


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
    <form onSubmit={handleSearch} style={{ position: 'relative' }}>
      <i className="fa-solid fa-magnifying-glass" style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none'
      }} />
      <input
        className="sidebar-search-input"
        value={q} onChange={e => setQ(e.target.value)}
        placeholder="搜索纸尿裤..."
        aria-label="搜索纸尿裤"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="清除搜索"
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--input-bg)', border: 'none', borderRadius: '50%',
            width: 22, height: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '0.7rem',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--border)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--input-bg)'; }}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </form>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileSidebarRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const load = async () => {
      try {
        const [notifs, convs] = await Promise.all([
          forumAPI.notifications().catch(() => ({ notifications: [] })),
          messagesAPI.conversations().catch(() => ({ conversations: [] })),
        ]);
        const notifUnread = (notifs.notifications || []).filter(n => !n.read).length;
        const msgUnread = (convs.conversations || []).reduce((s, c) => s + (c.unread || 0), 0);
        setUnreadCount(notifUnread + msgUnread);
      } catch {}
    };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, [user]);

  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setMobileOpen(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.classList.toggle('sidebar-locked', mobileOpen);
    return () => document.body.classList.remove('sidebar-locked');
  }, [mobileOpen]);

  // Close on Escape & focus trap
  useEffect(() => {
    if (!mobileOpen) return;
    const sidebar = mobileSidebarRef.current;
    if (!sidebar) return;
    const focusable = sidebar.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { closeMobile(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Close on route change
  useEffect(() => { closeMobile(); }, [location.pathname]);

  const links = [
    { path: '/', label: '论坛', icon: 'fa-regular fa-comments' },
    { path: '/diapers', label: '纸尿裤', icon: 'fa-solid fa-box' },
    { path: '/rankings', label: '排行榜', icon: 'fa-solid fa-trophy' },
    { path: '/recommend', label: 'AI推荐', icon: 'fa-solid fa-robot' },
    ...(user ? [
      { path: '/messages', label: '私信 & 通知', icon: 'fa-regular fa-envelope', badge: unreadCount },
    ] : []),
    { path: '/settings', label: '设置', icon: 'fa-solid fa-gear' },
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
            className={isActive(l.path) ? 'sidebar-link active' : 'sidebar-link'}
          >
            <i className={l.icon} style={{ fontSize: '1.15rem', width: 24, textAlign: 'center' }} />
            <span style={{ flex: 1 }}>{l.label}</span>
            {l.badge > 0 && (
              <span className="notif-badge" style={{ position: 'static', minWidth: 20, height: 20, fontSize: '11px', flexShrink: 0 }}>
                {l.badge > 99 ? '99+' : l.badge}
              </span>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', overflow: 'hidden'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fa-solid fa-user" />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</div>
              </div>
            </Link>
            <button className="sidebar-logout-btn" onClick={() => { logout(); navigate('/'); closeMobile(); }}>
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
      {/* Hamburger button - visible only on mobile */}
      <button className="sidebar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}>
        <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
      </button>

      {/* Desktop sidebar - always visible, part of flex layout */}
      <div className="sidebar sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={closeMobile} />
      <div ref={mobileSidebarRef} className={`sidebar sidebar-mobile ${mobileOpen ? 'open' : ''}`}>
        {sidebarContent}
      </div>
    </>
  );
}
