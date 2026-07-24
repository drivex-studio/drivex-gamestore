import { gsap, ScrollTrigger } from '../vendor.js';
import Lenis from 'lenis';
import { initPageTransitionState } from '../lib/pageTransitionState.js';
import { initLenisProvider, getLenis, scrollToTop } from '../lib/lenisState.js';
import { initPreloader } from '../components/Preloader.js';
import { initPreloaderScrollLock } from '../behaviors/PreloaderScrollLock.js';
import { initSyncBodyTheme } from '../components/SyncBodyTheme.js';
import { initPageEnterProvider } from '../components/PageEnterProvider.js';
import { initHeaderClient } from '../components/HeaderClient.js';
import { navItems, flyout, headerCta, spotsRemaining } from '../data/navData.js';
import { initFooterClient } from '../components/FooterClient.js';
import { footerProps } from '../data/footerData.js';
import { initHeroParallax } from '../features/general/HeroParallax.js';
import { aboutHeroData } from '../data/AboutHeroData.js';
import { initCustomCursor } from '../utils/customCursor.js';

let destroyLenisProvider = null;
let destroyPageEnterProvider = null;
let destroyThemeSync = null;
let customCursorInstance = null;
let heroInstance = null;
let footerInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  destroyLenisProvider = initLenisProvider({});

  if (typeof initPageTransitionState === 'function') {
    initPageTransitionState(document.body);
  }

  if (typeof initPreloader === 'function') {
    initPreloader(document.body, {});
  }

  if (typeof initPreloaderScrollLock === 'function') {
    initPreloaderScrollLock();
  }

  if (typeof initSyncBodyTheme === 'function') {
    destroyThemeSync = initSyncBodyTheme();
  }

  // Everything (header, main, footer) mounts into pageContent, and
  // pageContent itself is only ever attached to the DOM once, wrapped
  // inside customCursorInstance.element -- same as main.js.
  const pageContent = document.createElement('div');

  const headerMount = pageContent;
  destroyPageEnterProvider = initPageEnterProvider(headerMount, {}, (parentElement) => {
    initHeaderClient(parentElement, { navItems, headerCta, flyout, spotsRemaining });
  });

  const mainContainer = document.createElement('main');
  mainContainer.className = 'relative z-[1]';
  pageContent.appendChild(mainContainer);

  const heroSectionWrapper = document.createElement('section');
  heroSectionWrapper.setAttribute('data-theme', 'dark');
  heroSectionWrapper.setAttribute('data-page-builder-section', 'heroSection');
  heroSectionWrapper.setAttribute('data-selector', 'about-hero');
  heroSectionWrapper.className = 'relative overflow-hidden bg-background pt-0 pb-0';

  heroInstance = initHeroParallax(aboutHeroData);
  heroSectionWrapper.appendChild(heroInstance.element);

  mainContainer.appendChild(heroSectionWrapper);

  footerInstance = initFooterClient(pageContent, footerProps);

  customCursorInstance = initCustomCursor(pageContent);
  document.body.appendChild(customCursorInstance.element);

  heroInstance.mount();

  window.addEventListener('unload', () => {
    if (typeof destroyLenisProvider === 'function') destroyLenisProvider();
    if (typeof destroyPageEnterProvider === 'function') destroyPageEnterProvider();
    if (typeof destroyThemeSync === 'function') destroyThemeSync();

    if (heroInstance && typeof heroInstance.destroy === 'function') {
      heroInstance.destroy();
    }

    if (customCursorInstance && typeof customCursorInstance.destroy === 'function') {
      customCursorInstance.destroy();
    }

    if (footerInstance && typeof footerInstance.destroy === 'function') {
      footerInstance.destroy();
    }
  });
});
