import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    age: '', region: '', weight: '', waist: '', hip: '', style_preference: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

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
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          <i className="fa-solid fa-user-plus" style={{ color: 'var(--accent)' }} /> 加入 ABDL Space
        </h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名 *</label>
            <input className="form-control" value={form.username} onChange={update('username')} placeholder="你的昵称" required />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input className="form-control" type="email" value={form.email} onChange={update('email')} placeholder="选填" />
          </div>
          <div className="form-group">
            <label>密码 *</label>
            <input className="form-control" type="password" value={form.password} onChange={update('password')} placeholder="至少 6 位" required />
          </div>
          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
            <i className="fa-solid fa-circle-info" /> 以下信息帮助 AI 为你推荐最合适的纸尿裤（选填，可后续补充）
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group">
              <label>年龄</label>
              <input className="form-control" type="number" value={form.age} onChange={update('age')} placeholder="岁" />
            </div>
            <div className="form-group">
              <label>地区</label>
              <input className="form-control" value={form.region} onChange={update('region')} placeholder="城市" />
            </div>
            <div className="form-group">
              <label>体重 (kg)</label>
              <input className="form-control" type="number" step="0.1" value={form.weight} onChange={update('weight')} placeholder="kg" />
            </div>
            <div className="form-group">
              <label>腰围 (cm)</label>
              <input className="form-control" type="number" step="0.1" value={form.waist} onChange={update('waist')} placeholder="cm" />
            </div>
            <div className="form-group">
              <label>臀围 (cm)</label>
              <input className="form-control" type="number" step="0.1" value={form.hip} onChange={update('hip')} placeholder="cm" />
            </div>
            <div className="form-group">
              <label>偏好款式</label>
              <input className="form-control" value={form.style_preference} onChange={update('style_preference')} placeholder="如：日系可爱" />
            </div>
          </div>
          <button className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> 注册中...</> : <><i className="fa-solid fa-baby" /> 注册</>}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem' }}>
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </div>
    </div>
  );
}
