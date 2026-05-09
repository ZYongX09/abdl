import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { forumAPI } from '../api';
import { useAuth } from '../AuthContext';

function timeAgo(d) {
  const diff = Date.now()-new Date(d).getTime();
  const m=Math.floor(diff/60000),h=Math.floor(diff/3600000),day=Math.floor(diff/86400000);
  if(m<1)return'刚刚';if(m<60)return`${m}分钟前`;if(h<24)return`${h}小时前`;if(day<7)return`${day}天前`;
  return new Date(d).toLocaleDateString('zh-CN');
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [commentImage, setCommentImage] = useState(null);

  useEffect(() => { loadPost(); }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try { const d = await forumAPI.getPost(id); setPost(d.post); setComments(d.comments); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleLike = async (type, targetId) => {
    if (!user) return;
    try { await forumAPI.like(type, targetId); loadPost(); } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await forumAPI.comment(id, { content: commentText, parent_id: replyTo });
      setCommentText(''); setReplyTo(null);
      loadPost();
    } catch(e) { alert(e.message); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>加载中</span></div>;
  if (!post) return <div className="alert alert-danger">帖子不存在</div>;

  const nestedComments = {};
  comments.forEach(c => {
    if (c.parent_id) {
      nestedComments[c.parent_id] = nestedComments[c.parent_id] || [];
      nestedComments[c.parent_id].push(c);
    }
  });
  const topComments = comments.filter(c => !c.parent_id);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--link-color)', fontSize: '0.9rem' }}>
        <i className="fa-solid fa-arrow-left" /> 返回论坛
      </Link>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="post-avatar">
            <i className="fa-solid fa-user-astronaut" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to={`/user/${post.user?.id}`} style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--text)' }}>
                {post.user?.username}
              </Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                @{post.user?.username} · {timeAgo(post.created_at)}
              </span>
            </div>
            <p style={{ margin: '12px 0', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.6 }}>
              {post.content}
            </p>
            {post.images?.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, marginBottom: 12 }}>
                {post.images.map((img,i) => <img key={i} src={img.image_url} alt="" style={{ width:'100%', borderRadius:8 }} />)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 24, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <button onClick={() => handleLike('post', post.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: post.has_liked ? 'var(--like-active)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                <i className={`fa-heart ${post.has_liked ? 'fa-solid' : 'fa-regular'}`} /> {post.like_count}
              </button>
              <span style={{ color: 'var(--text-muted)' }}>
                <i className="fa-regular fa-comment" /> {post.comment_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="card">
          {replyTo && (
            <div className="alert alert-info">
              <i className="fa-solid fa-reply" /> 回复评论
              <button className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={() => setReplyTo(null)}>取消</button>
            </div>
          )}
          <textarea className="form-control" rows={2} placeholder="写评论..." value={commentText} onChange={e=>setCommentText(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <input type="file" accept="image/*" onChange={e=>setCommentImage(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
            <button className="btn btn-primary btn-sm" onClick={handleComment} disabled={!commentText.trim()}>
              <i className="fa-solid fa-paper-plane" /> 评论
            </button>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>
        <i className="fa-regular fa-comments" /> 评论 ({comments.length})
      </h3>
      {topComments.length === 0 && (
        <div className="empty-state" style={{ padding: 32 }}>
          <div className="icon"><i className="fa-regular fa-comment-dots" /></div>
          <h3>还没有评论</h3>
          <p>来成为第一个评论的人吧</p>
        </div>
      )}
      {topComments.map(c => (
        <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="post-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              <i className="fa-solid fa-user-astronaut" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Link to={`/user/${c.user_id}`} style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem' }}>
                  {c.username}
                </Link>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo(c.created_at)}</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '0.95rem' }}>{c.content}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                <button onClick={() => handleLike('comment', c.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    color: c.has_liked ? 'var(--like-active)' : 'var(--text-muted)' }}>
                  <i className={`fa-heart ${c.has_liked ? 'fa-solid' : 'fa-regular'}`} /> {c.like_count}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => { setReplyTo(c.id); setCommentText(`@${c.username} `); }}>
                  <i className="fa-solid fa-reply" /> 回复
                </button>
              </div>
              {nestedComments[c.id]?.map(sub => (
                <div key={sub.id} style={{ marginLeft: 24, marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Link to={`/user/${sub.user_id}`} style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--text)', fontSize: '0.85rem' }}>
                      {sub.username}
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{timeAgo(sub.created_at)}</span>
                  </div>
                  <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>{sub.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
