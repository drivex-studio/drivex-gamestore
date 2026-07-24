import { usePageEnterContext } from './usePageEnterContext.js';
import { subscribePageEnterState } from '../lib/pageEnterState.js';

export function usePageEnterClass(options = {}, onChange) {
  const { priority = 0, skip = false, hiddenClass, visibleClass } = options;

  const id = crypto.randomUUID(); 
  let isVisible = false;
  let delay = 0;

  function computeResult() {
    const { phase, prefersReducedMotion } = usePageEnterContext();
    const effectiveVisible = prefersReducedMotion || isVisible;
    return {
      className: effectiveVisible ? (visibleClass ?? 'opacity-100') : (hiddenClass ?? 'opacity-0'),
      isVisible: effectiveVisible,
      delay,
      style: prefersReducedMotion ? undefined : { transitionDelay: `${delay}s` },
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
        emit();
        setTimeout(() => {
          isVisible = true;
          emit();
        }, 1000 * d);
      },
      priority
    );
  }

  const unsubscribe = subscribePageEnterState(({ phase }) => {
    if (phase === 'waiting') {
      isVisible = false;
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
