import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const items = [
    { path: '/', icon: 'fa-regular fa-comments', label: '论坛' },
    { path: '/diapers', icon: 'fa-solid fa-box', label: '纸尿裤' },
    { path: '/rankings', icon: 'fa-solid fa-trophy', label: '排行' },
    ...(user ? [{ path: '/recommend', icon: 'fa-solid fa-robot', label: '推荐' }] : []),
    { path: '/settings', icon: 'fa-solid fa-gear', label: '设置' },
  ];

  return (
    <div className="btm-nav btm-nav-sm md:hidden bg-base-100/90 backdrop-blur-md border-t border-base-300">
      {items.map(item => (
        <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active text-primary' : 'text-base-content/60'}>
          <i className={item.icon} />
          <span className="btm-nav-label text-xs">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
