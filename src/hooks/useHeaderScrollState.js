import { usePathname } from './usePathname.js'; 
import { usePageTransition } from './usePageTransition.js'; 
import { getLenis } from '../lib/lenisState.js'; 
import { useEventListener } from './useEventListener.js';
import { useKeyPress } from './useKeyPress.js';

const SECTION_SELECTOR = 'main [data-page-builder-section][data-theme]';
const VALID_THEMES = ['light', 'dark', 'brand'];

export function useHeaderScrollState(headerRefGetter, onChange) {
  
  let scrollState = 'top'; 
  let isMenuOpen = false; 
  let sectionTheme = 'dark'; 
  let hasLockedScroll = false; 

  function notify() {
    onChange?.(getState());
  }

  function setScrollState(value) {
    if (value === scrollState) return;
    scrollState = value;
    notify();
  }
  function setIsMenuOpen(value) {
    if (value === isMenuOpen) return;
    isMenuOpen = value;
    notify();
    runScrollLockEffect();
  }
  function setSectionTheme(value) {
    if (value === sectionTheme) return;
    sectionTheme = value;
    notify();
  }

  usePathname();

  const { phase } = usePageTransition(); 

  function updateSectionTheme(scrollY) {
    const sections = document.querySelectorAll(SECTION_SELECTOR);
    if (sections.length === 0) return false;
    const matched = Array.from(sections).find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top <= scrollY && rect.bottom > scrollY;
    });
    if (matched) {
      const theme = matched.dataset.theme;
      if (theme && VALID_THEMES.includes(theme)) {
        setSectionTheme(theme);
        return true;
      }
    }
    const first = sections[0];
    const firstTheme = first?.dataset.theme;
    if (firstTheme && VALID_THEMES.includes(firstTheme)) {
      setSectionTheme(firstTheme);
      return true;
    }
    return false;
  }

  const scrollListener = useEventListener(
    'scroll',
    () => {
      setScrollState(window.scrollY > 50 ? 'scrolled' : 'top');
      const headerEl = headerRefGetter();
      if (headerEl) updateSectionTheme(headerEl.offsetTop);
    },
    window,
    { passive: true }
  );

  function runPhaseEffect() {
    const headerEl = headerRefGetter();
    if (headerEl && (phase === 'exiting' || phase === 'idle')) {
      updateSectionTheme(headerEl.offsetTop);
    }
  }
  runPhaseEffect();

  let sectionObserver = null;
  function runSectionObserverEffect() {
    const headerEl = headerRefGetter();
    if (!headerEl) return;
    const topOffset = headerEl.offsetTop;
    if (document.querySelectorAll(SECTION_SELECTOR).length > 0) {
      updateSectionTheme(topOffset);
      return;
    }
    sectionObserver = new MutationObserver(() => {
      if (document.querySelectorAll(SECTION_SELECTOR).length > 0) {
        updateSectionTheme(topOffset);
        sectionObserver.disconnect();
      }
    });
    sectionObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
  runSectionObserverEffect();

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }
  function closeMenu() {
    setIsMenuOpen(false);
  }

  const escapeKeyListener = useKeyPress('Escape', () => {
    if (isMenuOpen) closeMenu();
  });

  function runScrollLockEffect() {
    if (isMenuOpen) {
      getLenis()?.stop();
      hasLockedScroll = true;
    } else if (hasLockedScroll) {
      getLenis()?.start();
      hasLockedScroll = false;
    }
  }

  function getState() {
    
    const headerState = isMenuOpen ? 'menuOpen' : scrollState;
    return {
      scrollState,
      isMenuOpen,
      headerState,
      headerTheme: sectionTheme,
      sectionTheme,
    };
  }

  function destroy() {
    scrollListener.destroy();
    escapeKeyListener.destroy();
    sectionObserver?.disconnect();
  }

  return { getState, toggleMenu, closeMenu, destroy };
}
