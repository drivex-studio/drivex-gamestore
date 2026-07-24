import gsap from 'gsap';
import { initScrambleText as ScrambleText } from '../utils/ScrambleText.js';
import { cx } from '../utils/cx.js';
import { usePreloader } from '../hooks/usePreloader.js';
import { subscribePreloaderState } from '../lib/preloaderState.js';

function computeClipPath(progressValue) {
  if (progressValue <= 0) return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  if (progressValue >= 1) return 'polygon(0% 100%, 0% 100%, 0% 100%)';
  if (progressValue <= 0.5) {
    return `polygon(0% 100%, ${2 * progressValue * 100}% 0%, 100% 0%, 100% 100%)`;
  }
  return `polygon(0% 100%, 100% ${(progressValue - 0.5) * 200}%, 100% 100%)`;
}

export function initPreloader(parentElement) {
  let reducedMotion = false;
  let onScrambleReady = null;
  let timeline = null;
  let runTimeoutId = null;
  let mediaQuery = null;

  const container = document.createElement('div');
  container.setAttribute('data-theme', 'brand');

  const digitsWrap = document.createElement('div');
  digitsWrap.className = 'relative overflow-x-clip overflow-y-visible';
  digitsWrap.style.width = '70px';
  digitsWrap.style.height = '16px';

  const digitEls = [0, 1, 2, 3].map(() => {
    const d = document.createElement('div');
    d.className = 'absolute top-0 left-0 bg-foreground';
    d.style.width = '16px';
    d.style.height = '16px';
    d.style.transform = 'translateX(-16px)';
    d.style.transformOrigin = 'bottom right';
    digitsWrap.appendChild(d);
    return d;
  });

  const scrambleWrap = document.createElement('div');
  scrambleWrap.className = 'overflow-hidden';

  const textWrap = document.createElement('div');
  textWrap.className = 'flex flex-col items-center gap-4';
  textWrap.appendChild(digitsWrap);
  textWrap.appendChild(scrambleWrap);

  container.appendChild(textWrap);

  const scrambleText = ScrambleText(scrambleWrap, {
    revealMode: true,
    duration: 1,
    onReady: (fn) => {
      onScrambleReady = fn;
    },
    children: 'LOADING',
  });

  function handleReducedMotionChange(e) {
    reducedMotion = e.matches;
  }

  function mountReducedMotionListener() {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener('change', handleReducedMotionChange);
  }

  const { isInitialLoad, phase, setPhase } = usePreloader();

  function runGsapEffect() {
    if (reducedMotion) {
      setPhase('complete');
      return;
    }

    const digits = digitEls.filter(Boolean);
    if (digits.length === 0) return;

    const run = () => {
      if (!onScrambleReady) {
        requestAnimationFrame(run);
        return;
      }
      timeline = gsap.timeline();
      onScrambleReady();
      digits.forEach((el, i) => {
        timeline.fromTo(
          el,
          { x: i === 0 ? -16 : (i - 1) * 18, rotate: 0 },
          { x: 18 * i - 16, rotate: 90, duration: 0.7, ease: 'expo.inOut', immediateRender: false },
          i === 0 ? 0 : '>-25%'
        );
      });

      const clipDuration = 2.2749999999999995;
      timeline.to(textWrap, { opacity: 0, duration: 0.4, ease: 'power3.out' }, clipDuration + 0.2);

      const progress = { value: 0 };
      const revealed = { value: false };
      timeline.to(
        progress,
        {
          value: 1,
          duration: 1.5,
          ease: 'expo.inOut',
          onUpdate: () => {
            container.style.clipPath = computeClipPath(progress.value);
            if (!revealed.value && progress.value >= 0.9) {
              revealed.value = true;
              setPhase('revealing');
            }
          },
        },
        clipDuration
      );
    };

    runTimeoutId = setTimeout(run, 100);
  }

  function updateVisibilityAndClasses(state) {
    const currentPhase = state.phase;
    const currentIsInitialLoad = state.isInitialLoad;

    if (!currentIsInitialLoad || currentPhase === 'hidden') {
      if (container.parentNode) container.parentNode.removeChild(container);
      return;
    }

    if (!container.parentNode) parentElement.appendChild(container);
    container.className = cx(
      'fixed inset-0 z-[10000] flex items-center justify-center bg-background',
      currentPhase === 'complete' && 'pointer-events-none'
    );
  }

  mountReducedMotionListener();

  if (isInitialLoad && phase === 'loading') {
    runGsapEffect();
  }

  const unsubscribe = subscribePreloaderState((state) => {
    updateVisibilityAndClasses(state);
  });

  return function destroyPreloader() {
    unsubscribe();
    if (mediaQuery) mediaQuery.removeEventListener('change', handleReducedMotionChange);
    if (runTimeoutId) clearTimeout(runTimeoutId);
    if (timeline) timeline.kill();
    if (container.parentNode) container.parentNode.removeChild(container);
  };
}
