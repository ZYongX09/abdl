/**
 * PageLayout — 统一的页面布局容器
 * 提供一致的最大宽度、间距和动画
 */
export function PageLayout({ children, maxWidth = 720, className = '' }) {
  return (
    <div className={`flex flex-col gap-5 ${className}`} style={{ maxWidth, margin: '0 auto' }}>
      {children}
    </div>
  );
}

/**
 * PageHero — 统一的页面顶部 Hero 卡片
 * 提供一致的图标、标题、副标题样式
 */
export function PageHero({ icon, iconColor = 'var(--primary-dark)', title, subtitle, children, className = '' }) {
  return (
    <div className={`hero-card ${className}`} style={{ padding: '20px 24px' }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div style={{ fontSize: '1.6rem', color: iconColor, flexShrink: 0 }}>
            <i className={icon} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 style={{ margin: 0, color: 'var(--hero-text)', fontSize: '1.2rem', fontWeight: 800 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * PageHeroCenter — 居中版 Hero（用于登录、注册、关于等页面）
 */
export function PageHeroCenter({ icon, iconColor = 'var(--primary-dark)', title, subtitle, className = '' }) {
  return (
    <div className={`hero-card text-center ${className}`} style={{ padding: '28px 24px' }}>
      {icon && (
        <div style={{ fontSize: '2.4rem', marginBottom: 10, color: iconColor }}>
          <i className={icon} />
        </div>
      )}
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hero-text)', margin: '0 0 4px' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
