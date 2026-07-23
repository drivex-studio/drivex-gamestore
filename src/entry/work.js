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

import { initHeroTextOnly } from '../features/HeroTextOnly.js';
import { heroData } from '../data/heroTextOnlyData.js';

import { initFooterClient } from '../components/FooterClient.js';
import { footerProps } from '../data/footerData.js';

import { initWorkSliderClient } from '../features/WorkSlider/initWorkSliderClient.js';
import { workSliderData } from '../data/workSliderData.js';

let destroyLenisProvider = null;
let destroyPageEnterProvider = null;
let destroyThemeSync = null;
let heroInstance = null; 
let workSliderInstance = null;
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

  const headerMount = document.body;
  destroyPageEnterProvider = initPageEnterProvider(headerMount, {}, (parentElement) => {
    initHeaderClient(parentElement, { navItems, headerCta, flyout, spotsRemaining });
  });

  const mainContainer = document.createElement('main');
  mainContainer.id = 'main-content';
  document.body.appendChild(mainContainer);

  const heroSectionWrapper = document.createElement('section');
  heroSectionWrapper.setAttribute('data-theme', 'light');
  heroSectionWrapper.setAttribute('data-page-builder-section', 'heroSection');
  heroSectionWrapper.className = 'relative bg-background pt-64 lg:pt-128 pb-24 lg:pb-48';
  mainContainer.appendChild(heroSectionWrapper);

  heroInstance = initHeroTextOnly(heroSectionWrapper, {
    headline: heroData.headline,
    headlineLevel: heroData.headlineLevel,
    headlineDisplay: heroData.headlineDisplay,
    subtext: heroData.subtext,
  });

  const workSectionWrapper = document.createElement('section');
  workSectionWrapper.setAttribute('data-theme', 'light');
  workSectionWrapper.setAttribute('data-page-builder-section', 'workSection');
  workSectionWrapper.className = 'bg-background pt-128 lg:pt-192 pb-64 lg:pb-128';
  mainContainer.appendChild(workSectionWrapper);

  workSliderInstance = initWorkSliderClient(workSectionWrapper, { section: workSliderData });

  footerInstance = initFooterClient(document.body, footerProps);

  window.addEventListener('unload', () => {
    if (typeof destroyLenisProvider === 'function') destroyLenisProvider();
    if (typeof destroyPageEnterProvider === 'function') destroyPageEnterProvider();
    if (typeof destroyThemeSync === 'function') destroyThemeSync();

    // NEW
    if (heroInstance && typeof heroInstance.destroy === 'function') {
      heroInstance.destroy();
    }

    if (workSliderInstance && typeof workSliderInstance.destroy === 'function') {
      workSliderInstance.destroy();
    }

    if (footerInstance && typeof footerInstance.destroy === 'function') {
      footerInstance.destroy();
    }
  });
});
