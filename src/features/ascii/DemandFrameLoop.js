
export function initDemandFrameLoop({ frameloop, invalidate } = {}) {
  
  let _triggered = false;

  if (frameloop !== 'demand' || _triggered) {
    return { disposer: () => {} };
  }
  _triggered = true;

  let cancel;
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(() => invalidate());
    cancel = () => cancelIdleCallback(handle);
  } else {
    const handle = setTimeout(() => invalidate(), 0);
    cancel = () => clearTimeout(handle);
  }

  return {
    disposer: cancel
  };
}

export function destroyDemandFrameLoop(disposer) {
  if (typeof disposer === 'function') disposer();
}
