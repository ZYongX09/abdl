import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rankingsAPI } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';


const DIM_TABS = [
  { key: 'hot', fa: 'fa-fire', label: '热门' },
  { key: 'absorbency', fa: 'fa-droplet', label: '吸收' },
  { key: 'popular', fa: 'fa-eye', label: '关注' },
  { key: 'absorption_score', fa: 'fa-droplet', label: '吸水量' },
  { key: 'fit_score', fa: 'fa-ruler', label: '贴合度' },
  { key: 'comfort_score', fa: 'fa-face-smile', label: '舒适度' },
  { key: 'thickness_score', fa: 'fa-cube', label: '厚度' },
  { key: 'appearance_score', fa: 'fa-palette', label: '外观' },
  { key: 'value_score', fa: 'fa-gem', label: '性价比' },
];

const MEDALS = ['fa-medal', 'fa-medal', 'fa-medal'];
const MEDAL_COLORS = ['#F0C040', '#B0B0B0', '#CD7F32'];

export default function Rankings() {
  const [tab, setTab] = useState('hot');
  const [rankings, setRankings] = useState([]);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const isDim = !['hot','absorbency','popular'].includes(tab);
    const api = isDim ? rankingsAPI.dimension(tab)
      : tab==='hot' ? rankingsAPI.hot() : tab==='absorbency' ? rankingsAPI.absorbency() : rankingsAPI.popular();

    api.then(data => {
      setRankings(data.rankings || []);
      setCached(data.cached || false);
    }).catch(err => {
      console.error('[Rankings]', err);
    }).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        <i className="fa-solid fa-trophy" /> 排行榜
      </h2>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }} role="tablist" aria-label="排行榜分类">
          {DIM_TABS.filter(t => ['hot','absorbency','popular'].includes(t.key)).map(t => (
            <button key={t.key}
              role="tab"
              aria-selected={tab===t.key}
              className={`btn ${tab===t.key?'btn-primary':'btn-outline'} btn-sm`}
              onClick={() => setTab(t.key)}>
              <i className={`fa-solid ${t.fa}`} style={{ marginRight: 4 }} />{t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
          <span style={{ flex: '0 0 auto', width: 36, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
            <i className="fa-solid fa-bars-staggered" style={{ marginRight: 4, fontSize: '0.7rem' }} /> 按维度评分排序
          </span>
          <span style={{ flex: '1', height: 1, background: 'var(--border)', maxWidth: 140 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }} role="tablist" aria-label="维度评分排序">
          {DIM_TABS.filter(t => !['hot','absorbency','popular'].includes(t.key)).map(t => (
            <button key={t.key}
              role="tab"
              aria-selected={tab===t.key}
              className={`btn ${tab===t.key?'btn-primary':'btn-outline'} btn-sm`}
              onClick={() => setTab(t.key)}>
              <i className={`fa-solid ${t.fa}`} style={{ marginRight: 4 }} />{t.label}
            </button>
          ))}
        </div>
      </div>
      {cached && (
        <div className="alert alert-info" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          <i className="fa-solid fa-clock" /> 每24小时更新
        </div>
      )}
      {loading ? (
        <LoadingSkeleton count={6} type="rank" />
      ) : rankings.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-chart-bar" /></div>
          <h3>暂无数据</h3>
        </div>
      ) : (
        rankings.map((item, i) => (
          <Link to={`/diaper/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="rank-item stagger-item" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`rank-number ${i===0?'top1':i===1?'top2':i===2?'top3':''}`}>
                {i < 3 ? <i className={`fa-solid ${MEDALS[i]}`} style={{ color: MEDAL_COLORS[i], fontSize: '1.6rem' }} /> : `#${i+1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{item.brand} {item.model}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span className="tag">{item.product_type}</span>
                  {item.absorbency_adult && (
                    <span className="tag">
                      <i className="fa-solid fa-droplet" /> {item.absorbency_adult}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {tab==='hot' && <div className="score-badge"><i className="fa-solid fa-star" /> {Number(item.avg_score||0).toFixed(1)}</div>}
                {tab==='absorbency' && <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{item.absorbency_adult||item.absorbency_mfr}</div>}
                {tab==='popular' && <div style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>{item.rating_count} 评价</div>}
                {!['hot','absorbency','popular'].includes(tab) && item.avg_score != null && <div className="score-badge"><i className="fa-solid fa-star" style={{color:'var(--warning)',marginRight:3,fontSize:'0.7rem'}} />{Number(item.avg_score).toFixed(1)}</div>}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
