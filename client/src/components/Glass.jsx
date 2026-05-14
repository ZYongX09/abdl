import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { canRunLiquidGlass, getGlassConfig } from '../utils/glassPerf';

// 懒加载 LiquidGlass，避免低端设备也加载这个大模块
const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * Glass — 液态玻璃包装组件
 *
 * 三级降级策略：
 * 1. 高级材质（liquid-glass-enabled）+ 设备支持 → LiquidGlass 组件
 * 2. 焕新视觉（glass-enabled）→ CSS backdrop-filter 毛玻璃（由 CSS 控制）
 * 3. 无效果 → 普通不透明背景
 *
 * @param {'card'|'panel'|'button'|'input'|'nav'|'modal'|'rank'} preset - 效果预设
 * @param {string} className - 附加 CSS 类名
 * @param {string} glassClassName - 启用 CSS 毛玻璃时的类名（如 'card', 'diaper-card'）
 * @param {object} style - 附加内联样式
 * @param {React.RefObject} mouseContainer - 鼠标追踪容器 ref
 * @param {object} liquidProps - 透传给 LiquidGlass 的额外 props
 */
export default function Glass({
  children,
  preset = 'card',
  className = '',
  glassClassName = 'card',
  style = {},
  mouseContainer = null,
  liquidProps = {},
  onClick,
  as: Tag = 'div',
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

  // 液态玻璃模式 + 设备支持
  if (liquidEnabled && deviceSupported && config) {
    return (
      <Suspense fallback={
        <Tag className={`${glassClassName} ${className}`} style={style} onClick={onClick} {...rest}>
          {children}
        </Tag>
      }>
        <LiquidGlass
          {...config}
          {...liquidProps}
          mouseContainer={mouseContainer}
          onClick={onClick}
          className={className}
          style={style}
        >
          {children}
        </LiquidGlass>
      </Suspense>
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
