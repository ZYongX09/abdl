import { useEffect, useRef } from 'react';

/**
 * LiquidScroll — 高级材质下的液体惯性滚动 + 玻璃折射层注入
 *
 * 启用 .glass-enabled 时：
 * 1. 卡片元素获得液体惯性（弹簧物理驱动的层叠滚动滞后）
 * 2. 自动注入镜面高光层 (specular-layer) 和焦散层 (caustics-layer)
 */

const SPRING_STIFFNESS = 0.08;
const DAMPING = 0.82;
const MAX_LAG = 48;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

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
  const offsetsRef = useRef([]);       // [{el, virtualY, velocity, baseOffset, parallax}]
  const scrollYRef = useRef(0);
  const prevScrollYRef = useRef(0);
  const rafRef = useRef(null);

  const collectElements = () => {
    if (!isActiveRef.current) return;
    const selector = '.card, .diaper-card, .rank-item, .hero-card, .post-card, .modal';
    const els = document.querySelectorAll(selector);
    const visible = [];
    els.forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (el.closest('.modal-overlay')) return;
      if (style.position === 'fixed' || style.position === 'sticky') return;

      // 注入折射层
      ensureRefractionLayers(el);

      visible.push(el);
    });

    const vh = window.innerHeight;
    const newOffsets = [];
    const oldMap = new Map();
    for (const o of offsetsRef.current) oldMap.set(o.el, o);

    for (const el of visible) {
      const rect = el.getBoundingClientRect();
      const existing = oldMap.get(el);
      if (existing) {
        existing.baseOffset = rect.top + scrollYRef.current;
        const viewportRatio = clamp(rect.top / vh, 0, 1);
        existing.parallax = 1 + viewportRatio * 0.35;
        newOffsets.push(existing);
      } else {
        const viewportRatio = clamp(rect.top / vh, 0, 1);
        newOffsets.push({
          el,
          virtualY: scrollYRef.current,
          velocity: 0,
          baseOffset: rect.top + scrollYRef.current,
          parallax: 1 + viewportRatio * 0.35,
        });
      }
    }

    offsetsRef.current = newOffsets;
  };

  const tick = () => {
    if (!isActiveRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const targetScroll = scrollYRef.current;
    const scrollVelocity = targetScroll - prevScrollYRef.current;
    prevScrollYRef.current = targetScroll;
    const vh = window.innerHeight;

    for (const item of offsetsRef.current) {
      const rect = item.el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) continue;

      const viewportRatio = clamp(rect.top / vh, 0, 1);
      item.parallax = 1 + viewportRatio * 0.35;

      const parallaxOffset = (targetScroll - item.baseOffset) * (item.parallax - 1);
      const targetVirtualY = targetScroll - parallaxOffset;

      const displacement = targetVirtualY - item.virtualY;
      const springForce = displacement * SPRING_STIFFNESS;
      const fluidPush = scrollVelocity * 0.15 * (item.parallax - 1);

      item.velocity += springForce + fluidPush;
      item.velocity *= DAMPING;

      const rawNext = item.virtualY + item.velocity;
      const maxLag = MAX_LAG + (item.parallax - 1) * 60;
      const clampedNext = clamp(rawNext, targetVirtualY - maxLag, targetVirtualY + 4);
      item.virtualY = clampedNext;

      const translateY = item.virtualY - targetScroll;
      const scaleEffect = 1 - Math.abs(item.velocity) * 0.0004;
      const skewEffect = item.velocity * 0.008;

      item.el.style.transform =
        `translateY(${translateY.toFixed(3)}px) ` +
        `scale(${clamp(scaleEffect, 0.97, 1.02).toFixed(4)}) ` +
        `skewY(${clamp(skewEffect, -1.5, 1.5).toFixed(3)}deg)`;
      item.el.style.transition = 'none';
      item.el.style.willChange = 'transform';
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const onScroll = () => { scrollYRef.current = window.scrollY; };

  const deactivate = () => {
    for (const item of offsetsRef.current) {
      item.el.style.transform = '';
      item.el.style.transition = '';
      item.el.style.willChange = '';
      removeRefractionLayers(item.el);
    }
    offsetsRef.current = [];
  };

  useEffect(() => {
    const checkGlass = () => {
      const active = document.documentElement.classList.contains('glass-enabled');
      if (active !== isActiveRef.current) {
        isActiveRef.current = active;
        active ? collectElements() : deactivate();
      }
    };

    checkGlass();

    const classObserver = new MutationObserver(checkGlass);
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('scroll', onScroll, { passive: true });
    scrollYRef.current = window.scrollY;
    prevScrollYRef.current = scrollYRef.current;

    const collectInterval = setInterval(() => {
      if (isActiveRef.current) collectElements();
    }, 1500);

    const domObserver = new MutationObserver(() => {
      if (isActiveRef.current) {
        clearTimeout(domObserver._timer);
        domObserver._timer = setTimeout(collectElements, 200);
      }
    });
    domObserver.observe(document.body, { childList: true, subtree: true });

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      classObserver.disconnect();
      domObserver.disconnect();
      clearInterval(collectInterval);
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      deactivate();
    };
  }, []);

  return null;
}
