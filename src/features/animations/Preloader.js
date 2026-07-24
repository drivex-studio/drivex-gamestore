import { ScrambleText } from './ScrambleGroup.js';
import { gsap } from '../../vendor.js';
import { cx } from '../../utils/cx.js';
import { subscribePreloader } from '../../context/PreloaderProvider.js';

export class Preloader {
  constructor(parentElement, props = {}) {
    const { ...restProps } = props;
    this.parentElement = parentElement;

    this.childInstances = [];
    this.isInitialLoad = false;
    this.phase = 'loading';
    this.setPhase = () => {};
    this.prefersReducedMotion = false;
    this.isMounted = false;

    this.onScrambleReadyCallback = null;
    this.timeline = null;
    this.timeoutId = null;
    
    this.prevDeps = { isInitialLoad: null, phase: null, prefersReducedMotion: null };

    this.el = document.createElement('div');
    this.el.setAttribute('data-theme', 'brand');

    Object.entries(restProps).forEach(([k, v]) => {
      if (typeof v !== 'function') this.el.setAttribute(k, v);
    });

    this.innerWrapper = document.createElement('div');
    this.innerWrapper.className = 'Preloader-inner';

    this.squaresContainer = document.createElement('div');
    this.squaresContainer.className = 'Preloader-squares';

    this.squares = [];
    [0, 1, 2, 3].forEach((idx) => {
      const sq = document.createElement('div');
      sq.className = 'Preloader-square';
      sq.style.transform = 'translateX(-16px)';
      sq.style.transformOrigin = 'bottom right';
      this.squares.push(sq);
      this.squaresContainer.appendChild(sq);
    });

    this.textContainer = document.createElement('div');
    this.textContainer.className = 'Preloader-text';

    this.innerWrapper.appendChild(this.squaresContainer);
    this.innerWrapper.appendChild(this.textContainer);
    this.el.appendChild(this.innerWrapper);

    const scrambleText = new ScrambleText(this.textContainer, {
      revealMode: true,
      duration: 1,
      onReady: this.handleScrambleReady,
      children: 'LOADING'
    });
    if (scrambleText) this.childInstances.push(scrambleText);

    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', this.handleMediaChange);

    this.unsubscribePreloader = subscribePreloader((state) => {
      this.isInitialLoad = state.isInitialLoad;
      this.phase = state.phase;
      this.setPhase = state.setPhase;
      this.update();
    });

    this.update();
  }

  handleScrambleReady = (cb) => { 
    this.onScrambleReadyCallback = cb; 
  };

  handleMediaChange = (e) => {
    this.prefersReducedMotion = e.matches;
    this.update();
  };

  cleanupAnimation = () => {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.timeline) this.timeline.kill();
  };

  runAnimation = () => {
    if (!this.isInitialLoad || this.phase !== 'loading') return;
    if (this.prefersReducedMotion) {
      // 'revealing' is the only phase PreloaderProvider auto-advances
      // (200ms later -> isInitialLoad=false, phase='hidden'). Setting
      // 'complete' here left the preloader stuck on screen forever for
      // reduced-motion users, since neither update() nor
      // PageEnterProvider treat 'complete' as a resolved state.
      this.setPhase('revealing');
      return;
    }

    if (this.squares.length === 0) return;

    const t = () => {
      if (!this.onScrambleReadyCallback) return void requestAnimationFrame(t);
      this.timeline = gsap.timeline();
      this.onScrambleReadyCallback();

      this.squares.forEach((sq, idx) => {
        this.timeline.fromTo(sq,
          { x: 0 === idx ? -16 : (idx - 1) * 18, rotate: 0 },
          { x: 18 * idx - 16, rotate: 90, duration: 0.7, ease: 'expo.inOut', immediateRender: false },
          0 === idx ? 0 : '>-25%'
        );
      });

      let i = 2.2749999999999995;
      this.timeline.to(this.innerWrapper, { opacity: 0, duration: 0.4, ease: 'power3.out' }, i + 0.2);

      let n = { value: 0 };
      let s = { value: false };
      
      this.el.style.willChange = 'clip-path';
      
      this.timeline.to(n, {
        value: 1,
        duration: 1.5,
        ease: 'expo.inOut',
        onUpdate: () => {
          let e_val = n.value;
          this.el.style.clipPath = e_val <= 0
            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
            : e_val >= 1
              ? 'polygon(0% 100%, 0% 100%, 0% 100%)'
              : e_val <= 0.5
                ? `polygon(0% 100%, ${2 * e_val * 100}% 0%, 100% 0%, 100% 100%)`
                : `polygon(0% 100%, 100% ${(e_val - 0.5) * 200}%, 100% 100%)`;

          if (!s.value && n.value >= 0.9) {
            s.value = true;
            this.setPhase('revealing');
          }
        },
        onComplete: () => {
          this.el.style.willChange = 'auto';
        }
      }, i);
    };

    this.timeoutId = setTimeout(t, 100);
  };

  update = () => {
    if (!this.isInitialLoad || this.phase === 'hidden') {
      if (this.isMounted) {
        this.el.remove();
        this.isMounted = false;
      }
      return;
    } else {
      if (!this.isMounted && this.parentElement) {
        this.parentElement.appendChild(this.el);
        this.isMounted = true;
      }
    }

    const isCompleteClass = this.phase === 'complete' && 'is-complete';
    this.el.className = cx('Preloader', isCompleteClass);

    const phaseChanged = this.prevDeps.phase !== this.phase;

    if (
      this.prevDeps.isInitialLoad !== this.isInitialLoad ||
      (phaseChanged && this.phase !== 'revealing') ||
      this.prevDeps.prefersReducedMotion !== this.prefersReducedMotion
    ) {
      this.prevDeps = { 
        isInitialLoad: this.isInitialLoad, 
        phase: this.phase, 
        prefersReducedMotion: this.prefersReducedMotion 
      };
      this.cleanupAnimation();
      this.runAnimation();
    } else if (phaseChanged) {
      this.prevDeps.phase = this.phase;
    }
  };

  destroy() {
    this.mediaQuery.removeEventListener('change', this.handleMediaChange);
    if (this.unsubscribePreloader) this.unsubscribePreloader();
    this.cleanupAnimation();
    this.childInstances.forEach(inst => inst?.destroy?.());
    
    gsap.killTweensOf(this.el);
    gsap.killTweensOf(this.innerWrapper);
    this.squares.forEach(sq => gsap.killTweensOf(sq));
    
    if (this.isMounted) this.el.remove();
  }
}
