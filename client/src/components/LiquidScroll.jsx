import { useEffect, useRef } from 'react';

/**
 * LiquidScroll — 焕新视觉下的玻璃折射层注入
 *
 * 启用 .glass-enabled 时：
 * 自动注入镜面高光层 (specular-layer) 和焦散层 (caustics-layer)
 */

const REFRACTION_ELS = new Set();
const SPECULAR_CLASS = 'specular-layer';
const CAUSTICS_CLASS = 'caustics-layer';

/** 确保元素内部有折射层 DOM 节点 */
function ensureRefractionLayers(el) {
  if (REFRACTION_ELS.has(el)) return;
  REFRACTION_ELS.add(el);

  // 镜面高光层
  if (!el.querySelector(`.${SPECULAR_CLASS}`)) {
    const div = document.createElement('div');
    div.className = SPECULAR_CLASS;
    div.setAttribute('aria-hidden', 'true');
    el.appendChild(div);
  }

  // 焦散层（仅 hero-card）
  if (el.classList.contains('hero-card') && !el.querySelector(`.${CAUSTICS_CLASS}`)) {
    const div = document.createElement('div');
    div.className = CAUSTICS_CLASS;
    div.setAttribute('aria-hidden', 'true');
    el.insertBefore(div, el.firstChild);
  }
}

/** 清理元素内的折射层 */
function removeRefractionLayers(el) {
  REFRACTION_ELS.delete(el);
  el.querySelectorAll(`.${SPECULAR_CLASS}, .${CAUSTICS_CLASS}`).forEach(c => c.remove());
}

export default function LiquidScroll() {
  const isActiveRef = useRef(false);
  const trackedElsRef = useRef(new Set());

  const collectElements = () => {
    if (!isActiveRef.current) return;
    const selector = '.card, .diaper-card, .rank-item, .hero-card, .post-card, .modal';
    const els = document.querySelectorAll(selector);
    const currentSet = new Set();

    els.forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (el.closest('.modal-overlay')) return;
      if (style.position === 'fixed' || style.position === 'sticky') return;

      ensureRefractionLayers(el);
      currentSet.add(el);
    });

    // Clean up elements no longer in DOM
    for (const el of trackedElsRef.current) {
      if (!currentSet.has(el)) {
        removeRefractionLayers(el);
      }
    }
    trackedElsRef.current = currentSet;
  };

  const deactivate = () => {
    for (const el of trackedElsRef.current) {
      removeRefractionLayers(el);
    }
    trackedElsRef.current = new Set();
  };

  useEffect(() => {
    const checkGlass = () => {
      // 液态玻璃模式下禁用，由 LiquidGlass 组件处理效果
      const active = false;
      if (active !== isActiveRef.current) {
        isActiveRef.current = active;
        active ? collectElements() : deactivate();
      }
    };

    checkGlass();

    const classObserver = new MutationObserver(checkGlass);
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const collectInterval = setInterval(() => {
      if (isActiveRef.current) collectElements();
    }, 2000);

    const domObserver = new MutationObserver(() => {
      if (isActiveRef.current) {
        clearTimeout(domObserver._timer);
        domObserver._timer = setTimeout(collectElements, 300);
      }
    });
    domObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      classObserver.disconnect();
      domObserver.disconnect();
      clearInterval(collectInterval);
      deactivate();
    };
  }, []);

  return null;
}
