import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BackToTop from './components/BackToTop';
import ForumFeed from './pages/ForumFeed';
import PostDetail from './pages/PostDetail';
import NotificationsPage from './pages/NotificationsPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DiaperDetail from './pages/DiaperDetail';
import Profile from './pages/Profile';
import Rankings from './pages/Rankings';
import Recommendations from './pages/Recommendations';
import TermWiki from './pages/TermWiki';
import AdminPage from './pages/AdminPage';
import ComparePage from './pages/ComparePage';
import MessagesPage from './pages/MessagesPage';

function getInitialTheme() {
  const saved = localStorage.getItem('abdl_theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('abdl_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {/* Floating theme toggle - top right */}
        <div style={{
          position: 'fixed', top: 16, right: 24, zIndex: 250,
        }}>
          <button
            className="theme-toggle-float"
            onClick={toggleTheme}
            title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
        </div>

        <div className="container page-enter" style={{ maxWidth: 800, padding: '24px 20px' }}>
          <Routes>
            <Route path="/" element={<ForumFeed />} />
            <Route path="/forum/:id" element={<PostDetail />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/diapers" element={<Home />} />
            <Route path="/diaper/:id" element={<DiaperDetail />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/recommend" element={<Recommendations />} />
            <Route path="/termwiki" element={<TermWiki />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <footer style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <i className="fa-solid fa-baby" style={{ color: 'var(--primary)' }} /> ABDL Space v5 · <a href="/forum" style={{ color: 'var(--link-color)' }}>论坛</a> · <a href="/termwiki" style={{ color: 'var(--link-color)' }}>术语</a>
        </footer>
      </div>
      <BackToTop />
    </div>
  );
}
