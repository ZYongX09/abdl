import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { compareAPI, diapersAPI } from '../api';

const DIMS = [
  { key: 'absorption_score', label: '吸水量' },
  { key: 'fit_score', label: '贴合' },
  { key: 'comfort_score', label: '舒适' },
  { key: 'thickness_score', label: '厚度' },
  { key: 'appearance_score', label: '外观' },
  { key: 'value_score', label: '性价比' },
];

function MiniRadar({ diapers }) {
  const size = 200, cx = size/2, cy = size/2, r = 75;
  const colors = ['#A8D8F0','#FFB7C5','#7BC67E','#F0C040'];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1,2,3,4,5].map(lvl => {
        const rr = r * lvl / 5;
        const pts = DIMS.map((_,i) => {
          const a = Math.PI*2*i/DIMS.length - Math.PI/2;
          return `${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`;
        }).join(' ');
        return <polygon key={lvl} points={pts} fill="none" stroke="var(--border)" strokeWidth="1" />;
      })}
      {DIMS.map((_,i) => {
        const a = Math.PI*2*i/DIMS.length - Math.PI/2;
        return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="var(--border)" strokeWidth="1" />;
      })}
      {diapers.map((d, idx) => {
        const pts = DIMS.map((dim, i) => {
          const val = d.dimensions?.[dim.key]?.weighted || 0;
          const a = Math.PI*2*i/DIMS.length - Math.PI/2;
          return `${cx+r*val/10*Math.cos(a)},${cy+r*val/10*Math.sin(a)}`;
        }).join(' ');
        return <polygon key={idx} points={pts} fill={colors[idx]} fillOpacity="0.25" stroke={colors[idx]} strokeWidth="2" />;
      })}
      <text x={cx} y={cy-5} textAnchor="middle" fontSize="10" fill="var(--text-muted)">各维度评分</text>
    </svg>
  );
}

export default function ComparePage() {
  const [selected, setSelected] = useState([]);
  const [allDiapers, setAllDiapers] = useState([]);
  const [compared, setCompared] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    diapersAPI.list({ limit: 100 }).then(d => setAllDiapers(d.diapers)).finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const doCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    try {
      const d = await compareAPI.compare(selected);
      setCompared(d.diapers);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>
        <i className="fa-solid fa-chart-simple" /> 纸尿裤对比工具
      </h2>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
          选择 2-4 款纸尿裤进行对比 (已选 {selected.length}/4)
        </p>
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
          {allDiapers.map(d => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)}
                disabled={!selected.includes(d.id) && selected.length >= 4}
                style={{ accentColor: 'var(--primary)' }} />
              <span>{d.brand} {d.model}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-star" style={{ color: 'var(--warning)', fontSize: '0.7rem' }} /> {Number(d.avg_score||0).toFixed(1)}
              </span>
            </label>
          ))}
        </div>
        <button className="btn btn-accent" onClick={doCompare} disabled={selected.length < 2}>
          <i className="fa-solid fa-code-compare" /> 开始对比 ({selected.length}/4)
        </button>
      </div>

      {loading && compared.length === 0 && (
        <div className="loading-spinner"><div className="spinner" /><span>对比中</span></div>
      )}

      {compared.length > 0 && (
        <div>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>
              <i className="fa-solid fa-table-list" /> 规格对比
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, borderBottom: '2px solid var(--border)', textAlign: 'left' }}>参数</th>
                    {compared.map(d => (
                      <th key={d.id} style={{ padding: 8, borderBottom: '2px solid var(--border)', textAlign: 'center' }}>
                        {d.brand}<br/>{d.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['类型', 'product_type'],
                    ['厚度', d => `${d.thickness}/5`],
                    ['成人吸水量', d => d.absorbency_adult || d.absorbency_mfr || '-'],
                    ['材质', 'material'],
                    ['价格', 'avg_price'],
                    ['综合评分', d => (
                      <span><i className="fa-solid fa-star" style={{ color: 'var(--warning)', fontSize: '0.8rem' }} /> {Number(d.avg_score||0).toFixed(1)}</span>
                    )],
                    ['评价数', 'rating_count'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{row[0]}</td>
                      {compared.map(d => (
                        <td key={d.id} style={{ padding: 8, textAlign: 'center' }}>
                          {typeof row[1] === 'function' ? row[1](d) : d[row[1]] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>
              <i className="fa-solid fa-chart-pie" /> 6维度评分雷达图
            </h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <MiniRadar diapers={compared} />
              <div style={{ fontSize: '0.85rem' }}>
                {compared.map((d, i) => (
                  <div key={d.id} style={{ marginBottom: 4 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                      background: ['#A8D8F0','#FFB7C5','#7BC67E','#F0C040'][i], marginRight: 6 }} />
                    {d.brand} {d.model}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
