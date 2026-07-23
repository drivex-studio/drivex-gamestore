import gsap from 'gsap';
import { usePageEnterContext } from './usePageEnterContext.js';

export function usePageEnterGSAP(options = {}) {
  const { priority = 0, skip = false } = options;
  const { register, unregister, phase, prefersReducedMotion } = usePageEnterContext();

  const id = crypto.randomUUID(); 
  const elRef = { current: null }; 
  let timeline = null; 
  let createTimelineFn = null; 

  function createTimeline(fn) {
    createTimelineFn = fn;
  }

  function registerEntrance() {
    if (skip || !createTimelineFn) return function destroy() {};

    register(
      id,
      (delay) => {
        if (timeline) timeline.kill();
        if (prefersReducedMotion) return;
        timeline = gsap.timeline();
        createTimelineFn(timeline, delay);
      },
      priority
    );

    return function destroy() {
      unregister(id);
      if (timeline) timeline.kill();
    };
  }

  return {
    ref: elRef,
    createTimeline,
    register: registerEntrance,
    phase,
    prefersReducedMotion,
    isEntering: phase === 'entering',
    isComplete: phase === 'complete',
  };
}
