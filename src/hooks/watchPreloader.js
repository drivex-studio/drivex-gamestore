
let phase = "loading";
let isInitialLoad = true;
let transitionTimeout = null;
const listeners = new Set();

function notifyListeners() {
  const state = { phase, setPhase, isInitialLoad };
  listeners.forEach(callback => callback(state));
}

export function setPhase(newPhase) {
  phase = newPhase;
  notifyListeners();

  if (phase === "revealing") {
    if (transitionTimeout) clearTimeout(transitionTimeout);
    transitionTimeout = setTimeout(() => {
      phase = "hidden";
      isInitialLoad = false;
      notifyListeners();
    }, 200);
  }
}

export function watchPreloader(callback) {
  callback({ phase, setPhase, isInitialLoad });
  listeners.add(callback);
  return function destroy() {
    listeners.delete(callback);
  };
}

export function getPreloaderState() {
  return { phase, setPhase, isInitialLoad };
}

export function initPreloaderProvider(parentElement, props = {}) {
  
  function destroy() {
    if (transitionTimeout) clearTimeout(transitionTimeout);
    listeners.clear();
    phase = "loading";
    isInitialLoad = true;
  }
  
  return { el: parentElement, destroy };
}