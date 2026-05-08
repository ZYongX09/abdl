import { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../api';
import { useAuth } from '../AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

function timeAgo(d) {
  const diff=Date.now()-new Date(d).getTime();
  const m=Math.floor(diff/60000),h=Math.floor(diff/3600000),day=Math.floor(diff/86400000);
  if(m<1)return'刚刚';if(m<60)return`${m}分钟前`;if(h<24)return`${h}小时前`;if(day<7)return`${day}天前`;
  return new Date(d).toLocaleDateString('zh-CN');
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [activeOther, setActiveOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null);

  useEffect(() => { loadConvs(); }, []);

  const loadConvs = async () => {
    try { const d = await messagesAPI.conversations(); setConvs(d.conversations); } catch {} finally { setLoading(false); }
  };

  const openChat = async (otherId) => {
    setActiveOther(otherId);
    try { const d = await messagesAPI.withUser(otherId); setMessages(d.messages); setActiveOther(d.other); } catch {}
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 100);
  };

  const sendMsg = async () => {
    if (!text.trim() || !activeOther) return;
    try {
      await messagesAPI.send({ receiver_id: activeOther.id, content: text });
      setText('');
      const d = await messagesAPI.withUser(activeOther.id);
      setMessages(d.messages);
      loadConvs();
      setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 100);
    } catch {}
  };

  if (!user) return (
    <div style={{textAlign:'center',padding:60}}>
      <h2><i className="fa-solid fa-circle-exclamation" /> 请先登录</h2>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', background: 'var(--bg-card)' }}>
      <div style={{ width: 300, minWidth: 280, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
        <h3 style={{ padding: 16, borderBottom: '1px solid var(--border)', margin: 0 }}>
          <i className="fa-regular fa-envelope" /> 私信
        </h3>
        {loading ? <LoadingSkeleton count={3} type="feed" /> : convs.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>暂无对话</p>
        ) : (
          convs.map(c => (
            <div key={c.id} onClick={() => openChat(c.other_id)}
              style={{
                padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: activeOther?.id === c.other_id ? 'var(--primary-light)' : 'var(--bg-card)',
                transition: 'background 0.15s'
              }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="post-avatar" style={{ width: 40, height: 40 }}>
                  <i className="fa-solid fa-user-astronaut" />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600 }}>{c.other_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.last_message || '开始聊天...'}
                  </div>
                </div>
                {c.unread > 0 && <span className="notif-badge" style={{ position: 'static' }}>{c.unread}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeOther ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <p><i className="fa-solid fa-arrow-left" /> 选择一个对话开始聊天</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
              <i className="fa-regular fa-envelope" /> {activeOther.username}
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                    background: m.sender_id === user.id ? 'var(--primary)' : 'var(--input-bg)',
                    color: m.sender_id === user.id ? 'white' : 'var(--text)',
                    fontSize: '0.9rem', animation: 'fadeInUp 0.2s ease-out'
                  }}>
                    {m.content}
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2, textAlign: 'right' }}>
                      {timeAgo(m.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input className="form-control" value={text} onChange={e=>setText(e.target.value)}
                placeholder="输入消息..." onKeyDown={e => e.key==='Enter' && sendMsg()} />
              <button className="btn btn-primary btn-sm" onClick={sendMsg}>
                <i className="fa-solid fa-paper-plane" /> 发送
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
