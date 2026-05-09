import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { diapersAPI, rankingsAPI } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const [diapers, setDiapers] = useState([]);
  const [hotRankings, setHotRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '');
  const [sizeFilter, setSizeFilter] = useState(searchParams.get('size') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popularity');

  // Debounce search to avoid excessive API calls while typing
  const debouncedSearch = useDebounce(search, 300);

  // Read URL params whenever they change (sidebar search navigation triggers this)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q && q !== search) setSearch(q);
    const b = searchParams.get('brand');
    if (b && b !== brandFilter) setBrandFilter(b);
    const sz = searchParams.get('size');
    if (sz && sz !== sizeFilter) setSizeFilter(sz);
    const s = searchParams.get('sort');
    if (s && s !== sort) setSort(s);
  }, [searchParams]);

  // Sync URL params with filter state
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (brandFilter) params.brand = brandFilter;
    if (sizeFilter) params.size = sizeFilter;
    if (sort && sort !== 'popularity') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [search, brandFilter, sizeFilter, sort]);

  // Load brands, sizes, and hot rankings once
  useEffect(() => {
    Promise.all([
      rankingsAPI.hot(),
      diapersAPI.brands(),
      diapersAPI.sizes(),
    ]).then(([rData, bData, sData]) => {
      setHotRankings(rData.rankings?.slice(0, 5) || []);
      setBrands(bData.brands);
      setSizes(sData.sizes);
    }).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = {};
    if (search) params.search = search;
    if (brandFilter) params.brand = brandFilter;
    if (sizeFilter) params.size = sizeFilter;
    if (sort && sort !== 'popularity') params.sort = sort;
    setSearchParams(params, { replace: true });
    setLoading(true);
    diapersAPI.list({ search, brand: brandFilter, size: sizeFilter, sort, limit: 50 })
      .then(d => setDiapers(d.diapers))
      .finally(() => setLoading(false));
  };

  // Auto-search on filter changes (debounced for search text)
  useEffect(() => {
    setLoading(true);
    diapersAPI.list({ search: debouncedSearch, brand: brandFilter, size: sizeFilter, sort, limit: 50 })
      .then(d => { setDiapers(d.diapers); setInitialLoading(false); })
      .finally(() => setLoading(false));
  }, [debouncedSearch, brandFilter, sizeFilter, sort]);

  return (
    <div>
      <div className="hero-card">
        <h2 style={{ marginBottom: 16, color: 'var(--hero-text)' }}>
          <i className="fa-solid fa-magnifying-glass" /> 探索纸尿裤
        </h2>
        <div className="search-bar">
          <input className="form-control" placeholder="搜索品牌、型号、材质..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <select className="form-control" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="">全部品牌</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="form-control" value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
            <option value="">全部尺码</option>
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-control" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="popularity">热度</option>
            <option value="avg_price">价格</option>
            <option value="thickness">厚度</option>
            <option value="created_at">最新</option>
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>
            <i className="fa-solid fa-search" /> 搜索
          </button>
        </div>
        {/* Active filter badges */}
        {(brandFilter || sizeFilter || sort !== 'popularity' || search) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              <i className="fa-solid fa-filter" /> 筛选：
            </span>
            {search && (
              <span className="tag filter-tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onClick={() => setSearch('')} title="清除搜索">
                搜索: {search} <i className="fa-solid fa-xmark" />
              </span>
            )}
            {brandFilter && (
              <span className="tag filter-tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onClick={() => setBrandFilter('')} title="清除品牌">
                {brandFilter} <i className="fa-solid fa-xmark" />
              </span>
            )}
            {sizeFilter && (
              <span className="tag filter-tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onClick={() => setSizeFilter('')} title="清除尺码">
                {sizeFilter}码 <i className="fa-solid fa-xmark" />
              </span>
            )}
            {sort !== 'popularity' && (
              <span className="tag filter-tag" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onClick={() => setSort('popularity')} title="恢复默认排序">
                排序: {sort} <i className="fa-solid fa-xmark" />
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? <LoadingSkeleton count={6} type="card" /> : (
        <>
          {!initialLoading && diapers.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fa-solid fa-magnifying-glass" /></div>
              <h3>没有找到匹配的纸尿裤</h3>
              <p>试试调整筛选条件或搜索其他关键词</p>
              {(brandFilter || sizeFilter || sort !== 'popularity' || search) && (
                <button className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => { setSearch(''); setBrandFilter(''); setSizeFilter(''); setSort('popularity'); }}>
                  <i className="fa-solid fa-rotate-left" /> 清除所有筛选
                </button>
              )}
            </div>
          ) : (
          <>
          {hotRankings.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}><i className="fa-solid fa-fire" /> 热门 TOP 5</h3>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {hotRankings.map((d, i) => (
                  <Link to={`/diaper/${d.id}`} key={d.id} style={{ textDecoration: 'none', color: 'inherit', minWidth: 200 }}>
                    <div className="diaper-card">
                      <div className="brand">TOP {i + 1}</div>
                      <div className="model">{d.brand} {d.model}</div>
                      <div className="meta">
                        <span className="score-badge"><i className="fa-solid fa-star" style={{ color: 'var(--warning)' }} /> {d.composite_score || Number(d.avg_score).toFixed(1)}</span>
                        <span>{d.sizes?.[0]?.label || ''}码</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ marginBottom: 12 }}><i className="fa-solid fa-box" /> 全部纸尿裤 ({diapers.length})</h3>
          <div className="diaper-grid">
            {diapers.map((d, i) => (
              <Link to={`/diaper/${d.id}`} key={d.id} className="diaper-card stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="brand">{d.brand}</div>
                  {d.is_baby_diaper === 1 && (
                    <span style={{ fontSize: '0.65rem', background: 'var(--badge-bg)', color: 'var(--badge-color)', padding: '1px 6px', borderRadius: 8 }}>
                      <i className="fa-solid fa-baby" /> 婴儿款
                    </span>
                  )}
                </div>
                <div className="model">{d.model}</div>
                <div className="meta">
                  <span className="tag">{d.product_type}</span>
                  {d.sizes && d.sizes.length > 0 && (
                    <span className="tag">{d.sizes.map(s=>s.label).join(' / ')}</span>
                  )}
                  <span className="tag"><i className="fa-solid fa-layer-group" /> 厚 {d.thickness}/5</span>
                  {d.absorbency_adult && (
                    <span className="tag"><i className="fa-solid fa-droplet" /> {d.absorbency_adult}</span>
                  )}
                </div>
                <div className="meta" style={{ marginTop: 8 }}>
                  {d.avg_score > 0 && (
                    <span className="score-badge"><i className="fa-solid fa-star" style={{ color: 'var(--warning)' }} /> {Number(d.avg_score).toFixed(1)}</span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.rating_count} 评价</span>
                  {d.avg_price && <span style={{ fontWeight: 600 }}>{d.avg_price}</span>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
</>
)}
    </div>
  );
}
