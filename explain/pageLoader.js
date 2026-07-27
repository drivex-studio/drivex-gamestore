// ==FILE: js/components/Preloader.js==
'use strict';

import { cx } from '../utils/cx.js'; // NOTE: org Module ID: 801335
import { ScrambleText } from './ScrambleText.js'; // NOTE: org Module ID: 213332
import { subscribePreloader } from '../hooks/subscribePreloader.js'; // NOTE: org Module ID: 278914
import gsap from 'gsap'; // NOTE: org Module ID: 989970

export class Preloader {
  constructor(parentElement, props = {}) {
    // -- Props --
    this.parentElement = parentElement;

    // -- Hook-derived state --
    this.preloader = subscribePreloader(); 
    this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)"); // drives prefersReducedMotion state
    this.prefersReducedMotion = this.mediaQuery.matches; // originally: const [P, M] = useState(!1)

    // -- Refs --
    this.containerRef = { current: null }; // originally: _ = useRef(null)
    this.innerWrapperRef = { current: null }; // originally: j = useRef(null)
    this.boxesContainerRef = { current: null }; // originally: k = useRef(null)
    this.boxRefs = { current: [] }; // originally: E = useRef([])
    this.onScrambleReadyRef = { current: null }; // originally: S = useRef(null)
    this.timelineRef = { current: null }; // originally: I = useRef(null)

    // -- Animation/runtime state --
    this.childInstances = []; // tracks child components for teardown
    this.gsapCtx = null; 
    this.timeoutId = null; // tracks original setTimeout
    this.rafId = null; // tracks requestAnimationFrame for ScrambleText readiness

    if (!this.preloader.isInitialLoad || this.preloader.phase === 'hidden') {
      return;
    }

    // -- DOM root setup --
    this.el = document.createElement('div');
    this.containerRef.current = this.el;
    this.el.setAttribute('data-theme', 'brand');
    this.updateContainerClass();

    this.innerWrapperRef.current = document.createElement('div');
    this.innerWrapperRef.current.className = "flex flex-col items-center gap-4";

    this.boxesContainerRef.current = document.createElement('div');
    this.boxesContainerRef.current.className = "relative overflow-x-clip overflow-y-visible";
    this.boxesContainerRef.current.style.width = "70px";
    this.boxesContainerRef.current.style.height = "16px";

    for (let i = 0; i < 4; i++) {
      const box = document.createElement('div');
      box.className = "absolute top-0 left-0 bg-foreground";
      box.style.width = "16px";
      box.style.height = "16px";
      box.style.transform = "translateX(-16px)";
      box.style.transformOrigin = "bottom right";
      this.boxRefs.current.push(box);
      this.boxesContainerRef.current.appendChild(box);
    }

    const scrambleContainer = document.createElement('div');
    scrambleContainer.className = "overflow-hidden";
    const scramble = new ScrambleText(scrambleContainer, {
      revealMode: true,
      duration: 1,
      children: "LOADING",
      onReady: this.handleScrambleReady
    });
    this.childInstances.push(scramble);

    this.innerWrapperRef.current.appendChild(this.boxesContainerRef.current);
    this.innerWrapperRef.current.appendChild(scrambleContainer);
    this.el.appendChild(this.innerWrapperRef.current);

    if (this.parentElement) this.parentElement.appendChild(this.el);
    this.mediaQuery.addEventListener("change", this.handleMotionChange);
    this.runAnimation();
  }

  updateContainerClass = () => {
    const pointerEventsNone = this.preloader.phase === 'complete' && 'pointer-events-none';
    this.el.className = cx("fixed inset-0 z-[10000] flex items-center justify-center bg-background", pointerEventsNone);
  };

  handleMotionChange = (e) => {
    this.prefersReducedMotion = e.matches;
    this.runAnimation();
  };

  handleScrambleReady = (readyCallback) => {
    this.onScrambleReadyRef.current = readyCallback;
  };

  runAnimation = () => {
    if (!this.preloader.isInitialLoad || this.preloader.phase !== 'loading') return;
    
    if (this.prefersReducedMotion) {
      this.preloader.setPhase("complete");
      this.updateContainerClass(); 
      return;
    }

    const boxes = this.boxRefs.current.filter(Boolean);
    if (boxes.length === 0) return;

    if (this.gsapCtx) this.gsapCtx.revert();

    this.gsapCtx = gsap.context(() => {
      const checkReady = () => {
        if (!this.onScrambleReadyRef.current) {
          this.rafId = requestAnimationFrame(checkReady);
          return;
        }

        this.timelineRef.current = gsap.timeline();
        this.onScrambleReadyRef.current();

        boxes.forEach((box, i) => {
          this.timelineRef.current?.fromTo(
            box,
            { x: i === 0 ? -16 : (i - 1) * 18, rotate: 0 },
            { x: 18 * i - 16, rotate: 90, duration: 0.7, ease: "expo.inOut", immediateRender: false },
            i === 0 ? 0 : ">-25%"
          );
        });

        const delayTime = 2.2749999999999995;
        this.timelineRef.current?.to(
          this.innerWrapperRef.current,
          { opacity: 0, duration: 0.4, ease: "power3.out" },
          delayTime + 0.2
        );

        const proxy = { value: 0 };
        const stateProxy = { value: false };

        this.timelineRef.current?.to(proxy, {
          value: 1,
          duration: 1.5,
          ease: "expo.inOut",
          onUpdate: () => {
            const v = proxy.value;
            if (this.containerRef.current) {
              this.containerRef.current.style.clipPath = v <= 0
                ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                : v >= 1
                  ? "polygon(0% 100%, 0% 100%, 0% 100%)"
                  : v <= 0.5
                    ? `polygon(0% 100%, ${2 * v * 100}% 0%, 100% 0%, 100% 100%)`
                    : `polygon(0% 100%, 100% ${(v - 0.5) * 200}%, 100% 100%)`;
            }
            if (!stateProxy.value && proxy.value >= 0.9) {
              stateProxy.value = true;
              this.preloader.setPhase("revealing");
              this.updateContainerClass(); 
            }
          }
        }, delayTime);
      };

      this.timeoutId = setTimeout(checkReady, 100);
    }, this.el);
  };

  destroy() {
    this.mediaQuery.removeEventListener("change", this.handleMotionChange);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    
    this.timelineRef.current?.kill();
    if (this.gsapCtx) this.gsapCtx.revert();
    
    this.childInstances.forEach(inst => inst?.destroy?.());
    
    if (this.el) {
      gsap.killTweensOf(this.el);
      this.el.remove();
    }
  }
}