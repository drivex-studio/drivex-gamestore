import Lenis from 'lenis';

function easeOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const DEFAULT_OPTIONS = { anchors: { duration: 1.2, easing: easeOutCubic } };

let lenisInstance = null;
let cssScrollLocked = false;

export function initLenisProvider(options = {}) {
  const merged = { autoRaf: true, ...DEFAULT_OPTIONS, ...options };
  lenisInstance = new Lenis(merged);
  return function destroyLenisProvider() {
    lenisInstance?.destroy();
    lenisInstance = null;
  };
}

export function getLenis() {
  return lenisInstance;
}

export function setCssScrollLocked(locked) {
  if (locked === cssScrollLocked) return;
  cssScrollLocked = locked;
  document.documentElement.classList.toggle('scroll-locked', locked);
}

export function getCssScrollLocked() {
  return cssScrollLocked;
}

export function scrollToTop(immediate = true) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate });
  } else {
    window.scrollTo(0, 0);
  }
}
