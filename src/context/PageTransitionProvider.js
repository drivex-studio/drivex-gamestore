import { gsap, ScrollTrigger, scrollToTop, watchLenis } from '../vendor.js';

// -- Global Context State ----------------------------------------
const pageTransitionContext = {
  phase: "idle",
  isPending: false,
  startTransition: (cb) => cb(),
  listeners: new Set(),
  notify() {
    this.listeners.forEach((listener) => listener(this));
  }
};

export function subscribePageTransitionContext(callback) {
  pageTransitionContext.listeners.add(callback);
  callback(pageTransitionContext);
  return () => pageTransitionContext.listeners.delete(callback);
}


// ---- PageTransitionProvider ----
// NOTE: org Module ID: 215886
export class PageTransitionProvider {
  constructor(parentElement, props = {}) {
    const { className, ...restProps } = props;
    
    this.el = document.createElement('div');
    if (className) this.el.className = className;
    
    Object.entries(restProps).forEach(([k, v]) => {
      if (typeof v !== 'function') this.el.setAttribute(k, v);
    });

    this.timeoutId = null;
    this.holdStartTime = 0;
    this.pendingCallback = null;

    pageTransitionContext.startTransition = this.startTransition;

    window.addEventListener('popstate', this.handlePopState);

    if (parentElement) parentElement.appendChild(this.el);
  }

  isReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  clearTimeouts = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  setPhase = (phase) => {
    pageTransitionContext.phase = phase;
    pageTransitionContext.notify();
    this.checkHolding();
  }

  setIsPending = (isPending) => {
    pageTransitionContext.isPending = isPending;
    pageTransitionContext.notify();
    this.checkHolding();
  }

  handlePopState = () => {
    this.clearTimeouts();
    if (!this.isReducedMotion()) {
      this.holdStartTime = 0;
      this.pendingCallback = null;
      this.setPhase("holding");
      
      ScrollTrigger.clearScrollMemory();
      
      this.timeoutId = window.setTimeout(() => {
        this.setPhase("exiting");
        this.timeoutId = window.setTimeout(() => {
          this.setPhase("idle");
          ScrollTrigger.refresh(true);
        }, 1200);
      }, 100);
    }
  }

  startTransition = (callback) => {
    this.clearTimeouts();
    this.pendingCallback = callback;

    if (this.isReducedMotion()) {
      callback();
    } else {
      this.setPhase("entering");
      
      this.timeoutId = window.setTimeout(() => {
        this.holdStartTime = Date.now();
        this.setPhase("holding");
        
        ScrollTrigger.clearScrollMemory();
        scrollToTop();
        
        // Simulating React useTransition behavior
        this.setIsPending(true);
        if (this.pendingCallback) {
          this.pendingCallback();
        }
        this.setIsPending(false);

      }, 1300);
    }
  }

  checkHolding = () => {
    if (pageTransitionContext.phase === "holding" && !pageTransitionContext.isPending && this.holdStartTime > 0) {
      let delay = Math.max(0, 100 - (Date.now() - this.holdStartTime));
      
      this.timeoutId = window.setTimeout(() => {
        this.setPhase("exiting");
        this.holdStartTime = 0;
        
        this.timeoutId = window.setTimeout(() => {
          this.setPhase("idle");
          ScrollTrigger.refresh(true);
        }, 1200);
      }, delay);
    }
  }

  destroy() {
    window.removeEventListener('popstate', this.handlePopState);
    this.clearTimeouts();
    this.el.remove();
  }
}


// ---- PageTransitionRectangles ----
export class PageTransitionRectangles {
  constructor(parentElement, props = {}) {
    this.el = document.createElement('div');
    
    // Base portal styles
    Object.assign(this.el.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "2px",
      zIndex: "10001",
      pointerEvents: "none",
      visibility: "hidden"
    });

    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      display: "flex",
      gap: "2px",
      overflow: "hidden"
    });

    this.rectangles = [];
    const keys = ["r0", "r1", "r2", "r3"];
    
    keys.forEach(() => {
      let rect = document.createElement('div');
      this.rectangles.push(rect);
      this.container.appendChild(rect);
    });

    this.el.appendChild(this.container);
    
    // Acting as createPortal to document.body
    document.body.appendChild(this.el);

    this.isMounted = true;
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.unsubscribe = subscribePageTransitionContext(this.handleTransitionUpdate);
  }

  handleTransitionUpdate = (context) => {
    if (!this.isMounted || this.isReducedMotion) return;

    const phase = context.phase;
    const isVisible = phase !== "idle";
    
    this.el.style.visibility = isVisible ? "visible" : "hidden";

    this.rectangles.forEach((rect, index) => {
      let delay = phase === "entering" ? 650 + 60 * index : phase === "exiting" ? 60 * index : 0;
      let transform = phase === "entering" || phase === "holding" ? "translateY(0%)" : phase === "exiting" ? "translateY(-110%)" : "translateY(110%)";
      let isTransitioning = phase === "entering" || phase === "exiting";

      Object.assign(rect.style, {
        width: "16px",
        height: "16px",
        backgroundColor: "#141314",
        transform: transform,
        transitionProperty: "transform",
        transitionDuration: isTransitioning ? "350ms" : "0ms",
        transitionTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        transitionDelay: isTransitioning ? `${delay}ms` : "0ms",
        willChange: isTransitioning ? "transform" : ""
      });
    });
  }

  destroy() {
    this.isMounted = false;
    this.unsubscribe();
    this.el.remove();
  }
}


// ---- PageTransitionOverlay ----
// NOTE: org Module ID: 563657
export class PageTransitionOverlay {
  constructor(parentElement, props = {}) {
    this.el = document.createElement('div');
    this.el.className = "page-transition-square";
    
    Object.assign(this.el.style, {
      position: "fixed",
      width: "200vmax",
      height: "200vmax",
      bottom: "0",
      left: "calc(-50vw - var(--square-extend-left))",
      backgroundColor: "var(--color-brand)",
      zIndex: "9999",
      pointerEvents: "none"
    });

    document.body.appendChild(this.el);

    this.isMounted = true;
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.scrollOffset = 0;
    this.prevPhase = pageTransitionContext.phase;

    this.unsubscribe = subscribePageTransitionContext(this.handleTransitionUpdate);
  }

  handleTransitionUpdate = (context) => {
    if (!this.isMounted || this.isReducedMotion) {
      this.el.style.display = 'none';
      return;
    } else {
      this.el.style.display = '';
    }

    const currentPhase = context.phase;
    const lastPhase = this.prevPhase;
    this.prevPhase = currentPhase;

    this.el.setAttribute("data-phase", currentPhase);

    if (currentPhase === "entering" && lastPhase === "idle") {
      this.scrollOffset = window.scrollY;
      document.body.style.setProperty("--page-scroll-offset", `${this.scrollOffset}px`);
    }

    document.body.dataset.transitionPhase = currentPhase;

    if (currentPhase === "idle") {
      requestAnimationFrame(() => {
        if (this.isMounted && document.body.dataset.transitionPhase === "idle") {
          document.body.style.removeProperty("--page-scroll-offset");
          this.scrollOffset = 0;
        }
      });
    }
  }

  destroy() {
    this.isMounted = false;
    this.unsubscribe();
    delete document.body.dataset.transitionPhase;
    document.body.style.removeProperty("--page-scroll-offset");
    this.el.remove();
  }
}


// ---- subscribePageTransition ----
export function subscribePageTransition() {
  return {
    startTransition: pageTransitionContext.startTransition,
    isTransitioning: pageTransitionContext.phase !== "idle",
    phase: pageTransitionContext.phase,
    isPending: pageTransitionContext.isPending,
    subscribe: subscribePageTransitionContext
  };
}


// ---- SyncBodyTheme ----
// NOTE: org Module ID: 141565
export class SyncBodyTheme {
  constructor() {
    this.sync = () => {
      let target = document.querySelector("[data-page-builder-section][data-theme]");
      if (target) {
        let theme = target.getAttribute("data-theme");
        if (theme) {
          document.body.setAttribute("data-theme", theme);
        }
      }
    };
    
    this.sync();
    
    this.observer = new MutationObserver(() => {
      this.sync();
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  destroy() {
    this.observer.disconnect();
  }
}


// ---- subscribeIdleGSAP ----
export function subscribeIdleGSAP(callback, config = {}) {
  let ctx = gsap.context(() => {});
  let isIdleActive = false;

  const checkState = (context) => {
    let isIdle = context.phase === 'idle';
    
    if (isIdle && !isIdleActive) {
      isIdleActive = true;
      ctx.add(callback);
    } else if (!isIdle && isIdleActive) {
      isIdleActive = false;
      ctx.revert();
    }
  };

  let unsubscribe = subscribePageTransitionContext(checkState);

  return {
    destroy: () => {
      unsubscribe();
      ctx.revert();
    }
  };
}


// ---- PageTransitionScrollLock ----
export class PageTransitionScrollLock {
  constructor() {
    this.lenis = null;

    this.unwatchLenis = watchLenis((lenis) => {
      this.lenis = lenis;
    });

    this.unsubscribe = subscribePageTransitionContext((context) => {
      if (!this.lenis) return;

      const phase = context.phase;
      if (phase === "entering" || phase === "holding" || phase === "exiting") {
        this.lenis.stop();
      } else if (phase === "idle") {
        this.lenis.start();
      }
    });
  }

  destroy() {
    this.unsubscribe();
    this.unwatchLenis();  
  }
}
