import { initPageTransitionState } from './lib/pageTransitionState.js';
import { initLenisProvider, getLenis, scrollToTop } from './lib/lenisState.js';
import { PreloaderProvider } from './context/PreloaderProvider.js';
import { Preloader } from './features/animations/Preloader.js';
import { PreloaderScrollLock } from './context/PreloaderScrollLock.js';
import { initSyncBodyTheme } from './components/SyncBodyTheme.js'; 
import { initPageEnterProvider } from './components/PageEnterProvider.js';
import { initHeaderClient } from './components/HeaderClient.js';
import { navItems, flyout, headerCta, spotsRemaining } from './data/navData.js';
import { initFooterClient } from './components/FooterClient.js';
import { footerProps } from './data/footerData.js';


let destroyLenisProvider = null;
let destroyPageEnterProvider = null;
let destroyThemeSync = null; 

let preloaderProviderInstance = null;
let preloaderInstance = null; 
let preloaderScrollLockInstance =  null; 


let customCursorInstance = null;
let footerInstance = null;   

document.addEventListener('DOMContentLoaded', () => {
  
  destroyLenisProvider = initLenisProvider({});

  if (typeof initPageTransitionState === "function") {
    initPageTransitionState(document.body);
  }


  preloaderProviderInstance = new PreloaderProvider(document.body, {});
  preloaderScrollLockInstance = new PreloaderScrollLock(document.body, {});
  preloaderInstance = new Preloader(document.body, {});

  if (preloaderInstance && preloaderInstance.mount) {
    preloaderInstance.mount();
  }

  if (typeof initPreloaderScrollLock === "function") {
    initPreloaderScrollLock();
  }

  if (typeof initSyncBodyTheme === "function") {
    destroyThemeSync = initSyncBodyTheme();
  }

  const pageContent = document.createElement('div');

  const headerMount = pageContent;
  destroyPageEnterProvider = initPageEnterProvider(headerMount, {}, (parentElement) => {
    initHeaderClient(parentElement, { navItems, headerCta, flyout, spotsRemaining });
  });

  const mainContainer = document.createElement('main');
  mainContainer.className = 'relative z-[1]';
  pageContent.appendChild(mainContainer);


  footerInstance = initFooterClient(pageContent, footerProps);

  customCursorInstance = initCustomCursor(pageContent);
  document.body.appendChild(customCursorInstance.element);


  
  window.addEventListener('unload', () => {
    if (typeof destroyLenisProvider === 'function') destroyLenisProvider();
    if (typeof destroyPageEnterProvider === 'function') destroyPageEnterProvider();
    if (typeof destroyThemeSync === 'function') destroyThemeSync();

if (preloaderProviderInstance && typeof preloaderProviderInstance.destroy === 'function') {
  preloaderProviderInstance.destroy();
}
if (preloaderScrollLockInstance && typeof preloaderScrollLockInstance === 'function') {
  preloaderScrollLockInstance();
}

    if (preloaderInstance && typeof preloaderInstance.destroy === 'function') {
      preloaderInstance.destroy();
    }


    if (customCursorInstance && typeof customCursorInstance.destroy === 'function') {
      customCursorInstance.destroy();
    }

    if (footerInstance && typeof footerInstance.destroy === 'function') {
      footerInstance.destroy();
    }
  });
});
