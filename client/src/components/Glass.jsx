import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { canRunLiquidGlass, getGlassConfig } from '../utils/glassPerf';

// 懒加载 LiquidGlass，避免低端设备也加载这个大模块
const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — 液态玻璃包装组件
 *
 * 三级降级策略：
 * 1. 高级材质（glass-enabled）+ 设备支持 → LiquidGlass 覆盖层
 * 2. 焕新视觉（glass-enabled）→ CSS backdrop-filter 毛玻璃
 * 3. 无效果 → 普通不透明背景
 *
 * LiquidGlass 组件内部 transform/top/left 会破坏布局，
 * 所以把它放在绝对定位的 overlay 层，不影响文档流。
 */
export default function Glass({
  children,
  preset = 'card',
  className = '',
  glassClassName = 'card',
  style = {},
  onClick,
  as: Tag = 'div',
  ...rest
}) {
  const [liquidEnabled, setLiquidEnabled] = useState(false);
  const [deviceSupported, setDeviceSupported] = useState(false);
  const configRef = useRef(null);
  const containerRef = useRef(null);

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

  // 液态玻璃模式 + 设备支持
  if (liquidEnabled && deviceSupported && config) {
    return (
      <Tag ref={containerRef} className={`${glassClassName} ${className} liquid-glass-active`} style={{ ...style, position: 'relative', overflow: 'hidden' }} onClick={onClick} {...rest}>
        {/* LiquidGlass 绝对定位覆盖层，视觉效果层 */}
        <Suspense fallback={null}>
          <LiquidGlass
            {...config}
            mouseContainer={containerRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <span style={{ display: 'block', width: '100%', height: '100%' }} />
          </LiquidGlass>
        </Suspense>
        {/* 内容层在覆盖层之上 */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </Tag>
    );
  }

  // 普通模式（CSS 毛玻璃由 .glass-enabled 类控制）
  return (
    <Tag className={`${glassClassName} ${className}`} style={style} onClick={onClick} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * GlassNav — 导航栏专用
 */
export function GlassNav({ children, className = '', style = {}, ...rest }) {
  return (
    <Glass preset="nav" glassClassName="navbar-inner" className={className} style={style} {...rest}>
      {children}
    </Glass>
  );
}

/**
 * GlassModal — 弹窗专用
 */
export function GlassModal({ children, className = '', style = {}, ...rest }) {
  return (
    <Glass preset="modal" glassClassName="modal" className={className} style={style} {...rest}>
      {children}
    </Glass>
  );
}

/**
 * GlassButton — 按钮专用
 */
export function GlassButton({ children, className = '', style = {}, onClick, ...rest }) {
  return (
    <Glass preset="button" glassClassName="btn" className={className} style={style} onClick={onClick} {...rest}>
      {children}
    </Glass>
  );
}
