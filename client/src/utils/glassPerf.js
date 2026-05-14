/**
 * 液态玻璃性能检测
 * 检测设备能力，决定是否启用 LiquidGlass 高级效果
 * 低端设备降级为普通 CSS 毛玻璃
 */

let _canRunLiquidGlass = undefined;

/**
 * 检测设备是否能流畅运行 LiquidGlass
 * LiquidGlass 使用 Canvas + SVG 滤镜，对 GPU 有一定要求
 */
export function canRunLiquidGlass() {
  if (_canRunLiquidGlass !== undefined) return _canRunLiquidGlass;

  // 调试阶段：跳过低端设备检测，强制启用
  _canRunLiquidGlass = true;
  return _canRunLiquidGlass;

  /*
  // 1. 基础检测：是否支持 backdrop-filter（Safari/Firefox 部分支持）
  const supportsBackdrop = CSS.supports('backdrop-filter', 'blur(1px)');

  // 2. 检测是否为低端设备
  const isLowEnd = detectLowEndDevice();

  // 3. 检测是否减少动画偏好
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 4. 检测是否为移动设备（LiquidGlass 在移动端性能较差）
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 768);

  // 决策：需要较好的设备才能启用
  _canRunLiquidGlass = supportsBackdrop && !isLowEnd && !prefersReducedMotion && !isMobile;

  return _canRunLiquidGlass;
  */
}

/**
 * 检测低端设备
 */
function detectLowEndDevice() {
  // navigator.deviceMemory: 设备内存 (GB)，仅 Chrome 支持
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;

  // navigator.hardwareConcurrency: CPU 核心数
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;

  // GPU 检测：通过 WebGL 获取渲染器信息
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // 已知低端 GPU 关键词
        const lowEndGPUs = ['intel', 'mesa', 'llvmpipe', 'swiftshader', 'software', 'mali-4', 'mali-t6', 'adreno 3', 'adreno 4', 'powervr sgx'];
        if (lowEndGPUs.some(gpu => renderer.toLowerCase().includes(gpu))) return true;
      }
    }
  } catch (e) {
    // WebGL 不可用，视为低端
    return true;
  }

  return false;
}

/**
 * 获取 LiquidGlass 推荐配置
 * 根据设备能力返回不同的效果参数
 */
export function getGlassConfig(preset = 'card') {
  if (!canRunLiquidGlass()) return null;

  const configs = {
    // 卡片：明显折射 + 色散
    card: {
      displacementScale: 60,
      blurAmount: 0.0625,
      saturation: 140,
      aberrationIntensity: 2,
      elasticity: 0.15,
      cornerRadius: 20,
      mode: 'standard',
    },
    // 面板：侧边栏/大面板
    panel: {
      displacementScale: 45,
      blurAmount: 0.08,
      saturation: 130,
      aberrationIntensity: 1.5,
      elasticity: 0.1,
      cornerRadius: 16,
      mode: 'standard',
    },
    // 按钮：高折射 + 高弹性
    button: {
      displacementScale: 70,
      blurAmount: 0.1,
      saturation: 150,
      aberrationIntensity: 3,
      elasticity: 0.35,
      cornerRadius: 100,
      mode: 'standard',
    },
    // 输入框：中等折射
    input: {
      displacementScale: 40,
      blurAmount: 0.05,
      saturation: 130,
      aberrationIntensity: 1.5,
      elasticity: 0.1,
      cornerRadius: 12,
      mode: 'standard',
    },
    // 导航栏：轻量
    nav: {
      displacementScale: 30,
      blurAmount: 0.04,
      saturation: 120,
      aberrationIntensity: 1,
      elasticity: 0.05,
      cornerRadius: 0,
      mode: 'standard',
    },
    // 弹窗：高对比
    modal: {
      displacementScale: 65,
      blurAmount: 0.08,
      saturation: 145,
      aberrationIntensity: 2.5,
      elasticity: 0.2,
      cornerRadius: 24,
      mode: 'standard',
    },
    // 排行项：中等
    rank: {
      displacementScale: 50,
      blurAmount: 0.06,
      saturation: 135,
      aberrationIntensity: 2,
      elasticity: 0.12,
      cornerRadius: 16,
      mode: 'standard',
    },
  };

  return configs[preset] || configs.card;
}
