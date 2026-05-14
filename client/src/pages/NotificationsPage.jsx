import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumAPI } from '../api';
import { useAuth } from '../AuthContext';
import { timeAgo } from '../utils';

const typeIcons = { comment: 'fa-comment', reply: 'fa-reply', like: 'fa-heart' };

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadNotifs();
    forumAPI.readAllNotifications().catch(()=>{});
  }, []);

  const loadNotifs = async () => {
    try {
      const d = await forumAPI.notifications();
      setNotifs(d.notifications || []);
    } catch(e) {} finally { setLoading(false); }
  };

  if (!user) return <div style={{textAlign:'center',padding:60}}><h2><i className="fa-solid fa-circle-exclamation" /> 请先登录</h2></div>;
  if (loading) return <div className="loading-spinner" role="status" aria-live="polite"><div className="spinner" /><span>加载通知</span></div>;

  const getLink = (n) => {
    if (n.type === 'like') return `/forum/${n.related_id}`;
    if (n.type === 'comment' || n.type === 'reply') return `/forum/${n.related_id}`;
    return '#';
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>
        <i className="fa-solid fa-bell" /> 通知
      </h2>
      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-bell-slash" /></div>
          <h3>暂无通知</h3>
        </div>
      ) : (
        notifs.map((n, i) => (
          <Link to={getLink(n)} key={n.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stagger-item" style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 8,
              background: n.read ? 'var(--bg-card)' : 'var(--primary-light)',
              border: `1px solid ${n.read ? 'var(--border)' : 'var(--primary)'}`,
              transition: 'all 0.2s', cursor: 'pointer',
              animationDelay: `${i * 0.04}s`,
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem', color: n.type === 'like' ? 'var(--like-active)' : 'var(--primary-dark)' }}>
                  <i className={`fa-solid ${typeIcons[n.type] || 'fa-circle'}`} />
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: n.read?400:600 }}>
                    {n.message || '互动了你的内容'}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {timeAgo(n.created_at)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-dark)' }} />
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
