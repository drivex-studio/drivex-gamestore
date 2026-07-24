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

import { initHeroTextOnly } from '../features/Pricing/HeroTextOnly.js';
import { pricingHeroData } from '../data/PricingHeroData.js';
import { initCustomCursor } from '../utils/customCursor.js';

import { initLogoSection } from '../pages/PricingPage.js';

let destroyLenisProvider = null;
let destroyPageEnterProvider = null;
let destroyThemeSync = null;
let customCursorInstance = null;
let heroInstance = null;
let logoSectionInstance = null;

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

  const pageContent = document.createElement('div');

  const headerMount = pageContent;
  destroyPageEnterProvider = initPageEnterProvider(headerMount, {}, (parentElement) => {
    initHeaderClient(parentElement, { navItems, headerCta, flyout, spotsRemaining });
  });

  const mainContainer = document.createElement('main');
  mainContainer.id = 'main-content';
  mainContainer.className = 'relative z-[1]';
  pageContent.appendChild(mainContainer);

  const heroSectionWrapper = document.createElement('section');
  heroSectionWrapper.setAttribute('data-theme', pricingHeroData.theme);
  heroSectionWrapper.setAttribute('data-page-builder-section', 'heroSection');
  heroSectionWrapper.setAttribute('data-selector', pricingHeroData.selector);
  heroSectionWrapper.className = 'relative bg-background pt-96 lg:pt-192 pb-0';

  heroInstance = initHeroTextOnly(pricingHeroData);
  heroSectionWrapper.appendChild(heroInstance.element);
  mainContainer.appendChild(heroSectionWrapper);

  // Logo Section
  logoSectionInstance = initLogoSection(mainContainer);

  footerInstance = initFooterClient(pageContent, footerProps);
  customCursorInstance = initCustomCursor(pageContent);
  document.body.appendChild(customCursorInstance.element);

  heroInstance.mount();

  if (logoSectionInstance && typeof logoSectionInstance.mount === 'function') {
    logoSectionInstance.mount();
  }

  window.addEventListener('unload', () => {
    if (typeof destroyLenisProvider === 'function') destroyLenisProvider();
    if (typeof destroyPageEnterProvider === 'function') destroyPageEnterProvider();
    if (typeof destroyThemeSync === 'function') destroyThemeSync();

    if (heroInstance && typeof heroInstance.destroy === 'function') {
      heroInstance.destroy();
    }

    if (logoSectionInstance && typeof logoSectionInstance.destroy === 'function') {
      logoSectionInstance.destroy();
    }

    if (customCursorInstance && typeof customCursorInstance.destroy === 'function') {
      customCursorInstance.destroy();
    }

    if (footerInstance && typeof footerInstance.destroy === 'function') {
      footerInstance.destroy();
    }
  });
});
