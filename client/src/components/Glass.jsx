import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { canRunLiquidGlass, getGlassConfig } from '../utils/glassPerf';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — iOS 26 液态玻璃包装组件
 *
 * LiquidGlass 组件内部使用 top:50% + left:50% + translate(-50%,-50%) 居中。
 * 正确用法：外层 position:relative 让百分比相对父元素，
 *           内层 LiquidGlass 的居中变换在容器内部完成。
 *
 * @param {'card'|'panel'|'button'|'input'|'nav'|'modal'|'rank'} preset
 */
export default function Glass({
  children,
  preset = 'card',
  className = '',
  glassClassName = 'card',
  style = {},
  onClick,
  ...rest
}) {
  const [liquidEnabled, setLiquidEnabled] = useState(false);
  const [deviceSupported, setDeviceSupported] = useState(false);
  const configRef = useRef(null);

  useEffect(() => {
    const check = () => {
      const hasGlass = document.documentElement.classList.contains('glass-enabled');
      setLiquidEnabled(hasGlass);
      if (hasGlass && !configRef.current) {
        configRef.current = getGlassConfig(preset);
        setDeviceSupported(canRunLiquidGlass());
      }
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [preset]);

  const config = configRef.current;

  // LiquidGlass 模式
  if (liquidEnabled && deviceSupported && config) {
    return (
      <div
        className={`${glassClassName} ${className} liquid-glass-active`}
        style={{
          ...style,
          position: 'relative',
          overflow: 'hidden',
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: 'none',
        }}
        onClick={onClick}
        {...rest}
      >
        {/* LiquidGlass 效果层：top:50% + left:50% + translate(-50%,-50%) = 居中于父容器 */}
        <Suspense fallback={null}>
          <LiquidGlass
            {...config}
            padding="0"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
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

  // CSS 毛玻璃降级
  return (
    <div className={`${glassClassName} ${className}`} style={style} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}
