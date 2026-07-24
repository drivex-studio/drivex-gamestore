import { gsap } from '../vendor.js';
import { ScrambleGroupContext } from './ScrambleGroupContext.js';
import { useIdleGSAP } from '../hooks/useIdleGSAP.js';

export function initScrambleGroup(parentElement, props) {
  const { children, stagger = 0.1, start = 'top 80%', markers = false, manual = false, className } = props;

  const registryMap = new Map(); 
  let hasTriggered = false; 
  let hasTriggeredInternalFlag = false; 
  let scrollTriggerRef = null; 

  function register(id, fn) {
    
    registryMap.set(id, fn);
  }
  function unregister(id) {
    
    registryMap.delete(id);
  }

  function triggerAll(overrideStagger) {
    
    if (hasTriggeredInternalFlag) return;
    hasTriggeredInternalFlag = true;
    const fns = Array.from(registryMap.values());
    const staggerValue = overrideStagger ?? stagger;
    fns.forEach((fn, index) => {
      gsap.delayedCall(index * staggerValue, () => fn());
    });
    hasTriggered = true;
    contextValue.hasTriggered = true;
    
  }

  const containerEl = document.createElement('div'); 
  containerEl.className = className || '';

  const contextValue = { register, unregister, triggerAll, hasTriggered }; 

  ScrambleGroupContext.Provider(containerEl, contextValue, children);

  parentElement.appendChild(containerEl);

  function setupScrollTrigger() {
    if (manual || !containerEl) return undefined;
    hasTriggeredInternalFlag = false;
    const tween = gsap.to(containerEl, {
      scrollTrigger: {
        trigger: containerEl,
        start,
        markers,
        toggleActions: 'play none none none',
      },
      onStart: () => triggerAll(),
      duration: 0.001,
    });
    scrollTriggerRef = tween.scrollTrigger ?? null;
    return () => {
      tween.kill();
      scrollTriggerRef?.kill();
    };
  }


  let idleGsapCleanup = null;
  let destroyed = false;
  const rafId = requestAnimationFrame(() => {
    if (destroyed) return;
    idleGsapCleanup = useIdleGSAP(setupScrollTrigger, {
      dependencies: [manual, start, markers, triggerAll],
    });
  });

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      if (typeof idleGsapCleanup === 'function') idleGsapCleanup();
      containerEl.remove();
    },
  };
}
