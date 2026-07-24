import { usePageEnterContext } from './usePageEnterContext.js';
import { subscribePageEnterState } from '../lib/pageEnterState.js';

export function usePageEnterMotion(options = {}, onChange) {
  const { priority = 0, skip = false, duration = 0.8 } = options;

  const id = crypto.randomUUID(); 
  let delay = 0;
  let hasTriggered = false;

  function computeResult() {
    const { phase, prefersReducedMotion } = usePageEnterContext();
    return {
      shouldAnimate: hasTriggered && !prefersReducedMotion,
      delay,
      duration,
      phase,
      prefersReducedMotion,
      isEntering: phase === 'entering',
      isComplete: phase === 'complete',
    };
  }

  function emit() {
    onChange?.(computeResult());
  }

  const { register, unregister } = usePageEnterContext();

  if (!skip) {
    register(
      id,
      (d) => {
        delay = d;
        hasTriggered = true;
        emit();
      },
      priority
    );
  }

  const unsubscribe = subscribePageEnterState(({ phase }) => {
    if (phase === 'waiting') {
      hasTriggered = false;
      delay = 0;
    }
    emit();
  });

  emit();

  return {
    getResult: computeResult,
    destroy() {
      unregister(id);
      unsubscribe();
    },
  };
}
