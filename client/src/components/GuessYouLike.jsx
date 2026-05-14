import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { guessAPI } from '../api';

export default function GuessYouLike() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guessAPI.get().then(d => setItems(d.recommendations || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="hero-card">
      <h3 className="font-bold mb-3">
        <i className="fa-solid fa-lightbulb" style={{ color: 'var(--warning)' }} /> 猜你喜欢 · 为你甄选
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 items-stretch">
        {items.map((d, i) => (
          <Link to={`/diaper/${d.id}`} key={d.id} className="stagger-item no-underline text-inherit" style={{ minWidth: 200, maxWidth: 220, flex: '0 0 auto', animationDelay: `${i * 0.06}s` }}>
            <div className="diaper-card" style={{ padding: 14, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="brand">{d.brand}</div>
              <div className="model" style={{ fontSize: '1rem' }}>{d.model}</div>
              <div className="meta mt-1">
                {d.avg_score > 0 && (
                  <span className="badge badge-warning badge-sm gap-1">
                    <i className="fa-solid fa-star" /> {Number(d.avg_score).toFixed(1)}
                  </span>
                )}
                <span className="text-xs text-base-content/40">{d.rating_count}评</span>
              </div>
              <div className="text-xs mt-auto pt-2" style={{ color: 'var(--primary-dark)' }}>
                <i className="fa-solid fa-thumbs-up" /> {d.reason}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
