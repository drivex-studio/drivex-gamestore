

// -- External Hooks ---------------------------------------------
import { subscribePageTransition } from './PageTransitionProvider.js'; // NOTE: org Module ID: 57054
import { subscribePreloader } from '../hooks/usePreloader.js'; // NOTE: org Module ID: 278914

// -- Third-Party Libraries --------------------------------------
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// -- Global Context Polyfill ------------------------------------
export const defaultPageEnterContext = { //[span_0](start_span)[span_0](end_span)
  phase: "complete",
  register: () => {},
  unregister: () => {},
  prefersReducedMotion: false
};

export function subscribePageEnterContext() { //[span_1](start_span)[span_1](end_span)
  return window.__PAGE_ENTER_CONTEXT__ || defaultPageEnterContext;
}

// ---- PageEnterProvider ----
export class PageEnterProvider { //[span_2](start_span)[span_2](end_span)
  constructor(parentElement, props = {}) {
    // -- Props (destructured from source call site) --
    const { className, children, ...restProps } = props;

    // -- Hook-derived state (originally usePageTransition / usePreloader / useState) --
    this.pageTransition = subscribePageTransition(); // originally: usePageTransition()
    this.preloader = subscribePreloader();           // originally: usePreloader()
    
    this.phase = "waiting";                          // originally: const [phase, setPhase] = useState("waiting")
    this.prefersReducedMotion = false;               // originally: const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    // -- Refs (originally useRef — kept as { current } objects, never bare values) --
    this.subscribersRef = { current: new Map() };    // originally: useRef(new Map())
    this.isTriggeringRef = { current: false };       // originally: useRef(false)

    // -- Child instances (for teardown) --
    this.childInstances = [];
    if (this.pageTransition) this.childInstances.push(this.pageTransition);
    if (this.preloader) this.childInstances.push(this.preloader);

    // -- Context Initialization --
    this.contextValue = {
      phase: this.phase,
      register: this.register,
      unregister: this.unregister,
      prefersReducedMotion: this.prefersReducedMotion
    };
    window.__PAGE_ENTER_CONTEXT__ = this.contextValue;

    // -- DOM root setup (verbatim Tailwind classes from source) --
    this.el = document.createElement('div');
    this.el.className = className ? `${className}`.trim() : '';

    Object.entries(restProps).forEach(([k, v]) => {
      if (typeof v !== 'function') this.el.setAttribute(k, v);
    });

    // -- Behavioral event wiring & Effects --
    this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = this.mediaQuery.matches;
    this.updateContext();
    this.mediaQuery.addEventListener("change", this.handleMediaChange);

    // Initial check for coordination phases 
    this.checkPhases();
    this.checkReset();

    if (parentElement) parentElement.appendChild(this.el);
  }

  // Bound as a class field (arrow function) so the same reference can be removed later
  handleMediaChange = (e) => { //[span_3](start_span)[span_3](end_span)
    this.prefersReducedMotion = e.matches;
    this.updateContext();
  };

  register = (id, trigger, priority = 0) => { //[span_4](start_span)[span_4](end_span)
    this.subscribersRef.current.set(id, { id, trigger, priority });
  };

  unregister = (id) => { //[span_5](start_span)[span_5](end_span)
    this.subscribersRef.current.delete(id);
  };

  triggerEnter = () => { //[span_6](start_span)[span_6](end_span)
    if (this.isTriggeringRef.current) return;
    this.isTriggeringRef.current = true;
    this.setPhase("entering");

    const entries = Array.from(this.subscribersRef.current.values());
    entries.sort((a, b) => a.priority - b.priority);

    let currentPriority = -Infinity;
    let delayFactor = 0;

    for (let entry of entries) {
      if (entry.priority > currentPriority) {
        currentPriority = entry.priority;
        if (delayFactor > 0) delayFactor += 0.08;
      }
      entry.trigger(delayFactor);
    }

    this.completeTimeout = setTimeout(() => { //[span_7](start_span)[span_7](end_span)
      this.setPhase("complete");
    }, 1000 * (delayFactor + 1));
  };

  setPhase = (newPhase) => { //[span_8](start_span)[span_8](end_span)
    this.phase = newPhase;
    this.updateContext();
  };

  updateContext = () => { //[span_9](start_span)[span_9](end_span)
    this.contextValue.phase = this.phase;
    this.contextValue.prefersReducedMotion = this.prefersReducedMotion;
  };

  checkPhases = () => { //[span_10](start_span)[span_10](end_span)
    const ptPhase = this.pageTransition?.phase;
    const plPhase = this.preloader?.phase;
    const isPreloaderReady = plPhase === "revealing" || plPhase === "hidden";

    if ((ptPhase === "exiting" || ptPhase === "idle") && this.phase === "waiting" && isPreloaderReady) {
      this.startTimeout = setTimeout(() => {
        this.triggerEnter();
      }, 250);
    }
  };

  checkReset = () => { //[span_11](start_span)[span_11](end_span)
    const ptPhase = this.pageTransition?.phase;
    if (ptPhase === "entering" || ptPhase === "holding") {
      this.setPhase("waiting");
      this.isTriggeringRef.current = false;
    }
  };

  // -- Teardown --
  destroy() { //[span_12](start_span)[span_12](end_span)
    this.mediaQuery.removeEventListener("change", this.handleMediaChange);
    clearTimeout(this.startTimeout);
    clearTimeout(this.completeTimeout);
    
    if (window.__PAGE_ENTER_CONTEXT__ === this.contextValue) {
      delete window.__PAGE_ENTER_CONTEXT__;
    }
    
    this.childInstances.forEach(inst => inst?.destroy?.());
    this.el.remove();
  }
}

// ---- SubscribePageEnter ----
export class SubscribePageEnter { //[span_13](start_span)[span_13](end_span)
  constructor(triggerCallback, options = {}) {
    // -- Props (destructured from source call site) --
    const { priority = 0, skip = false } = options;
    this.triggerCallback = triggerCallback;            // callback function passed in from component

    // -- Context / Runtime State --
    this.context = subscribePageEnterContext();        // originally: usePageEnterContext()
    this.phase = this.context.phase;                   
    this.prefersReducedMotion = this.context.prefersReducedMotion;
    this.isEntering = this.phase === "entering";
    this.isComplete = this.phase === "complete";

    // -- Refs (originally useRef — kept as { current } objects, never bare values) --
    this.idRef = { current: crypto.randomUUID() };     // originally: useRef(crypto.randomUUID())

    // -- Registration Wiring --
    if (!skip) {
      this.context.register(this.idRef.current, this.triggerCallback, priority);
    }
  }

  // -- Teardown --
  destroy() { //[span_14](start_span)[span_14](end_span)
    this.context.unregister(this.idRef.current);
  }
}

// ---- SubscribePageEnterClass ----
export class SubscribePageEnterClass { //[span_15](start_span)[span_15](end_span)
  constructor(options = {}) {
    // -- Props (destructured from source call site) --
    this.options = options;
    const { priority = 0, skip = false } = options;

    // -- Context / Runtime State --
    this.context = subscribePageEnterContext();        // originally: usePageEnterContext()

    // -- Hook-derived state (originally useState) --
    this.isVisible = false;                            // originally: const [isVisible, setVisible] = useState(false)
    this.delay = 0;                                    // originally: const [delay, setDelay] = useState(0)

    // -- Refs (originally useRef — kept as { current } objects, never bare values) --
    this.idRef = { current: crypto.randomUUID() };     // originally: useRef(crypto.randomUUID())

    this.updateDerivedState();

    // -- Registration Wiring --
    if (!skip) {
      this.context.register(this.idRef.current, this.handleTrigger, priority);
    }

    if (this.context.phase === "waiting") {
      this.isVisible = false;
      this.delay = 0;
      this.updateDerivedState();
    }
  }

  handleTrigger = (delay) => { //[span_16](start_span)[span_16](end_span)
    this.delay = delay;
    this.updateDerivedState();

    this.timeoutId = setTimeout(() => {
      this.isVisible = true;
      this.updateDerivedState();
    }, delay * 1000);
  };

  updateDerivedState = () => { //[span_17](start_span)[span_17](end_span)
    const { hiddenClass = "opacity-0", visibleClass = "opacity-100" } = this.options;
    
    this.phase = this.context.phase;
    this.prefersReducedMotion = this.context.prefersReducedMotion;

    this.isActuallyVisible = this.prefersReducedMotion || this.isVisible;
    this.className = this.isActuallyVisible ? visibleClass : hiddenClass;
    this.style = this.prefersReducedMotion ? undefined : { transitionDelay: `${this.delay}s` };
    this.isEntering = this.phase === "entering";
    this.isComplete = this.phase === "complete";
  };

  // -- Teardown --
  destroy() { //[span_18](start_span)[span_18](end_span)
    clearTimeout(this.timeoutId);
    this.context.unregister(this.idRef.current);
  }
}

// ---- SubscribePageEnterGSAP ----
export class SubscribePageEnterGSAP { //[span_19](start_span)[span_19](end_span)
  constructor(options = {}) {
    // -- Props (destructured from source call site) --
    const { priority = 0, skip = false } = options;
    this.skip = skip;
    this.priority = priority;

    // -- Context / Runtime State --
    this.context = subscribePageEnterContext();        // originally: usePageEnterContext()

    // -- Refs (originally useRef — kept as { current } objects, never bare values) --
    this.ref = { current: null };                      // originally: useRef(null) -> dom target
    this.timelineRef = { current: null };              // originally: useRef(null) -> gsap timeline
    this.idRef = { current: crypto.randomUUID() };     // originally: useRef(crypto.randomUUID())
    this.createFnRef = { current: null };              // originally: useRef(null) -> timeline factory

    this.updateDerivedState();
    this.register();
  }

  createTimeline = (fn) => { //[span_20](start_span)[span_20](end_span)
    this.createFnRef.current = fn;
    this.register();
  };

  register = () => { //[span_21](start_span)[span_21](end_span)
    if (this.skip || !this.createFnRef.current) return;
    this.context.register(this.idRef.current, this.handleTrigger, this.priority);
  };

  handleTrigger = (delay) => { //[span_22](start_span)[span_22](end_span)
    if (this.timelineRef.current) {
      this.timelineRef.current.kill();
    }
    if (this.context.prefersReducedMotion) return;

    const tl = gsap.timeline();
    this.createFnRef.current(tl, delay);
    this.timelineRef.current = tl;
  };

  updateDerivedState = () => { //[span_23](start_span)[span_23](end_span)
    this.phase = this.context.phase;
    this.prefersReducedMotion = this.context.prefersReducedMotion;
    this.isEntering = this.phase === "entering";
    this.isComplete = this.phase === "complete";
  };

  // -- Teardown --
  destroy() { //[span_24](start_span)[span_24](end_span)
    this.context.unregister(this.idRef.current);
    if (this.timelineRef.current) {
      this.timelineRef.current.kill();
    }
  }
}

// ---- SubscribePageEnterMotion ----
export class SubscribePageEnterMotion { //[span_25](start_span)[span_25](end_span)
  constructor(options = {}) {
    // -- Props (destructured from source call site) --
    this.options = options;
    const { priority = 0, skip = false, duration = 0.8 } = options;
    this.duration = duration;

    // -- Context / Runtime State --
    this.context = subscribePageEnterContext();        // originally: usePageEnterContext()

    // -- Hook-derived state (originally useState) --
    this.delay = 0;                                    // originally: const [delay, setDelay] = useState(0)
    this.isTriggered = false;                          // originally: const [isTriggered, setTriggered] = useState(false)

    // -- Refs (originally useRef — kept as { current } objects, never bare values) --
    this.idRef = { current: crypto.randomUUID() };     // originally: useRef(crypto.randomUUID())

    this.updateDerivedState();

    // -- Registration Wiring --
    if (!skip) {
      this.context.register(this.idRef.current, this.handleTrigger, priority);
    }

    if (this.context.phase === "waiting") {
      this.isTriggered = false;
      this.delay = 0;
      this.updateDerivedState();
    }
  }

  handleTrigger = (delay) => { //[span_26](start_span)[span_26](end_span)
    this.delay = delay;
    this.isTriggered = true;
    this.updateDerivedState();
  };

  updateDerivedState = () => { //[span_27](start_span)[span_27](end_span)
    this.phase = this.context.phase;
    this.prefersReducedMotion = this.context.prefersReducedMotion;

    this.shouldAnimate = this.isTriggered && !this.prefersReducedMotion;
    this.isEntering = this.phase === "entering";
    this.isComplete = this.phase === "complete";
  };

  // -- Teardown --
  destroy() { //[span_28](start_span)[span_28](end_span)
    this.context.unregister(this.idRef.current);
  }
}
