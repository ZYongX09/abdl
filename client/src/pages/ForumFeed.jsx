import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { forumAPI, uploadImage } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import GuessYouLike from '../components/GuessYouLike';
import { timeAgo } from '../utils';

export default function ForumFeed() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [diaperId, setDiaperId] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const postTextareaRef = useRef(null);

  const autoResize = useCallback(() => {
    const el = postTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 300) + 'px';
  }, []);

  useEffect(() => { autoResize(); }, [content, autoResize]);

  const loadPosts = async (p = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = { page: p, limit: 20 }; if (search) params.search = search;
      const d = await forumAPI.feed(params);
      setPosts(prev => append ? [...prev, ...(d.posts||[])] : (d.posts||[]));
      setHasMore(d.pagination.page < d.pagination.totalPages);
      setPage(p);
    } catch(e) {} finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { loadPosts(); loadNotifCount(); }, []);

  const loadNotifCount = async () => {
    if (!user) return;
    try { const d = await forumAPI.notifications(); setNotifCount(d.unread_count); } catch {}
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setMsg(''); setUploading(true);
    try {
      let imgUrl = null;
      if (image) { const r = await uploadImage(image); imgUrl = r.url; }
      await forumAPI.create({ content, diaper_id: diaperId||null, image_url: imgUrl });
      setContent(''); setDiaperId(''); setImage(null); setShowForm(false);
      loadPosts(); setMsg('');
    } catch(e) { setMsg(e.message); }
    finally { setUploading(false); }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try { await forumAPI.like({ target_type: 'post', target_id: postId }); loadPosts(page); } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold flex-1">
          <i className="fa-regular fa-comments text-primary" /> 社区论坛
        </h2>
        {user && (<>
          <Link to="/notifications" className="btn btn-ghost btn-sm indicator">
            <i className={`fa-solid fa-bell${notifCount > 0 ? ' bell-shake' : ''}`} />
            {notifCount > 0 && <span className="badge badge-xs badge-primary indicator-item">{notifCount}</span>}
          </Link>
          <button className="btn btn-accent btn-sm" onClick={() => setShowForm(!showForm)}>
            <i className="fa-solid fa-pen" /> 发帖
          </button>
        </>)}
      </div>

      <GuessYouLike />

      {/* Search */}
      <div className="join mb-4 w-full">
        <input className="input input-bordered input-sm join-item flex-1" placeholder="搜索帖子内容..." value={search}
          onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loadPosts()} />
        <button className="btn btn-primary btn-sm join-item" onClick={() => loadPosts()}>
          <i className="fa-solid fa-search" />
        </button>
      </div>

      {/* Post Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body gap-3">
            {msg && <div className={`alert ${msg.includes('成功')?'alert-success':'alert-error'} text-sm`}><span>{msg}</span></div>}
            <textarea ref={postTextareaRef} className="textarea textarea-bordered w-full" rows={4}
              placeholder="分享你的想法..." value={content} onChange={e=>setContent(e.target.value)}
              maxLength={5000} onInput={autoResize} />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${content.length > 4500 ? 'text-error' : content.length > 3500 ? 'text-warning' : 'text-base-content/40'}`}>
                {content.length}/5000
              </span>
              <div className="flex gap-2 items-center">
                <label className="btn btn-outline btn-xs gap-1 cursor-pointer">
                  <i className="fa-solid fa-image" /> 图片
                  <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} className="hidden" />
                </label>
                {image && (
                  <div className="relative inline-block">
                    <img src={URL.createObjectURL(image)} alt="预览" className="w-12 h-12 object-cover rounded-lg border border-base-300" />
                    <button onClick={() => setImage(null)} className="absolute -top-1.5 -right-1.5 btn btn-error btn-xs w-5 h-5 min-h-0 p-0 rounded-full" title="移除">
                      <i className="fa-solid fa-xmark text-xs" />
                    </button>
                  </div>
                )}
                <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={uploading||!content.trim()}>
                  {uploading ? '发布中...' : '发布'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading && posts.length === 0 ? <LoadingSkeleton type="feed" count={4} /> : posts.length === 0 ? (
        <div className="text-center py-16 text-base-content/40">
          <i className="fa-solid fa-feather text-4xl mb-3 block" />
          <h3 className="font-semibold mb-1">{search ? '没有找到匹配的帖子' : '还没有帖子'}</h3>
          <p className="text-sm">{search ? '试试换个关键词搜索' : '成为第一个发帖的人吧'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p, i) => (
            <div key={p.id} className="card stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="card-body gap-3">
                <div className="flex gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary/20 text-primary rounded-full w-10">
                      <i className="fa-solid fa-user-astronaut" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/user/${p.user?.id}`} className="font-bold text-sm no-underline hover:underline">
                        {p.user?.username}
                      </Link>
                      {user && p.user?.id !== user.id && (
                        <Link to={`/messages?to=${encodeURIComponent(p.user?.username)}`} className="btn btn-ghost btn-xs" title="发私信">
                          <i className="fa-solid fa-paper-plane" />
                        </Link>
                      )}
                      <span className="text-xs text-base-content/40">@{p.user?.username} · {timeAgo(p.created_at)}</span>
                    </div>
                    <Link to={`/forum/${p.id}`} className="no-underline text-inherit">
                      <p className="my-2 whitespace-pre-wrap leading-relaxed text-sm">{p.content}</p>
                    </Link>
                    {p.images?.length > 0 && (
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {p.images.map((img, i) => <img key={i} src={img.image_url} alt="" loading="lazy" className="w-full h-28 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />)}
                      </div>
                    )}
                    {p.diaper && (
                      <Link to={`/diaper/${p.diaper.id}`} className="badge badge-ghost badge-sm gap-1 no-underline">
                        <i className="fa-solid fa-tag" /> {p.diaper.brand} {p.diaper.model}
                      </Link>
                    )}
                    <div className="flex gap-6 mt-2">
                      <button onClick={() => handleLike(p.id)}
                        className={`btn btn-ghost btn-xs gap-1 ${p.has_liked ? 'text-error' : 'text-base-content/40'}`}>
                        <i className={`${p.has_liked ? 'fa-solid' : 'fa-regular'} fa-heart`} /> {p.like_count}
                      </button>
                      <Link to={`/forum/${p.id}`} className="btn btn-ghost btn-xs gap-1 text-base-content/40 no-underline">
                        <i className="fa-regular fa-comment" /> {p.comment_count}
                      </Link>
                      <button onClick={() => navigator.clipboard?.writeText(window.location.origin + '/forum/' + p.id).then(() => addToast('链接已复制', 'success', 2000)).catch(()=>{})}
                        className="btn btn-ghost btn-xs gap-1 text-base-content/40">
                        <i className="fa-solid fa-share-nodes" /> 分享
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center py-4">
          <button className="btn btn-outline btn-sm" onClick={() => loadPosts(page+1, true)} disabled={loadingMore}>
            {loadingMore ? <><i className="fa-solid fa-spinner fa-spin" /> 加载中...</> : <><i className="fa-solid fa-chevron-down" /> 加载更多</>}
          </button>
        </div>
      )}
    </div>
  );
}
