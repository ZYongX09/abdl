import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { canRunLiquidGlass, getGlassConfig } from '../utils/glassPerf';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — iOS 26 液态玻璃包装组件
 *
 * LiquidGlass 内部 5 个子元素全部使用:
 *   position: relative, top: 50%, left: 50%, transform: translate(-50%,-50%)
 *
 * 用 position:absolute 让这 5 个元素脱离文档流，
 * top:50% + left:50% + translate(-50%,-50%) = 在父容器内完美居中。
 * 父容器由内容撑开高度，LiquidGlass 填充整个父容器。
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
        {/* LiquidGlass: absolute 脱离文档流, top:50%+left:50%+translate(-50%,-50%)=居中 */}
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
        <div style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`${glassClassName} ${className}`} style={style} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}
