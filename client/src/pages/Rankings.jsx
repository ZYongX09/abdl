import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rankingsAPI } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DIM_TABS = [
  { key: 'hot', fa: 'fa-fire', label: '热门' },
  { key: 'absorbency', fa: 'fa-droplet', label: '吸收' },
  { key: 'popular', fa: 'fa-eye', label: '人气' },
];

const MEDAL_COLORS = ['#F0C040', '#B0B0B0', '#CD7F32'];

export default function Rankings() {
  const [tab, setTab] = useState('hot');
  const [rankings, setRankings] = useState([]);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const api = tab==='hot' ? rankingsAPI.hot() : tab==='absorbency' ? rankingsAPI.absorbency() : rankingsAPI.popular();
    api.then(data => { setRankings(data.rankings || []); setCached(data.cached || false); })
      .catch(console.error).finally(() => setLoading(false));
  }, [tab]);


  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero Header */}
      <div className="hero-card mb-5" style={{ padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8, color: 'var(--primary-dark)' }}>
          <i className="fa-solid fa-trophy" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--hero-text)', margin: 0 }}>排行榜</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '4px 0 0' }}>发现最受欢迎、吸收力最强的纸尿裤</p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="join" role="tablist">
          {DIM_TABS.map(t => (
            <button key={t.key} role="tab"
              className={`btn join-item ${tab === t.key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTab(t.key)}>
              <i className={`fa-solid ${t.fa} mr-1`} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {cached && (
        <div className="alert alert-info mb-4 text-sm">
          <i className="fa-solid fa-clock" /> 每24小时更新
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={6} type="rank" />
      ) : rankings.length === 0 ? (
        <div className="text-center py-16 text-base-content/40">
          <i className="fa-solid fa-chart-bar text-4xl mb-3 block" />
          <p>暂无数据</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rankings.map((item, i) => (
            <Link to={`/diaper/${item.id}`} key={item.id} className="no-underline text-inherit">
              <div className="rank-item stagger-item flex items-center gap-4 p-4 rounded-xl" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className={`rank-number w-10 text-center font-bold text-lg ${i===0?'top1':i===1?'top2':i===2?'top3':'text-base-content/40'}`}>
                  {i < 3 ? <i className="fa-solid fa-medal text-xl" style={{ color: MEDAL_COLORS[i] }} /> : `#${i+1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{item.brand} {item.model}</div>
                  <div className="text-sm text-base-content/50 flex gap-1.5 mt-0.5">
                    <span className="badge badge-sm badge-ghost">{item.product_type}</span>
                    {item.absorbency_adult && (
                      <span className="badge badge-sm badge-ghost">
                        <i className="fa-solid fa-droplet" /> {item.absorbency_adult}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {tab==='hot' && <div className="badge badge-warning gap-1"><i className="fa-solid fa-star" /> {Number(item.avg_score||0).toFixed(1)}</div>}
                  {tab==='absorbency' && <div className="font-bold text-primary">{item.absorbency_adult||item.absorbency_mfr}</div>}
                  {tab==='popular' && <div className="font-bold text-accent">{item.rating_count} 评价</div>}
                  {!['hot','absorbency','popular'].includes(tab) && item.avg_score != null && <div className="badge badge-warning gap-1"><i className="fa-solid fa-star" />{Number(item.avg_score).toFixed(1)}</div>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
