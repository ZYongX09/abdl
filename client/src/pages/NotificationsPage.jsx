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

  if (!user) return (
    <div className="hero-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginBottom: 16 }}>
        <i className="fa-solid fa-bell" />
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--hero-text)', marginBottom: 8 }}>通知</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>登录后查看通知</p>
      <Link to="/login" className="btn btn-primary"><i className="fa-solid fa-right-to-bracket" /> 去登录</Link>
    </div>
  );
  if (loading) return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  const getLink = (n) => {
    if (n.type === 'like') return `/forum/${n.related_id}`;
    if (n.type === 'comment' || n.type === 'reply') return `/forum/${n.related_id}`;
    return '#';
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4"><i className="fa-solid fa-bell text-primary" /> 通知</h2>
      {notifs.length === 0 ? (
        <div className="text-center py-16 text-base-content/40">
          <i className="fa-solid fa-bell-slash text-4xl mb-3 block" />
          <p>暂无通知</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifs.map((n, i) => (
            <Link to={getLink(n)} key={n.id} className="no-underline text-inherit">
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow ${
                n.read ? 'bg-base-100 border-base-300' : 'bg-primary/10 border-primary/30'
              }`} style={{ animationDelay: `${i * 0.04}s` }}>
                <span className={`text-lg ${n.type === 'like' ? 'text-error' : 'text-primary'}`}>
                  <i className={`fa-solid ${typeIcons[n.type] || 'fa-circle'}`} />
                </span>
                <div className="flex-1">
                  <span className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}>
                    {n.message || '互动了你的内容'}
                  </span>
                  <div className="text-sm text-base-content/40 mt-0.5">{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
