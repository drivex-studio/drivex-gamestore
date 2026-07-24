//src/context/PreloaderProvider.js


let isProviderMounted = false;
const preloaderState = {
  phase: 'loading',
  isInitialLoad: true,
};

const preloaderListeners = new Set();
let revealingTimeoutId = null;

function notifyPreloaderSubscribers() {
  const publicState = getPublicState();
  preloaderListeners.forEach(listener => listener(publicState));
}

function setPhase(newPhase) {
  if (preloaderState.phase === newPhase) return;
  
  if (revealingTimeoutId) {
    clearTimeout(revealingTimeoutId);
    revealingTimeoutId = null;
  }

  preloaderState.phase = newPhase;
  notifyPreloaderSubscribers();

  if (preloaderState.phase === 'revealing') {
    revealingTimeoutId = setTimeout(() => {
      preloaderState.isInitialLoad = false;
      setPhase('hidden');
    }, 200);
  }
}

function getPublicState() {
  if (!isProviderMounted) {
    return {
      phase: 'hidden',
      isInitialLoad: false,
      setPhase: () => {}
    };
  }
  
  return {
    phase: preloaderState.phase,
    isInitialLoad: preloaderState.isInitialLoad,
    setPhase
  };
}

export function subscribePreloader(callback) {
  if (typeof callback === 'function') {
    preloaderListeners.add(callback);
    callback(getPublicState());

    return () => {
      preloaderListeners.delete(callback);
    };
  }

  let current = getPublicState();
  const internalListener = (state) => { current = state; };
  preloaderListeners.add(internalListener);

  return {
    get phase() { return current.phase; },
    get isInitialLoad() { return current.isInitialLoad; },
    get setPhase() { return current.setPhase; },
    unsubscribe: () => preloaderListeners.delete(internalListener),
  };
}

export class PreloaderProvider {
  constructor(parentElement, props = {}) {
    const { children } = props;
    this.parentElement = parentElement;

    isProviderMounted = true;
    preloaderState.phase = 'loading';
    preloaderState.isInitialLoad = true;
    
    if (revealingTimeoutId) {
      clearTimeout(revealingTimeoutId);
      revealingTimeoutId = null;
    }


    notifyPreloaderSubscribers();

    if (children && this.parentElement) {
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (child instanceof Node) this.parentElement.appendChild(child);
        });
      } else if (children instanceof Node) {
        this.parentElement.appendChild(children);
      }
    }
  }

  destroy() {
    if (revealingTimeoutId) {
      clearTimeout(revealingTimeoutId);
      revealingTimeoutId = null;
    }
    isProviderMounted = false;
  }
}
