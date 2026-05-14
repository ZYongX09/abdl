import { useState } from 'react';
import { Link } from 'react-router-dom';

const VERSION = '5.8.5';

const CHANGELOG = [
  { version: 'v5.8.5', date: '2026-05-13', changes: ['接入 B 站点后端 API（纸尿裤数据、认证）','隐藏术语百科入口','修复排行榜数据消失问题','修复卡片动画结束后透明度归零','修复弹窗滚动、侧边栏固定','高级材质更名为焕新视觉'] },
  { version: 'v5.8.4', date: '2026-05-13', changes: ['纸尿裤列表排序功能修复','排行榜改用直接数据计算','通知已读状态字段名修复','评论点赞状态修复','液体滚动动效移除'] },
  { version: 'v5.8.3', date: '2026-05-10', changes: ['排行榜维度评分增加星级图标','版本号同步至最新 Git tag'] },
  { version: 'v5.8.0', date: '2026-05-10', changes: ['设置页面新增账户注销功能'] },
  { version: 'v5.7.x', date: '2026-05-09', changes: ['密码强度指示器、表格响应式容器','快捷键支持、通知与私信增强','高级玻璃材质效果'] },
  { version: 'v5.0 - v5.6', date: '2026-05-06~08', changes: ['使用感受评分系统','AI 推荐隐私权限弹窗','深色/浅色模式切换','综合评分整合感受权重','Font Awesome 图标、论坛搜索'] },
];

export default function About() {
  const [showChangelog, setShowChangelog] = useState(true);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      {/* Hero */}
      <div className="hero-card text-center py-8 rounded-2xl">
        <div className="text-5xl mb-2"><i className="fa-solid fa-baby text-primary" /></div>
        <h1 className="text-2xl font-bold mb-2">ABDL Space</h1>
        <p className="text-base-content/60"><i className="fa-solid fa-code-branch mr-1" /> {VERSION}</p>
        <p className="text-sm text-base-content/40 mt-2">纸尿裤评测与推荐平台 — 帮助成年用户找到最适合的纸尿裤</p>
      </div>

      {/* Changelog */}
      <div className="card">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title"><i className="fa-solid fa-clock-rotate-left" /> 更新日志</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowChangelog(!showChangelog)}>
              {showChangelog ? '收起' : '展开'}
            </button>
          </div>
          {showChangelog && (
            <div className="flex flex-col">
              {CHANGELOG.map((entry, i) => (
                <div key={entry.version} className={`py-4 ${i < CHANGELOG.length - 1 ? 'border-b border-base-300' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge badge-primary badge-sm">{entry.version}</span>
                    <span className="text-sm text-base-content/40">{entry.date}</span>
                  </div>
                  <ul className="list-disc list-inside">
                    {entry.changes.map((c, j) => (
                      <li key={j} className="text-sm text-base-content/70 mb-0.5">{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card">
        <div className="card-body">
          <h3 className="card-title"><i className="fa-solid fa-circle-info" /> 技术栈</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'React 18', icon: 'fa-brands fa-react', desc: '前端框架' },
              { name: 'Vite 5', icon: 'fa-solid fa-bolt', desc: '构建工具' },
              { name: 'Tailwind + daisyUI', icon: 'fa-solid fa-palette', desc: 'UI 框架' },
              { name: 'DeepSeek', icon: 'fa-solid fa-robot', desc: 'AI 推荐' },
              { name: 'Cloudflare D1', icon: 'fa-solid fa-database', desc: '数据库' },
              { name: 'GitHub', icon: 'fa-brands fa-github', desc: '代码托管' },
            ].map(tech => (
              <div key={tech.name} className="text-center p-3 rounded-xl bg-base-200 border border-base-300">
                <div className="text-2xl text-primary mb-2"><i className={tech.icon} /></div>
                <div className="font-semibold text-sm">{tech.name}</div>
                <div className="text-sm text-base-content/40">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="card">
        <div className="card-body">
          <h3 className="card-title"><i className="fa-solid fa-keyboard" /> 快捷键</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { keys: 'Ctrl+Shift+T', desc: '切换主题（浅色/深色/多彩）' },
              { keys: 'Alt+1~8', desc: '快速导航到各页面' },
              { keys: 'Ctrl+D', desc: '跳转纸尿裤列表' },
            ].map(s => (
              <div key={s.keys} className="flex items-center gap-3 text-sm">
                <kbd className="kbd kbd-sm bg-base-200">{s.keys}</kbd>
                <span className="text-base-content/60">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="card">
        <div className="card-body text-center">
          <p className="text-sm text-base-content/60 mb-2"><i className="fa-solid fa-shield-halved mr-1" /> 隐私说明</p>
          <p className="text-sm text-base-content/40">
            AI 推荐功能由 DeepSeek 提供支持。用户可选择发送哪些数据。所有评分和感受数据仅存储在本地浏览器中。
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <Link to="/" className="btn btn-outline"><i className="fa-solid fa-house mr-1" /> 返回首页</Link>
      </div>
    </div>
  );
}
