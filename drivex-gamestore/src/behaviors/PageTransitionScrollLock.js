import { getLenis } from '../lib/lenisState.js';
import { getPageTransitionState, subscribePageTransition } from '../lib/pageTransitionState.js';

export function initPageTransitionScrollLock() {
  function applyPhase(phase) {
    const lenis = getLenis();
    if (!lenis) return;
    if (phase === 'entering' || phase === 'holding' || phase === 'exiting') {
      lenis.stop();
    } else if (phase === 'idle') {
      lenis.start();
    }
  }

  applyPhase(getPageTransitionState().phase);
  const unsubscribe = subscribePageTransition(({ phase }) => applyPhase(phase));

  return function destroyPageTransitionScrollLock() {
    unsubscribe();
  };
}
