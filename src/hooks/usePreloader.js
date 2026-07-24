import { getPreloaderState, setPhase } from '../lib/preloaderState.js';

export function usePreloader() {
  const state = getPreloaderState();
  return {
    phase: state.phase,
    setPhase,
    isInitialLoad: state.isInitialLoad,
  };
}
  