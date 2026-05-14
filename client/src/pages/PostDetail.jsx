import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { forumAPI } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { timeAgo } from '../utils';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const MAX_COMMENT_LEN = 500;
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [commentSending, setCommentSending] = useState(false);
  const commentTextareaRef = useRef(null);

  const autoResize = useCallback(() => {
    const el = commentTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  useEffect(() => { autoResize(); }, [commentText, autoResize]);
  useEffect(() => { loadPost(); }, [id]);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightboxSrc(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [lightboxSrc]);

  const loadPost = async () => {
    setLoading(true);
    try { const d = await forumAPI.getPost(id); setPost(d.post); setComments(d.comments||[]); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleLike = async (type, targetId) => {
    if (!user) return;
    try { await forumAPI.like({ target_type: type, target_id: targetId }); loadPost(); } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim() || commentSending) return;
    setCommentSending(true);
    try {
      await forumAPI.comment(id, { content: commentText, parent_id: replyTo });
      setCommentText(''); setReplyTo(null); setCommentImage(null); setCommentImagePreview(null);
      loadPost();
    } catch(e) { addToast(e.message, 'error'); }
    finally { setCommentSending(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!post) return <div className="alert alert-error"><span>帖子不存在</span></div>;

  const nestedComments = {};
  comments.forEach(c => { if (c.parent_id) { nestedComments[c.parent_id] = nestedComments[c.parent_id] || []; nestedComments[c.parent_id].push(c); } });
  const topComments = comments.filter(c => !c.parent_id);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="link link-primary text-sm mb-3 inline-block">
        <i className="fa-solid fa-arrow-left mr-1" /> 返回论坛
      </Link>

      {/* Post */}
      <div className="card mb-4">
        <div className="card-body gap-3">
          <div className="flex gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary/20 text-primary rounded-full w-10"><i className="fa-solid fa-user-astronaut" /></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link to={`/user/${post.user?.id}`} className="font-bold text-sm no-underline hover:underline">{post.user?.username}</Link>
                  {user && post.user?.id !== user.id && (
                    <Link to={`/messages?to=${encodeURIComponent(post.user?.username)}`} className="btn btn-ghost btn-sm" title="发私信"><i className="fa-solid fa-paper-plane" /></Link>
                  )}
                  <span className="text-sm text-base-content/40">@{post.user?.username} · {timeAgo(post.created_at)}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => addToast('链接已复制', 'success', 2000)).catch(()=>{})} title="分享">
                  <i className="fa-solid fa-share-nodes" />
                </button>
              </div>
              <p className="my-3 whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
              {post.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {post.images.map((img,i) => <img key={i} src={img.image_url} alt="" className="w-full rounded-lg cursor-pointer" onClick={() => setLightboxSrc(img.image_url)} />)}
                </div>
              )}
              <div className="flex gap-6 border-t border-base-300 pt-3">
                <button onClick={() => handleLike('post', post.id)} className={`btn btn-ghost btn-sm gap-2 ${post.has_liked ? 'text-error' : 'text-base-content/40'}`}>
                  <i className={`${post.has_liked ? 'fa-solid' : 'fa-regular'} fa-heart`} /> {post.like_count}
                </button>
                <span className="text-base-content/40 text-sm"><i className="fa-regular fa-comment mr-1" />{post.comment_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      {user && (
        <div className="card mb-4">
          <div className="card-body gap-3">
            {replyTo && (
              <div className="alert alert-info text-sm py-3">
                <i className="fa-solid fa-reply" /> 回复评论
                <button className="btn btn-ghost btn-sm ml-2" onClick={() => setReplyTo(null)}>取消</button>
              </div>
            )}
            <textarea ref={commentTextareaRef} className="textarea textarea-bordered w-full" rows={2}
              placeholder="写评论..." value={commentText} onChange={e=>setCommentText(e.target.value)}
              maxLength={MAX_COMMENT_LEN} onInput={autoResize} />
            <div className="flex justify-between items-center text-sm text-base-content/40">
              <span>支持 Markdown</span>
              <span className={commentText.length >= MAX_COMMENT_LEN ? 'text-error' : ''}>{commentText.length}/{MAX_COMMENT_LEN}</span>
            </div>
            {commentImagePreview && (
              <div className="relative inline-block">
                <img src={commentImagePreview} alt="预览" className="w-20 h-20 object-cover rounded-lg border border-base-300" />
                <button onClick={() => { setCommentImage(null); setCommentImagePreview(null); }} className="absolute -top-1.5 -right-1.5 btn btn-error btn-sm w-5 h-5 min-h-0 p-0 rounded-full">
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            )}
            <div className="flex gap-3 items-center">
              <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
                <i className="fa-solid fa-image" /> 图片
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setCommentImage(f); const r = new FileReader(); r.onloadend = () => setCommentImagePreview(r.result); r.readAsDataURL(f); } }} className="hidden" />
              </label>
              <button className="btn btn-primary btn-sm ml-auto" onClick={handleComment} disabled={!commentText.trim() || commentSending}>
                {commentSending ? <><i className="fa-solid fa-spinner fa-spin" /> 发送中</> : <><i className="fa-solid fa-paper-plane" /> 评论</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <h3 className="font-bold mb-3"><i className="fa-regular fa-comments text-primary mr-1" /> 评论 ({comments.length})</h3>
      {topComments.length === 0 ? (
        <div className="text-center py-8 text-base-content/40">
          <i className="fa-regular fa-comment-dots text-3xl mb-3 block" />
          <p className="text-sm">还没有评论，来成为第一个评论的人吧</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {topComments.map(c => (
            <div key={c.id} className="py-3 border-b border-base-300">
              <div className="flex gap-3">
                <div className="avatar placeholder">
                  <div className="bg-primary/20 text-primary rounded-full w-8"><i className="fa-solid fa-user-astronaut text-sm" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link to={`/user/${c.user?.id || c.user_id}`} className="font-semibold text-sm no-underline hover:underline">{c.user?.username || c.username}</Link>
                    <span className="text-sm text-base-content/40">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm my-1">{c.content}</p>
                  <div className="flex gap-4 text-sm">
                    <button onClick={() => handleLike('comment', c.id)} className={`btn btn-ghost btn-sm gap-1 ${c.has_liked ? 'text-error' : 'text-base-content/40'}`}>
                      <i className={`${c.has_liked ? 'fa-solid' : 'fa-regular'} fa-heart`} /> {c.like_count}
                    </button>
                    <button className="btn btn-ghost btn-sm gap-1 text-base-content/40" onClick={() => { setReplyTo(c.id); setCommentText(`@${c.user?.username || c.username} `); }}>
                      <i className="fa-solid fa-reply" /> 回复
                    </button>
                  </div>
                  {nestedComments[c.id]?.map(sub => (
                    <div key={sub.id} className="ml-8 mt-3 pt-2 border-t border-base-300">
                      <div className="flex items-center gap-3">
                        <Link to={`/user/${sub.user?.id || sub.user_id}`} className="font-semibold text-sm no-underline hover:underline">{sub.user?.username || sub.username}</Link>
                        <span className="text-sm text-base-content/30">{timeAgo(sub.created_at)}</span>
                      </div>
                      <p className="text-sm mt-3">{sub.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (<>
        <div className="lightbox-overlay" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="查看大图" onClick={e => e.stopPropagation()} />
        </div>
        <button className="lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="关闭"><i className="fa-solid fa-xmark" /></button>
      </>)}
    </div>
  );
}
