import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { canRunLiquidGlass } from '../utils/glassPerf';

const LiquidGlass = lazy(() => import('liquid-glass-react'));

/**
 * GlassOverlay — 全局液态玻璃覆盖层
 *
 * LiquidGlass 组件的设计是浮动面板（position:fixed/absolute + 居中变换），
 * 不适合逐个包裹卡片。正确用法：一个全屏 LiquidGlass 面板覆盖在页面上，
 * 通过 mouseContainer 追踪整个主内容区域的鼠标移动。
 *
 * 卡片本身的毛玻璃效果由 CSS backdrop-filter 处理。
 */
export default function GlassOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const check = () => {
      const has = document.documentElement.classList.contains('glass-enabled');
      setEnabled(has);
      if (has) setSupported(canRunLiquidGlass());
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // 追踪主内容区域
  const containerRef = useRef(null);
  useEffect(() => {
    containerRef.current = document.querySelector('.main-content') || document.body;
  }, []);

  if (!enabled || !supported) return null;

  return (
    <Suspense fallback={null}>
      <LiquidGlass
        displacementScale={70}
        blurAmount={0.0625}
        saturation={140}
        aberrationIntensity={2}
        elasticity={0.15}
        cornerRadius={24}
        padding="0"
        mouseContainer={containerRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '80vw',
          height: '80vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
        overLight={false}
        mode="standard"
      >
        <div style={{ width: '100%', height: '100%' }} />
      </LiquidGlass>
    </Suspense>
  );
}
