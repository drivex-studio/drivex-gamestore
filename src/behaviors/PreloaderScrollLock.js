import { usePreloader } from '../hooks/usePreloader.js';
import { subscribePreloaderState } from '../lib/preloaderState.js';

import { getLenis, getCssScrollLocked, setCssScrollLocked } from '../lib/lenisState.js';

function runOnMount() {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  setCssScrollLocked(true);
}

export function initPreloaderScrollLock() {
  runOnMount();

  function render() {
    const { phase, isInitialLoad } = usePreloader();
    const shouldLock = isInitialLoad && phase !== 'hidden';
    const lenis = getLenis();
    if (shouldLock) {
      if (!getCssScrollLocked()) setCssScrollLocked(true);
      lenis?.stop();
    } else if (phase === 'hidden') {
      setCssScrollLocked(false);
      lenis?.start();
    }
  }

  const unsubscribe = subscribePreloaderState(render);

  return function destroyPreloaderScrollLock() {
    unsubscribe();
  };
}
