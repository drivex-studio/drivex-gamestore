import gsap from 'gsap';
import { 
  getPageTransitionState, 
  subscribePageTransition 
} from '../lib/pageTransitionState.js';

export function useIdleGSAP(callback, options = {}) {
  let isIdle = getPageTransitionState().phase === 'idle';
  const scope = options.scope ?? document;

  const gatedCallback = (context) => {
    if (isIdle) return callback(context);
  };

  let gsapContext = gsap.context(gatedCallback, scope);

  const unsubscribe = subscribePageTransition(({ phase }) => {
    const nextIsIdle = phase === 'idle';
    if (nextIsIdle !== isIdle) {
      isIdle = nextIsIdle;
      gsapContext.revert();
      gsapContext = gsap.context(gatedCallback, scope);
    }
  });

  return function destroyIdleGSAP() {
    unsubscribe();
    gsapContext.revert();
  };
}
