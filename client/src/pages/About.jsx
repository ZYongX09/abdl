import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const VERSION = '5.1.7';

// Embedded changelog (kept in sync with CHANGELOG.md)
const CHANGELOG = [
  {
    version: 'v5.1.7',
    date: '2026-05-09',
    changes: [
      '新增关于页面，显示版本号和更新日志',
      '修复 readAllNotifications() 返回 undefined 导致的页面错误',
      'API key 改用环境变量，移除硬编码',
      '新增 .env 模板文件',
    ],
  },
  {
    version: 'v5.1.6',
    date: '2026-05-09',
    changes: [
      '图片灯箱效果',
      '交错入场动画',
      '标签页底部指示器',
      '暗色模式下 placeholder 适配',
    ],
  },
  {
    version: 'v5.1.5',
    date: '2026-05-09',
    changes: [
      '用户主页功能',
      '评论支持图片上传',
      '发帖/评论增加字符计数',
    ],
  },
  {
    version: 'v5.1.4',
    date: '2026-05-09',
    changes: [
      '图片上传预览',
      'Toast 退出动画',
      '对比页标签链接可点击',
      '页脚动态年份',
    ],
  },
  {
    version: 'v5.1.3',
    date: '2026-05-09',
    changes: [
      '页面标题动态设置',
      '术语 Wiki 支持复制',
      '排行榜骨架加载',
      '表单聚焦优化',
      '侧边栏 ESC 关闭',
      '回到顶部按钮',
      '分享按钮',
      '论坛加载态优化',
      '首页空状态',
      'API 修复和错误边界',
    ],
  },
  {
    version: 'v5.1.2',
    date: '2026-05-09',
    changes: [
      '滚动进度条',
      '筛选标签可清除',
      '发帖字符计数器',
      '密码可见切换',
      '暗色模式 select/checkbox 修复',
    ],
  },
  {
    version: 'v5.1.1',
    date: '2026-05-09',
    changes: [
      '自动迭代基础改进',
    ],
  },
  {
    version: 'v5.1.0',
    date: '2026-05-09',
    changes: [
      '所有 emoji 替换为 Font Awesome',
      '深色模式全面适配',
      '搜索功能修复（URL 参数联动）',
      '对比工具按钮修复',
      '主题切换按钮移至右上角',
    ],
  },
  {
    version: 'v5.0.0',
    date: '2026-05-09',
    changes: [
      '使用感受评分系统（-5 ~ +5 滑块）',
      'AI 推荐隐私权限弹窗（数据选择 + DeepSeek 说明）',
      '用户头像上传/编辑/移除',
      '深色/浅色模式切换',
      'CSS 变量统一管理 + 动画增强',
      '纸尿裤小卡片尺码显示修复',
      '综合评分整合感受权重（90% + 10%）',
    ],
  },
];

export default function About() {
  const [showChangelog, setShowChangelog] = useState(true);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="hero-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>
          <i className="fa-solid fa-baby" style={{ color: 'var(--primary-dark)' }} />
        </div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>ABDL Space</h1>
        <p style={{ color: 'var(--hero-text)', fontSize: '1rem', fontWeight: 500 }}>
          <i className="fa-solid fa-code-branch" /> {VERSION}
        </p>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.9rem' }}>
          纸尿裤评测与推荐平台 — 帮助成年用户找到最适合的纸尿裤
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>
            <i className="fa-solid fa-clock-rotate-left" /> 更新日志
          </h3>
          <button className="btn btn-outline btn-sm" onClick={() => setShowChangelog(!showChangelog)}>
            {showChangelog ? '收起' : '展开'}
          </button>
        </div>

        {showChangelog && (
          <div>
            {CHANGELOG.map((entry, i) => (
              <div key={entry.version} style={{
                padding: '16px 0',
                borderBottom: i < CHANGELOG.length - 1 ? '1px solid var(--border)' : 'none',
                animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}>
                    {entry.version}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{entry.date}</span>
                </div>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {entry.changes.map((c, j) => (
                    <li key={j} style={{ fontSize: '0.9rem', marginBottom: 3, color: 'var(--text-light)' }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>
          <i className="fa-solid fa-circle-info" /> 技术栈
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { name: 'React 18', icon: 'fa-brands fa-react', desc: '前端框架' },
            { name: 'Vite 5', icon: 'fa-solid fa-bolt', desc: '构建工具' },
            { name: 'Font Awesome 6', icon: 'fa-solid fa-icons', desc: '图标库' },
            { name: 'DeepSeek', icon: 'fa-solid fa-robot', desc: 'AI 推荐' },
            { name: 'localStorage', icon: 'fa-solid fa-database', desc: '数据存储' },
            { name: 'GitHub', icon: 'fa-brands fa-github', desc: '代码托管' },
          ].map(tech => (
            <div key={tech.name} style={{
              padding: 12, borderRadius: 'var(--radius-sm)',
              background: 'var(--rating-bg)', border: '1px solid var(--rating-border)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: 4 }}>
                <i className={tech.icon} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tech.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
          <i className="fa-solid fa-shield-halved" /> 隐私说明
        </p>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
          AI 推荐功能由 DeepSeek 提供支持。用户可选择发送哪些数据，详见推荐页面的隐私弹窗。
          所有评分和感受数据仅存储在本地浏览器中。
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/" className="btn btn-outline">
          <i className="fa-solid fa-house" /> 返回首页
        </Link>
      </div>
    </div>
  );
}
