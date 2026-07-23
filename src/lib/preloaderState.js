
const listeners = new Set();

const state = {
  phase: 'loading', 
  isInitialLoad: true,
};

let hideTimeout = null;

function notify() {
  listeners.forEach((fn) => fn(state));
}

export function setPhase(nextPhase) {
  state.phase = nextPhase;

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (nextPhase === 'revealing') {
    hideTimeout = setTimeout(() => {
      state.phase = 'hidden';
      state.isInitialLoad = false;
      notify();
    }, 200);
  }

  notify();
}

export function subscribePreloaderState(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function getPreloaderState() {
  return state;
}

export function destroyPreloaderState() {
  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = null;
  listeners.clear();
}
