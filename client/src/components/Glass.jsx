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

export default function Glass({ children, preset = 'card', className = '', style = {}, onClick, as: Tag = 'div', ...rest }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => setEnabled(document.documentElement.classList.contains('glass-enabled'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!enabled) {
    return <Tag className={className} style={style} onClick={onClick} {...rest}>{children}</Tag>;
  }

  const config = PRESETS[preset] || PRESETS.card;
  return (
    <Suspense fallback={<Tag className={className} style={style} {...rest}>{children}</Tag>}>
      <LiquidGlass {...config} onClick={onClick} className={className} style={style} {...rest}>
        {children}
      </LiquidGlass>
    </Suspense>
  );
}
