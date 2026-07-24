
import { gsap, ScrollTrigger }from '../../vendor.js';

import { createImageElement } from '../../media/shared/imageElement.js'; 
import { ASCII_GSAP_DURATION, ASCII_EASE, ASCII_COLOR_DELAY } from '../../config/asciiConfig.js'; 
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice.js'; 
import { useMousePosition } from '../../hooks/useMousePosition.js'; 
import { usePageEnter } from '../../hooks/usePageEnter.js'; 

function renderFallbackImage(imageSrc) {
  const wrapEl = document.createElement('div');
  wrapEl.className = 'absolute inset-0 flex animate-fade-in items-center justify-center';
  const img = createImageElement({ src: imageSrc, priority: true, alt: '', className: 'h-full object-contain' });
  if (img) wrapEl.appendChild(img);
  return wrapEl;
}

export function initHeroAsciiArt({
  imageSrc,
  mobileImageSrc,
  depthMapSrc,
  parallaxIntensity = 0.02,
  cellSize = 20,
  color,
  colorDark,
  revealOriginX,
  revealOriginY,
} = {}) {
  const isTouchDevice = useIsTouchDevice();
  let hasMounted = false; 
  let prefersReducedMotion = false; 
  const containerEl = document.createElement('div'); 
  let revealProgress = 0; 
  let colorProgress = 0; 
  const progressState = { progress: 0, colorProgress: 0 }; 
  let AsciiTypewriterModule = null; 

  const rootEl = document.createElement('div');
  rootEl.className = 'contents'; 

  const cleanupFns = [];
  let mousePositionHandle = null;

  function resolveImageSrc() {
    return isTouchDevice ? (mobileImageSrc ?? imageSrc) : imageSrc;
  }

  function render() {
    rootEl.innerHTML = '';
    mousePositionHandle?.destroy?.();
    mousePositionHandle = null;

    const isActive = hasMounted && !prefersReducedMotion; 

    if (hasMounted && prefersReducedMotion) {
      rootEl.appendChild(renderFallbackImage(resolveImageSrc()));
      return;
    }

    if (isActive && AsciiTypewriterModule) {
      const wrapEl = document.createElement('div');
      wrapEl.className = 'absolute inset-0';
      rootEl.appendChild(wrapEl);

      mousePositionHandle = useMousePosition({
        enabled: isActive && !isTouchDevice,
        containerRef: { current: wrapEl },
      });
      const { mouseX, mouseY, isHovering } = mousePositionHandle;

      const asciiProps = {
        imageSrc: resolveImageSrc(),
        cellSize,
        color,
        colorDark,
        className: 'size-full',
        alignX: 'center',
        alignY: 'bottom',
        fit: 'contain',
        mobileFit: 'contain',
        revealEnd: 1,
        randomness: 0.6,
        mouseX: isTouchDevice ? undefined : mouseX,
        mouseY: isTouchDevice ? undefined : mouseY,
        enableGooeyReveal: !isTouchDevice,
        isHovering: !isTouchDevice && isHovering,
        gooeyRadius: 0.035,
        gooeySoftness: 0.04,
        gooeyNoiseIntensity: 0.02,
        enableDepthParallax: !isTouchDevice && !!depthMapSrc,
        depthMapSrc: isTouchDevice ? undefined : depthMapSrc,
        parallaxIntensity,
        externalProgress: revealProgress,
        externalColorProgress: colorProgress,
        disableInternalAnimation: true,
        ...(revealOriginX != null && revealOriginY != null
          ? { revealOrigin: { x: revealOriginX, y: revealOriginY } }
          : {}),
      };
      const asciiInstance = AsciiTypewriterModule.AsciiTypewriter(wrapEl, asciiProps);
      if (asciiInstance?.destroy) cleanupFns.push(asciiInstance.destroy);
    }
    
  }

  function updateAsciiTypewriterLoad() {
    const isActive = hasMounted && !prefersReducedMotion;
    if (isActive && !AsciiTypewriterModule) {
      
      import('./utils/AsciiTypewriter.js')
        .then((mod) => {
          AsciiTypewriterModule = mod;
          render();
        })
        .catch(() => {
          
        });
    }
  }

  function reveal(delay = 0) {
    if (prefersReducedMotion) {
      revealProgress = 1;
      colorProgress = 1;
      render();
      return;
    }
    gsap.to(progressState, {
      progress: 1,
      duration: ASCII_GSAP_DURATION,
      delay,
      ease: ASCII_EASE,
      onUpdate: () => {
        revealProgress = progressState.progress;
      },
    });
    gsap.to(progressState, {
      colorProgress: 1,
      duration: ASCII_GSAP_DURATION,
      delay: delay + ASCII_COLOR_DELAY,
      ease: ASCII_EASE,
      onUpdate: () => {
        colorProgress = progressState.colorProgress;
      },
    });
  }

  usePageEnter(reveal, { priority: 0 });

  hasMounted = true;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reducedMotionQuery.matches;
  const handleReducedMotionChange = (e) => {
    prefersReducedMotion = e.matches;
    render();
  };
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  cleanupFns.push(() => reducedMotionQuery.removeEventListener('change', handleReducedMotionChange));

  updateAsciiTypewriterLoad();
  render();

  function destroy() {
    for (const fn of cleanupFns) fn();
    mousePositionHandle?.destroy?.();
  }

  return { element: rootEl, reveal, destroy };
}
