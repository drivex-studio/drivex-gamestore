import { getPageTransitionState, subscribePageTransition } from '../lib/pageTransitionState.js';

export function initPageTransitionOverlay() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    return function destroyPageTransitionOverlay() {};
  }

  const el = document.createElement('div');
  el.className = 'page-transition-square';
  Object.assign(el.style, {
    position: 'fixed',
    width: '200vmax',
    height: '200vmax',
    bottom: '0',
    left: 'calc(-50vw - var(--square-extend-left))',
    backgroundColor: 'var(--color-brand)',
    zIndex: '9999',
    pointerEvents: 'none',
  });
  document.body.appendChild(el);

  let isMounted = true;
  let prevPhase = getPageTransitionState().phase;
  let scrollOffset = 0;

  function applyPhase(phase) {
    const wasIdle = prevPhase === 'idle';
    prevPhase = phase;
    el.dataset.phase = phase;
    if (phase === 'entering' && wasIdle) {
      scrollOffset = window.scrollY;
      document.body.style.setProperty('--page-scroll-offset', `${scrollOffset}px`);
    }
    document.body.dataset.transitionPhase = phase;
    if (phase === 'idle') {
      requestAnimationFrame(() => {
        if (isMounted && document.body.dataset.transitionPhase === 'idle') {
          document.body.style.removeProperty('--page-scroll-offset');
          scrollOffset = 0;
        }
      });
    }
  }

  applyPhase(prevPhase);
  const unsubscribe = subscribePageTransition(({ phase }) => applyPhase(phase));

  return function destroyPageTransitionOverlay() {
    isMounted = false;
    delete document.body.dataset.transitionPhase;
    document.body.style.removeProperty('--page-scroll-offset');
    unsubscribe();
    el.remove();
  };
}
