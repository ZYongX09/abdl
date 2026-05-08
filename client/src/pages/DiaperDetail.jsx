import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diapersAPI, ratingsAPI, feelingsAPI } from '../api';
import { useAuth } from '../AuthContext';

const DIMS = [
  { key: 'absorption_score', label: '吸水量', fa: 'fa-droplet', desc: '实际兜尿量满意度' },
  { key: 'fit_score', label: '尺码贴合', fa: 'fa-ruler', desc: '腰围、腿围是否贴合不漏' },
  { key: 'comfort_score', label: '舒适度', fa: 'fa-face-smile', desc: '材质亲肤度、是否磨腿' },
  { key: 'thickness_score', label: '厚度', fa: 'fa-cube', desc: '厚度是否符合预期' },
  { key: 'appearance_score', label: '外观', fa: 'fa-palette', desc: '印花可爱度、颜值' },
  { key: 'value_score', label: '性价比', fa: 'fa-gem', desc: '价格是否对得起质量' },
];

function RadarChart({ stats }) {
  const size = 220, cx = size/2, cy = size/2, r = 85, levels = 5;
  const points = DIMS.map((d, i) => {
    const val = stats?.dimensions?.[d.key]?.weighted || 0;
    const angle = (Math.PI * 2 * i) / DIMS.length - Math.PI / 2;
    return { x: cx + r * Math.cos(angle) * val / 10, y: cy + r * Math.sin(angle) * val / 10, val, angle, label: d.label };
  });
  const gridAngles = DIMS.map((_, i) => (Math.PI * 2 * i) / DIMS.length - Math.PI / 2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1,2,3,4,5].map(lvl => {
        const rr = r * lvl / 5;
        return <polygon key={lvl} points={gridAngles.map(a => `${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`).join(' ')} fill="none" stroke="#E8F0F8" strokeWidth="1" />;
      })}
      {gridAngles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#E8F0F8" strokeWidth="1" />)}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(168,216,240,0.35)" stroke="#7EB8D4" strokeWidth="2" />
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#7EB8D4" />)}
      {points.map((p, i) => {
        const lx = cx + (r+28)*Math.cos(p.angle), ly = cy + (r+28)*Math.sin(p.angle);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#555">{p.label} {p.val.toFixed(1)}</text>;
      })}
    </svg>
  );
}

export default function DiaperDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [diaper, setDiaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [wiki, setWiki] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [reviewText, setReviewText] = useState('');
  const [myRating, setMyRating] = useState(null);
  const [msg, setMsg] = useState('');

  // Feelings state
  const [feelings, setFeelings] = useState({});
  const [feelingsList, setFeelingsList] = useState([]);
  const [feelingsStats, setFeelingsStats] = useState(null);
  const [myFeeling, setMyFeeling] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  const FEELING_DIMS = feelingsAPI.getDimensions();

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dData, rData, sData, fData] = await Promise.all([
        diapersAPI.get(id),
        ratingsAPI.getForDiaper(id),
        ratingsAPI.getStats(id),
        feelingsAPI.getForDiaper(id),
      ]);
      setDiaper(dData.diaper); setReviews(dData.reviews||[]); setWiki(dData.wiki); setStats(sData.stats);
      setFeelingsList(fData.feelings||[]); setFeelingsStats(fData.stats||{});
      if (user) {
        try {
          const d = await ratingsAPI.getMyRating(id);
          setMyRating(d.rating);
          if (d.rating) {
            const sc = {};
            DIMS.forEach(dim => { if (d.rating[dim.key] != null) sc[dim.key] = d.rating[dim.key]; });
            setScores(sc); setReviewText(d.rating.review || '');
          }
        } catch {}
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const setScore = (dim, val) => setScores(s => ({ ...s, [dim]: val }));
  const handleSubmit = async () => {
    setMsg('');
    try {
      const res = await ratingsAPI.create({ diaper_id: Number(id), review: reviewText||undefined, ...scores });
      setMsg(res.review_status==='approved'?'评分成功！':'评分成功（评价等待审核）');
      loadData();
    } catch(e) { setMsg(e.message); }
  };

  const setFeeling = (dim, val) => setFeelings(s => ({ ...s, [dim]: val }));
  const handleFeelingSubmit = async () => {
    if (!selectedSize) { setMsg('请选择尺码'); return; }
    setMsg('');
    try {
      await feelingsAPI.create({ diaper_id: Number(id), size: selectedSize, ...feelings });
      setMsg('✅ 感受记录成功！');
      // Reload feelings
      const fData = await feelingsAPI.getForDiaper(id);
      setFeelingsList(fData.feelings || []);
      setFeelingsStats(fData.stats || {});
      if (user) {
        const mf = feelingsAPI.getMyFeeling(Number(id), selectedSize);
        setMyFeeling(mf.feeling);
      }
    } catch(e) { setMsg(e.message); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>加载中</span></div>;
  if (!diaper) return <div className="alert alert-danger">纸尿裤不存在</div>;

  return (
    <div>
      <Link to="/diapers" style={{ color: 'var(--primary-dark)', fontSize: '0.9rem' }}><i className="fa-solid fa-arrow-left" /> 返回列表</Link>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 160px' }}>
            <img src={diaper.image_url||'https://placehold.co/160x160/A8D8F0/white?text=No+Image'} alt={diaper.model} style={{ width: '100%', borderRadius: 12 }} />
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <div className="brand">{diaper.brand}</div>
            <h1 style={{ fontSize: '1.5rem', margin: '4px 0' }}>{diaper.model}</h1>
            {diaper.is_baby_diaper===1 && <div className="alert alert-info" style={{ fontSize: '0.85rem', marginTop: 6, padding: '8px 12px' }}><i className="fa-solid fa-baby" /> 婴儿纸尿裤，成人实际吸收量约{diaper.absorbency_adult||'厂家标称的50-60%'}</div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
              <span className="tag"><i className="fa-solid fa-tag" /> {diaper.product_type}</span>
              <span className="tag"><i className="fa-solid fa-ruler" /> 厚{diaper.thickness}/5</span>
              {diaper.absorbency_adult && <span className="tag"><i className="fa-solid fa-droplet" /> {diaper.absorbency_adult}</span>}
              {diaper.avg_price && <span className="tag"><i className="fa-solid fa-coins" /> {diaper.avg_price}</span>}
            </div>
            {diaper.sizes?.length>0 && (
              <div style={{ marginTop: 8 }}>
                <strong><i className="fa-solid fa-ruler-combined" /> 尺码：</strong>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {diaper.sizes.map(s => <span key={s.label} className="tag">{s.label} ({s.waist_min}-{s.waist_max}cm)</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats && stats.count > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}><i className="fa-solid fa-chart-line" /> 综合评分 {stats.composite}分 ({stats.count}人评价)</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <RadarChart stats={stats} />
            <div>
              {DIMS.map(d => {
                const dim = stats.dimensions?.[d.key];
                return (
                  <div key={d.key} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: '0.85rem' }}>
                      <span><i className={`fa-solid ${d.fa}`} /> {d.label}</span>
                      <span style={{ fontWeight: 700 }}>{dim?.weighted?.toFixed(1)||'-'} / 10</span>
                    </div>
                    <div className="score-bar"><div className="score-bar-fill" style={{ width: `${(dim?.weighted||0)*10}%` }} /></div>
                  </div>);
              })}
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="card">
          <h3>{myRating ? <><i className="fa-solid fa-pen" /> 修改评分</> : <><i className="fa-solid fa-star" /> 评价纸尿裤（1-10分）</>}</h3>
          {msg && <div className={`alert ${msg.includes('成功')?'alert-success':'alert-danger'}`}>{msg}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, margin: '12px 0' }}>
            {DIMS.map(d => (
              <div key={d.key} style={{ padding: '10px 14px', borderRadius: 10, background: '#F8FBFF', border: '1px solid #E8F0F8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}><i className={`fa-solid ${d.fa}`} /> {d.label}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7EB8D4' }}>{scores[d.key] || '-'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: 4 }}>{d.desc}</div>
                <input type="range" min="1" max="10" value={scores[d.key]||5} onChange={e => setScore(d.key, Number(e.target.value))} style={{ width: '100%', accentColor: '#A8D8F0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#BBB' }}><span>1</span><span>5</span><span>10</span></div>
              </div>
            ))}
          </div>
          <textarea className="form-control" placeholder="写写使用感受...（选填）" rows={2} value={reviewText} onChange={e => setReviewText(e.target.value)} />
          <button className="btn btn-accent" style={{ marginTop: 8 }} onClick={handleSubmit}>{myRating ? '更新评分' : '提交评分'}</button>
        </div>
      )}

      {/* 使用感受 -5到5 */}
      {user && (
        <div className="card">
          <h3><i className="fa-solid fa-heart" /> 使用感受记录 (-5 到 5)</h3>
          <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: 12 }}>
            记录你使用某个尺码的真实感受，帮助自己和他人更好地选择。感受数据以10%权重计入综合评分。
          </p>
          <div className="form-group">
            <label>选择尺码</label>
            <select className="form-control" value={selectedSize} onChange={e => { setSelectedSize(e.target.value); const mf = feelingsAPI.getMyFeeling(Number(id), e.target.value); setMyFeeling(mf.feeling); if (mf.feeling) { const fv = {}; FEELING_DIMS.forEach(dim => { if (mf.feeling[dim.key] != null) fv[dim.key] = mf.feeling[dim.key]; }); setFeelings(fv); } else { setFeelings({}); } }} style={{ maxWidth: 200 }}>
              <option value="">请选择尺码</option>
              {diaper.sizes?.map(s => <option key={s.label} value={s.label}>{s.label} ({s.waist_min}-{s.waist_max}cm)</option>)}
            </select>
          </div>
          {selectedSize && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, margin: '12px 0' }}>
                {FEELING_DIMS.map(d => (
                  <div key={d.key} style={{ padding: '10px 14px', borderRadius: 10, background: '#FFF8F8', border: '1px solid #FFE0E8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}><i className={`fa-solid ${d.icon}`} /> {d.label}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: feelings[d.key] > 0 ? '#7BC67E' : feelings[d.key] < 0 ? '#E8837C' : '#999' }}>
                        {feelings[d.key] != null ? (feelings[d.key] > 0 ? '+' : '') + feelings[d.key] : '-'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: 4 }}>{d.desc}</div>
                    <input type="range" min="-5" max="5" step="1" value={feelings[d.key] ?? 0}
                      onChange={e => setFeeling(d.key, Number(e.target.value))}
                      style={{ width: '100%', accentColor: feelings[d.key] > 0 ? '#7BC67E' : feelings[d.key] < 0 ? '#E8837C' : '#A8D8F0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#BBB' }}>
                      <span>{d.lowLabel} -5</span><span>0 中性</span><span>{d.highLabel} +5</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-accent" onClick={handleFeelingSubmit}>
                {myFeeling ? '✏️ 更新感受' : '💾 保存感受'}
              </button>
              {myFeeling && <span style={{ marginLeft: 12, fontSize: '0.85rem', color: '#999' }}>已记录 {selectedSize}码 感受 ({new Date(myFeeling.created_at).toLocaleDateString('zh-CN')})</span>}
            </>
          )}
        </div>
      )}

      {/* 感受汇总 */}
      {feelingsList.length > 0 && (
        <div className="card">
          <h3><i className="fa-solid fa-users" /> 用户感受汇总 ({feelingsList.length})</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
            {FEELING_DIMS.map(d => {
              const val = feelingsStats?.[d.key] || 0;
              return (
                <div key={d.key} style={{ flex: '1 1 140px', textAlign: 'center', padding: 12, borderRadius: 10, background: '#F8FBFF', border: '1px solid #E8F0F8' }}>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}><i className={`fa-solid ${d.icon}`} /> {d.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: val > 1 ? '#7BC67E' : val < -1 ? '#E8837C' : '#F0C040' }}>
                    {val > 0 ? '+' : ''}{val.toFixed(1)}
                  </div>
                  <div className="score-bar" style={{ marginTop: 4 }}>
                    <div className="score-bar-fill" style={{
                      width: `${(val + 5) * 10}%`,
                      background: val > 0
                        ? 'linear-gradient(90deg, #F0C040, #7BC67E)'
                        : 'linear-gradient(90deg, #E8837C, #F0C040)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <h3><i className="fa-regular fa-message" /> 用户评价 ({reviews.length})</h3>
        {reviews.map(r => (
          <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{r.username}{r.role==='admin' && <span className="tag" style={{ background: '#FFE0E0', color: '#C0392B', marginLeft: 6, fontSize: '0.7rem' }}>管理员</span>}</strong>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>{new Date(r.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0' }}>
              {DIMS.map(d => r[d.key] != null && <span key={d.key} className="tag" style={{fontSize:'0.7rem'}}><i className={`fa-solid ${d.fa}`} /> {r[d.key]}</span>)}
            </div>
            {r.review && <p style={{ margin: '4px 0', color: '#555', fontSize: '0.9rem' }}>{r.review}</p>}
          </div>
        ))}
        {reviews.length===0 && <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无评价</p>}
      </div>
    </div>
  );
}
