import { lazy, Suspense } from 'react';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — 液态玻璃组件
 *
 * LiquidGlass 内部使用 top:50% + left:50% + translate(-50%,-50%)。
 * 使用 position:absolute 脱离文档流，让居中变换在父容器内完成。
 * 父容器 position:relative + overflow:hidden 裁剪边界。
 */

const PRESETS = {
  card:    { displacementScale: 60, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2,   elasticity: 0.15, cornerRadius: 20,  mode: 'standard' },
  hero:    { displacementScale: 70, blurAmount: 0.08,   saturation: 150, aberrationIntensity: 2.5, elasticity: 0.2,  cornerRadius: 24,  mode: 'standard' },
  panel:   { displacementScale: 50, blurAmount: 0.1,    saturation: 135, aberrationIntensity: 1.5, elasticity: 0.1,  cornerRadius: 16,  mode: 'standard' },
  button:  { displacementScale: 64, blurAmount: 0.1,    saturation: 130, aberrationIntensity: 2,   elasticity: 0.35, cornerRadius: 100, mode: 'standard' },
  rank:    { displacementScale: 55, blurAmount: 0.0625, saturation: 140, aberrationIntensity: 2,   elasticity: 0.12, cornerRadius: 16,  mode: 'standard' },
  sidebar: { displacementScale: 45, blurAmount: 0.1,    saturation: 130, aberrationIntensity: 1.5, elasticity: 0.08, cornerRadius: 0,   mode: 'standard' },
  modal:   { displacementScale: 65, blurAmount: 0.08,   saturation: 145, aberrationIntensity: 2.5, elasticity: 0.2,  cornerRadius: 24,  mode: 'standard' },
  nav:     { displacementScale: 35, blurAmount: 0.08,   saturation: 130, aberrationIntensity: 1,   elasticity: 0.05, cornerRadius: 0,   mode: 'standard' },
};

export default function Glass({
  children,
  preset = 'card',
  className = '',
  style = {},
  onClick,
  mouseContainer,
  ...rest
}) {
  const config = PRESETS[preset] || PRESETS.card;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      onClick={onClick}
      {...rest}
    >
      {/* LiquidGlass 效果层：absolute 脱离文档流 */}
      <Suspense fallback={null}>
        <LiquidGlass
          {...config}
          padding="0"
          mouseContainer={mouseContainer}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </LiquidGlass>
      </Suspense>

      {/* 内容层 */}
      <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
