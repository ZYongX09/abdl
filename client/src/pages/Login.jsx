import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { usernameRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title justify-center text-xl mb-2">
            <i className="fa-solid fa-baby" style={{ color: 'var(--primary)' }} /> 登录 ABDL Space
          </h2>
          {error && <div className="alert alert-error mb-3"><span>{error}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">用户名</span>
              </label>
              <input ref={usernameRef} className="input input-bordered w-full" type="text" value={username}
                onChange={e => setUsername(e.target.value)} placeholder="输入用户名" required />
            </div>
            <div className="form-control mb-5">
              <label className="label">
                <span className="label-text">密码</span>
              </label>
              <div className="relative">
                <input className="input input-bordered w-full pr-10" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="输入密码" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
                  tabIndex={-1} aria-label={showPassword ? '隐藏密码' : '显示密码'}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>
            <button className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> 登录中...</> : <><i className="fa-solid fa-right-to-bracket" /> 登录</>}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            还没有账号？<Link to="/register" className="link link-primary">立即注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
