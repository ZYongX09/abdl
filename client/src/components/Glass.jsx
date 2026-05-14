import { lazy, Suspense } from 'react';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — 直接使用 LiquidGlass 作为组件容器
 *
 * 官方用法：LiquidGlass 包裹内容，它本身就是容器。
 * position:absolute 脱离文档流，top:50%+left:50%+translate(-50%,-50%)=居中于父容器。
 * 父容器 position:relative + overflow:hidden 裁剪边界。
 */
export default function Glass({
  children,
  preset = 'card',
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  const presets = {
    card:    { displacementScale: 60, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2,   elasticity: 0.15, cornerRadius: 20,  mode: 'standard' },
    panel:   { displacementScale: 45, blurAmount: 0.08,   saturation: 130, aberrationIntensity: 1.5, elasticity: 0.1,  cornerRadius: 16,  mode: 'standard' },
    button:  { displacementScale: 70, blurAmount: 0.1,    saturation: 150, aberrationIntensity: 3,   elasticity: 0.35, cornerRadius: 100, mode: 'standard' },
    nav:     { displacementScale: 30, blurAmount: 0.04,   saturation: 120, aberrationIntensity: 1,   elasticity: 0.05, cornerRadius: 0,   mode: 'standard' },
    modal:   { displacementScale: 65, blurAmount: 0.08,   saturation: 145, aberrationIntensity: 2.5, elasticity: 0.2,  cornerRadius: 24,  mode: 'standard' },
    rank:    { displacementScale: 50, blurAmount: 0.06,   saturation: 135, aberrationIntensity: 2,   elasticity: 0.12, cornerRadius: 16,  mode: 'standard' },
  };

  const config = presets[preset] || presets.card;

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      onClick={onClick}
      {...rest}
    >
      <Suspense fallback={null}>
        <LiquidGlass
          {...config}
          padding="0"
          style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%' }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </LiquidGlass>
      </Suspense>
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
