import { useState, useEffect, lazy, Suspense } from 'react';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

const PRESETS = {
  card:    { cornerRadius: 24, elasticity: 0.2,  displacementScale: 60, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2 },
  hero:    { cornerRadius: 24, elasticity: 0.25, displacementScale: 70, blurAmount: 0.08,   saturation: 150, aberrationIntensity: 2.5 },
  panel:   { cornerRadius: 16, elasticity: 0.1,  displacementScale: 50, blurAmount: 0.1,    saturation: 135, aberrationIntensity: 1.5 },
  button:  { cornerRadius: 100, elasticity: 0.35, displacementScale: 64, blurAmount: 0.1,   saturation: 130, aberrationIntensity: 2, padding: '8px 20px' },
  rank:    { cornerRadius: 16, elasticity: 0.15, displacementScale: 55, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2 },
  sidebar: { cornerRadius: 0,  elasticity: 0.08, displacementScale: 45, blurAmount: 0.1,    saturation: 130, aberrationIntensity: 1.5 },
};

export default function Glass({ children, preset = 'card', className = '', style = {}, onClick, ...rest }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => setEnabled(document.documentElement.classList.contains('glass-enabled'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // 关闭焕新视觉 → 普通 div
  if (!enabled) {
    return <div className={className} style={style} onClick={onClick} {...rest}>{children}</div>;
  }

  const config = PRESETS[preset] || PRESETS.card;

  // 开启焕新视觉 → 外层 div 控制布局，LiquidGlass 作为背景皮肤
  return (
    <div className={className} style={{ ...style, position: 'relative' }} onClick={onClick} {...rest}>
      <Suspense fallback={null}>
        <LiquidGlass
          {...config}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <div />
        </LiquidGlass>
      </Suspense>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
