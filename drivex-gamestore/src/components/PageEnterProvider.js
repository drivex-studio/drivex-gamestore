import { initPageEnterState } from '../lib/pageEnterState.js';

export function initPageEnterProvider(parentElement, props = {}, renderChildren) {
  const destroyState = initPageEnterState();
  if (typeof renderChildren === 'function') {
    renderChildren(parentElement, props);
  }
  return function destroyPageEnterProvider() {
    destroyState();
  };
}
