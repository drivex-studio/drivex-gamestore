import { usePageEnterContext } from './usePageEnterContext.js';

const idsByTrigger = new WeakMap();

function stableIdFor(onEnter) {
  let id = idsByTrigger.get(onEnter);
  if (!id) {
    id = crypto.randomUUID();
    idsByTrigger.set(onEnter, id);
  }
  return id;
}

export function usePageEnter(onEnter, options = {}) {
  const { priority = 0, skip = false } = options;
  const { register, unregister, phase, prefersReducedMotion } = usePageEnterContext();

  const id = stableIdFor(onEnter);

  if (!skip) {
    register(id, onEnter, priority);
  }

  return {
    phase,
    prefersReducedMotion,
    isEntering: phase === 'entering',
    isComplete: phase === 'complete',
    destroy() {
      unregister(id);
    },
  };
}
