import {
  getPageTransitionState,
  subscribePageTransition,
  startTransition,
} from '../lib/pageTransitionState.js';

export function usePageTransition() {
  const { phase, isPending } = getPageTransitionState();
  return { startTransition, isTransitioning: phase !== 'idle', phase, isPending };
}

export { startTransition, subscribePageTransition };
