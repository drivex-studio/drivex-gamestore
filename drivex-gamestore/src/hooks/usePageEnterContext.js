import { getPageEnterState } from '../lib/pageEnterState.js';

export function usePageEnterContext() {
  return getPageEnterState();
}
