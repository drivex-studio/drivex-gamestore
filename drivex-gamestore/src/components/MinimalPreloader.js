
import { usePreloader } from '../hooks/usePreloader.js';
import { subscribePreloaderState } from '../lib/preloaderState.js';

export function initMinimalPreloader(parentElement) {
  let el = null;
  let loadingTimeout = null;

  function ensureMounted() {
    if (!el) {
      el = document.createElement('div');
      el.className =
        'pointer-events-none fixed inset-0 z-[10000] bg-background transition-opacity duration-300';
      parentElement.appendChild(el);
    }
  }

  function unmount() {
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = null;
  }

  function render() {
    const { phase, isInitialLoad, setPhase } = usePreloader();

    if (phase === 'loading' && loadingTimeout === null) {
      loadingTimeout = setTimeout(() => {
        loadingTimeout = null;
        setPhase('revealing');
      }, 300);
    } else if (phase !== 'loading' && loadingTimeout !== null) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }

    if (!isInitialLoad || phase === 'hidden') {
      unmount();
      return;
    }

    ensureMounted();
    el.style.opacity = phase === 'loading' ? '1' : '0';
  }

  const unsubscribe = subscribePreloaderState(render);

  return function destroyMinimalPreloader() {
    unsubscribe();
    if (loadingTimeout) clearTimeout(loadingTimeout);
    unmount();
  };
}
