
import { scrollToTop } from './lenisState.js';

let scrollTriggerPromise = null;
function loadScrollTrigger() {
  return scrollTriggerPromise || (scrollTriggerPromise = import('gsap/ScrollTrigger'));
}
function clearScrollMemory() {
  loadScrollTrigger()?.then(({ ScrollTrigger }) => {
    ScrollTrigger.clearScrollMemory();
  });
}
function refreshScrollTrigger() {
  loadScrollTrigger()?.then(({ ScrollTrigger }) => {
    ScrollTrigger.refresh(true);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let phase = 'idle';
let isPending = false;
let timeoutId = null;
let pendingCallback = null;
let holdStartTime = 0;

const listeners = new Set();

function emit() {
  const value = getPageTransitionState();
  listeners.forEach((fn) => fn(value));
}

export function subscribePageTransition(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getPageTransitionState() {
  return { phase, startTransition, isPending };
}

function clearScheduledTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function handlePopState() {
  clearScheduledTimeout();
  if (prefersReducedMotion()) return;
  holdStartTime = 0;
  pendingCallback = null;
  phase = 'holding';
  emit();
  clearScrollMemory();
  timeoutId = window.setTimeout(() => {
    phase = 'exiting';
    emit();
    timeoutId = window.setTimeout(() => {
      phase = 'idle';
      emit();
      refreshScrollTrigger();
    }, 1200);
  }, 100);
}

export function startTransition(callback) {
  clearScheduledTimeout();
  pendingCallback = callback;
  if (prefersReducedMotion()) {
    callback();
    return;
  }
  phase = 'entering';
  emit();
  timeoutId = window.setTimeout(() => {
    holdStartTime = Date.now();
    phase = 'holding';
    emit();
    clearScrollMemory();
    scrollToTop();
    isPending = true;
    emit();
    pendingCallback?.();
    isPending = false;
    emit();
    syncHoldingPhaseEffect();
  }, 1300);
}

function syncHoldingPhaseEffect() {
  if (phase === 'holding' && !isPending && holdStartTime > 0) {
    const remaining = Math.max(0, 100 - (Date.now() - holdStartTime));
    timeoutId = window.setTimeout(() => {
      phase = 'exiting';
      holdStartTime = 0;
      emit();
      timeoutId = window.setTimeout(() => {
        phase = 'idle';
        emit();
        refreshScrollTrigger();
      }, 1200);
    }, remaining);
  }
}

let popstateHandler = null;

export function initPageTransitionState() {
  popstateHandler = () => handlePopState();
  window.addEventListener('popstate', popstateHandler);
}

export function destroyPageTransitionState() {
  if (popstateHandler) {
    window.removeEventListener('popstate', popstateHandler);
    popstateHandler = null;
  }
  clearScheduledTimeout();
}
