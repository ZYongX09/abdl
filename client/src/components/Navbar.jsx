import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname.startsWith(p) ? 'active' : '';

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-lg font-bold">
          <i className="fa-solid fa-baby text-primary" /> ABDL Space
        </Link>
      </div>
      <div className="navbar-center hidden md:flex">
        <Link to="/" className={`btn btn-ghost btn-sm ${isActive('/diaper')||location.pathname==='/'?'':'btn-ghost'}`}>
          <i className="fa-solid fa-house" /> 首页
        </Link>
        <Link to="/rankings" className="btn btn-ghost btn-sm">
          <i className="fa-solid fa-trophy" /> 排行榜
        </Link>
        <Link to="/forum" className="btn btn-ghost btn-sm">
          <i className="fa-regular fa-comments" /> 论坛
        </Link>
        <Link to="/termwiki" className="btn btn-ghost btn-sm">
          <i className="fa-solid fa-book" /> 术语
        </Link>
        {user && (
          <Link to="/recommend" className="btn btn-ghost btn-sm">
            <i className="fa-solid fa-robot" /> 推荐
          </Link>
        )}
      </div>
      <div className="navbar-end gap-2">
        {user ? (<>
          {user.role==='admin' && <span className="badge badge-primary badge-sm">管理员</span>}
          <Link to="/profile" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-user" /> {user.username}
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={()=>{logout();navigate('/');}}>
            <i className="fa-solid fa-right-from-bracket" /> 退出
          </button>
        </>) : (<>
          <Link to="/login" className="btn btn-outline btn-sm">登录</Link>
          <Link to="/register" className="btn btn-primary btn-sm">注册</Link>
        </>)}
      </div>
    </nav>
  );
}
