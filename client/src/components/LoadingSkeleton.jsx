import { useState, useEffect } from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'feed') {
    return Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton skeleton-card" style={{ padding: 20, background: 'white' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div className="skeleton skeleton-avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text short" />
          </div>
        </div>
        <div className="skeleton skeleton-text" style={{ width: '100%' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text short" style={{ width: '40%' }} />
      </div>
    ));
  }

  return (
    <div className="diaper-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ padding: 20, background: 'white', height: 140 }}>
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text" style={{ width: '80%', height: 20 }} />
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text short" style={{ width: '30%' }} />
        </div>
      ))}
    </div>
  );
}
