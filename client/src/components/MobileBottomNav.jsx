import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const TABS = [
  { path: '/', label: '论坛', icon: 'fa-regular fa-comments', activeIcon: 'fa-solid fa-comments' },
  { path: '/diapers', label: '纸尿裤', icon: 'fa-solid fa-box', activeIcon: 'fa-solid fa-box-open' },
  { path: '/rankings', label: '排行榜', icon: 'fa-solid fa-trophy', activeIcon: 'fa-solid fa-trophy' },
  { path: '/recommend', label: '推荐', icon: 'fa-solid fa-robot', activeIcon: 'fa-solid fa-robot' },
  { path: '/profile', label: '我的', icon: 'fa-regular fa-user', activeIcon: 'fa-solid fa-user' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/diapers';
    return location.pathname.startsWith(path);
  };

  // Hide on login/register pages
  if (['/login', '/register'].includes(location.pathname)) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="移动端导航">
      <div className="mobile-bottom-nav-inner">
        {TABS.map(tab => {
          // Profile tab: go to login if not authenticated
          const targetPath = tab.path === '/profile' && !user ? '/login' : tab.path;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={targetPath}
              className={`mobile-tab-item ${active ? 'active' : ''}`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="mobile-tab-icon-wrapper">
                <i className={active ? tab.activeIcon : tab.icon} />
                {active && <div className="mobile-tab-active-dot" />}
              </div>
              <span className="mobile-tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
