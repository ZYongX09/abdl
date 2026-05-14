import { lazy, Suspense } from 'react';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — 照搬官方用法的液态玻璃组件
 *
 * LiquidGlass 内部始终应用 translate(-50%,-50%)。
 * 通过 CSS transform: translate(+50%,+50%) 反向抵消，
 * 让组件在文档流中正常布局。
 */

const PRESETS = {
  card:    { displacementScale: 60, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2,   elasticity: 0.15, cornerRadius: 20 },
  hero:    { displacementScale: 70, blurAmount: 0.08,   saturation: 150, aberrationIntensity: 2.5, elasticity: 0.2,  cornerRadius: 24 },
  panel:   { displacementScale: 50, blurAmount: 0.1,    saturation: 135, aberrationIntensity: 1.5, elasticity: 0.1,  cornerRadius: 16 },
  button:  { displacementScale: 64, blurAmount: 0.1,    saturation: 130, aberrationIntensity: 2,   elasticity: 0.35, cornerRadius: 100 },
  rank:    { displacementScale: 55, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2,   elasticity: 0.12, cornerRadius: 16 },
  sidebar: { displacementScale: 45, blurAmount: 0.1,    saturation: 130, aberrationIntensity: 1.5, elasticity: 0.08, cornerRadius: 0 },
  modal:   { displacementScale: 65, blurAmount: 0.08,   saturation: 145, aberrationIntensity: 2.5, elasticity: 0.2,  cornerRadius: 24 },
  nav:     { displacementScale: 35, blurAmount: 0.08,   saturation: 130, aberrationIntensity: 1,   elasticity: 0.05, cornerRadius: 0 },
};

export default function Glass({
  children,
  preset = 'card',
  className = '',
  style = {},
  padding = '0',
  onClick,
  mouseContainer,
  ...rest
}) {
  const config = PRESETS[preset] || PRESETS.card;

  return (
    <div
      className={`glass-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'visible',
        ...style,
      }}
      {...rest}
    >
      <Suspense fallback={<div className={className} style={style}>{children}</div>}>
        <LiquidGlass
          {...config}
          padding={padding}
          onClick={onClick}
          mouseContainer={mouseContainer}
          className="glass-inner"
          style={{ position: 'relative' }}
        >
          {children}
        </LiquidGlass>
      </Suspense>
    </div>
  );
}
