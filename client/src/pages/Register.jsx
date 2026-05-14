import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { PageLayout, PageHeroCenter } from '../components/PageLayout';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    age: '', region: '', weight: '', waist: '', hip: '', style_preference: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  useEffect(() => { usernameRef.current?.focus(); }, []);

  const passwordStrength = useMemo(() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [form.password]);
  const strengthColors = ['', '#E8837C', '#F0C040', '#7BC67E', '#5DAE60', '#2E7D32'];
  const strengthLabels = ['', '弱', '较弱', '一般', '强', '很强'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        age: form.age ? Number(form.age) : undefined,
        region: form.region || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        waist: form.waist ? Number(form.waist) : undefined,
        hip: form.hip ? Number(form.hip) : undefined,
        style_preference: form.style_preference || undefined,
      };
      await register(body);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout maxWidth={540} className="mt-8 auth-page-wrapper">
      <PageHeroCenter
        icon="fa-solid fa-user-plus"
        iconColor="var(--accent-dark)"
        title="加入 ABDL Space"
        subtitle="创建账号，开始你的纸尿裤评测之旅"
      />

      <div className="card">
        <div className="card-body">
          <h2 className="card-title justify-center text-xl mb-2">
            <i className="fa-solid fa-user-plus" style={{ color: 'var(--accent)' }} /> 注册
          </h2>
          {error && <div className="alert alert-error mb-3"><span>{error}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-3">
              <label className="label"><span className="label-text">用户名 *</span></label>
              <input ref={usernameRef} className="input input-bordered w-full" value={form.username} onChange={update('username')} placeholder="你的昵称" required />
            </div>
            <div className="form-control mb-3">
              <label className="label"><span className="label-text">邮箱</span></label>
              <input className="input input-bordered w-full" type="email" value={form.email} onChange={update('email')} placeholder="选填" />
            </div>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">密码 *</span></label>
              <div className="relative">
                <input className="input input-bordered w-full pr-10" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={update('password')} placeholder="至少 6 位" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
                  tabIndex={-1} aria-label={showPassword ? '隐藏密码' : '显示密码'}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="w-full h-1.5 rounded-full bg-base-300 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      background: strengthColors[passwordStrength]
                    }} />
                  </div>
                  <span className="text-sm mt-1 block" style={{ color: strengthColors[passwordStrength] }}>
                    密码强度: {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="divider">可选信息</div>
            <p className="text-sm text-base-content/60 mb-4">
              <i className="fa-solid fa-circle-info mr-1" /> 以下信息帮助 AI 为你推荐最合适的纸尿裤（可后续补充）
            </p>
            <div className="register-grid mb-4">
              <div className="form-control">
                <label className="label"><span className="label-text">年龄</span></label>
                <input className="input input-bordered w-full" type="number" value={form.age} onChange={update('age')} placeholder="岁" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">地区</span></label>
                <input className="input input-bordered w-full" value={form.region} onChange={update('region')} placeholder="城市" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">体重 (kg)</span></label>
                <input className="input input-bordered w-full" type="number" step="0.1" value={form.weight} onChange={update('weight')} placeholder="kg" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">腰围 (cm)</span></label>
                <input className="input input-bordered w-full" type="number" step="0.1" value={form.waist} onChange={update('waist')} placeholder="cm" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">臀围 (cm)</span></label>
                <input className="input input-bordered w-full" type="number" step="0.1" value={form.hip} onChange={update('hip')} placeholder="cm" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">偏好款式</span></label>
                <input className="input input-bordered w-full" value={form.style_preference} onChange={update('style_preference')} placeholder="如：日系可爱" />
              </div>
            </div>

            <button className="btn btn-accent w-full" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> 注册中...</> : <><i className="fa-solid fa-baby" /> 注册</>}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            已有账号？<Link to="/login" className="link link-primary">去登录</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
