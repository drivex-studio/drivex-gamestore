import { subscribePreloader } from '../context/PreloaderProvider.js';
import { usePageTransition } from '../hooks/usePageTransition.js';

const listeners = new Set();
const registry = new Map(); 

let phase = 'waiting'; 
let prefersReducedMotion = false;
let hasRun = false;
let entranceTimeoutId = null;
let completeTimeoutId = null;
let mediaQuery = null;
let preloaderPhase = 'loading';

function notify() {
  listeners.forEach((fn) => fn(getPageEnterState()));
}

function sortByPriority(a, b) {
  return a.priority - b.priority;
}

function setPhaseInternal(next) {
  phase = next;
  notify();
}

export function registerPageEnter(id, trigger, priority = 0) {
  registry.set(id, { id, trigger, priority });
}

export function unregisterPageEnter(id) {
  registry.delete(id);
}

function runEntrance() {
  if (hasRun) return;
  hasRun = true;
  setPhaseInternal('entering');

  const entries = Array.from(registry.values()).sort(sortByPriority);
  let maxPriority = -Infinity;
  let delay = 0;
  for (const entry of entries) {
    if (entry.priority > maxPriority) {
      maxPriority = entry.priority;
      if (delay > 0) delay += 0.08;
    }
    entry.trigger(delay);
  }

  completeTimeoutId = setTimeout(() => {
    setPhaseInternal('complete');
  }, 1000 * (delay + 1));
}

function handleReducedMotionChange(e) {
  prefersReducedMotion = e.matches;
  notify();
}

function mountReducedMotionListener() {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = mediaQuery.matches;
  mediaQuery.addEventListener('change', handleReducedMotionChange);
}

function evaluateEntranceTrigger() {
  if (entranceTimeoutId) {
    clearTimeout(entranceTimeoutId);
    entranceTimeoutId = null;
  }

  const { phase: pageTransitionPhase } = usePageTransition();
  const preloaderSettled = preloaderPhase === 'revealing' || preloaderPhase === 'hidden';

  if (
    (pageTransitionPhase === 'exiting' || pageTransitionPhase === 'idle') &&
    phase === 'waiting' &&
    preloaderSettled
  ) {
    entranceTimeoutId = setTimeout(runEntrance, 250);
  }
}

function evaluateReset() {
  const { phase: pageTransitionPhase } = usePageTransition();
  if (pageTransitionPhase === 'entering' || pageTransitionPhase === 'holding') {
    setPhaseInternal('waiting');
    hasRun = false;
  }
}

export function getPageEnterState() {
  return {
    phase,
    register: registerPageEnter,
    unregister: unregisterPageEnter,
    prefersReducedMotion,
  };
}

export function subscribePageEnterState(fn) {
  listeners.add(fn);
  fn(getPageEnterState());
  return () => listeners.delete(fn);
}

export function initPageEnterState() {
  mountReducedMotionListener();
  const unsubPreloader = subscribePreloader((state) => {
    preloaderPhase = state.phase;
    evaluateEntranceTrigger();
  });
  evaluateEntranceTrigger();
  evaluateReset();

  return function destroyPageEnterState() {
    unsubPreloader();
    if (mediaQuery) mediaQuery.removeEventListener('change', handleReducedMotionChange);
    if (entranceTimeoutId) clearTimeout(entranceTimeoutId);
    if (completeTimeoutId) clearTimeout(completeTimeoutId);
    listeners.clear();
    registry.clear();
  };
}
