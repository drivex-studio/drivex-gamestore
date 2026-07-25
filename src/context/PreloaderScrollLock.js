import { getLenis, getCssScrollLocked, setCssScrollLocked } from '../lib/lenisState.js';
import { subscribePreloader } from './PreloaderProvider.js';

export class PreloaderScrollLock {
  constructor() {
    this.isInitialLoad = null;
    this.phase = null;
    this.prevDeps = { isInitialLoad: null, phase: null };

    this.initScrollState();
    this.unsubscribePreloader = subscribePreloader((state) => {
      this.isInitialLoad = state.isInitialLoad;
      this.phase = state.phase;
      this.update();
    });
  }

  initScrollState() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setCssScrollLocked(true);
  }

  update() {
    if (
      this.prevDeps.phase !== this.phase ||
      this.prevDeps.isInitialLoad !== this.isInitialLoad
    ) {
      this.prevDeps = { phase: this.phase, isInitialLoad: this.isInitialLoad };

      const isPreloading = this.isInitialLoad && this.phase !== 'hidden';
      const lenisInstance = getLenis();

      if (isPreloading) {
        if (!getCssScrollLocked()) {
          setCssScrollLocked(true);
        }
        if (lenisInstance && typeof lenisInstance.stop === 'function') {
          lenisInstance.stop();
        }
      } else if (this.phase === 'hidden') {
        setCssScrollLocked(false);
        if (lenisInstance && typeof lenisInstance.start === 'function') {
          lenisInstance.start();
        }
      }
    }
  }

  destroy() {
    if (this.unsubscribePreloader) {
      this.unsubscribePreloader();
    }

    setCssScrollLocked(false);
    const lenisInstance = getLenis();
    if (lenisInstance && typeof lenisInstance.start === 'function') {
      lenisInstance.start();
    }
  }
}
