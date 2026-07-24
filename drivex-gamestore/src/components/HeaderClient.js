
import { useHeaderScrollState } from '../hooks/useHeaderScrollState.js';
import { initMenuButton } from './MenuButton.js';
import { initMobileNavMenu } from './MobileNavMenu.js';
import { initHeaderLogo as HeaderLogo } from './HeaderLogo.js';
import { initAnimatedButton } from './ui/AnimatedButton.js';
import { cx } from '../utils/cx.js';
import { getLenis } from '../lib/lenisState.js';

import { useModal } from '../hooks/useModal.js';
import { usePageEnterContext } from '../hooks/usePageEnterContext.js';
import { usePreloader } from '../hooks/usePreloader.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { useAsciiDelay } from '../hooks/useAsciiDelay.js';
import { usePageTransition } from '../hooks/usePageTransition.js';
import { usePageEnter } from '../hooks/usePageEnter.js';

const HEADER_PADDING_BY_STATE = { top: 0, scrolled: 16, menuOpen: 64 };

const HEADER_STATIC_CLASSNAME = cx(
  'fixed inset-x-0 top-0 z-[9999]',
  'flex flex-col gap-8 pt-16',
  '!bg-transparent transition-colors duration-300 ease-out'
);

export function initHeaderClient(parentElement, props = {}) {
  const { navItems, headerCta, flyout, spotsRemaining } = props;

  const headerRef = { current: null }; 
  const headerInnerRef = { current: null }; 

  let isReady = false;
  function handleScrollStateChange() {
    if (isReady) render();
  }

  const scrollState = useHeaderScrollState(() => headerInnerRef.current, handleScrollStateChange);
  const { openModal } = useModal(); 
  const { prefersReducedMotion } = usePageEnterContext(); 
  const { isInitialLoad } = usePreloader(); 
  const isLg = useBreakpoint('lg'); 
  const asciiDelay = useAsciiDelay(); 

  function runInitialHideEffect() {
    if (isInitialLoad && !prefersReducedMotion && headerRef.current) {
      headerRef.current.classList.add('header-hidden', 'no-transition');
      requestAnimationFrame(() => headerRef.current?.classList.remove('no-transition'));
    }
  }
  
  const { phase } = usePageTransition(); 

  function runTransitionHideEffect() {
    if (!prefersReducedMotion && headerRef.current) {
      if (phase === 'entering') {
        headerRef.current.classList.add('header-hidden');
      } else if (phase === 'holding') {
        headerRef.current.classList.add('header-hidden', 'no-transition');
        requestAnimationFrame(() => headerRef.current?.classList.remove('no-transition'));
      }
    }
  }

  function revealHeaderAfterDelay(delaySeconds) {
    if (headerRef.current) {
      setTimeout(() => {
        headerRef.current?.classList.remove('header-hidden');
      }, (delaySeconds + (isInitialLoad ? asciiDelay : 0)) * 1000);
    }
  }
  usePageEnter(revealHeaderAfterDelay, { priority: 0, skip: prefersReducedMotion }); 

  const isHiddenByProximityRef = { current: false }; 

  function runPhaseResetEffect() {
    if (phase === 'entering' || phase === 'holding') {
      isHiddenByProximityRef.current = false;
    }
  }

  function onLenisScroll() {
    if (prefersReducedMotion || !headerRef.current) return;
    const threshold = 0.1 * window.innerHeight;
    let shouldHide = false;
    const footerEl = document.querySelector('footer');
    if (footerEl) {
      const rect = footerEl.getBoundingClientRect();
      if (rect.height > 0 && rect.top <= threshold) shouldHide = true;
    }
    if (!shouldHide) {
      for (const el of document.querySelectorAll('[data-hide-header]')) {
        if (el.getBoundingClientRect().top <= threshold) {
          shouldHide = true;
          break;
        }
      }
    }
    if (shouldHide !== isHiddenByProximityRef.current) {
      isHiddenByProximityRef.current = shouldHide;
      headerRef.current.classList.toggle('header-hidden', shouldHide);
    }
  }

  const lenisInstance = getLenis();

  if (lenisInstance) {
    lenisInstance.on('scroll', onLenisScroll);
  }
  const disposeLenisScroll = () => {
    if (lenisInstance) {
      lenisInstance.off('scroll', onLenisScroll);
    }
  };

  const backdrop = document.createElement('div');
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.addEventListener('click', () => scrollState.closeMenu());
  parentElement.appendChild(backdrop);

  const header = document.createElement('header');
  header.className = HEADER_STATIC_CLASSNAME;
  headerRef.current = header;
  parentElement.appendChild(header);

  const contentWrap = document.createElement('div');
  headerInnerRef.current = contentWrap;
  header.appendChild(contentWrap);

  const row = document.createElement('div');
  row.className = 'py-16';
  contentWrap.appendChild(row);

  const rowGrid = document.createElement('div');
  rowGrid.className = 'grid grid-cols-2 items-center lg:grid-cols-3';
  row.appendChild(rowGrid);

  const logoCol = document.createElement('div');
  logoCol.className = 'justify-self-start';
  rowGrid.appendChild(logoCol);
  let headerLogoInstance = HeaderLogo(logoCol, { isMenuOpen: scrollState.getState().isMenuOpen });

  const menuButtonCol = document.createElement('div');
  menuButtonCol.className = 'justify-self-end lg:justify-self-center';
  rowGrid.appendChild(menuButtonCol);
  let menuButtonEl = null;
  function renderMenuButton() {
    if (menuButtonEl) menuButtonEl.remove();
    menuButtonEl = initMenuButton({ isOpen: scrollState.getState().isMenuOpen, onClick: scrollState.toggleMenu });
    menuButtonCol.appendChild(menuButtonEl);
  }
  renderMenuButton();

  const ctaCol = document.createElement('div');
  ctaCol.className = 'justify-self-end';
  rowGrid.appendChild(ctaCol);
  function renderCta() {
    ctaCol.innerHTML = '';
    if (headerCta?.text) {
      initAnimatedButton(ctaCol, {
        size: 'sm',
        theme: 'brand',
        className: 'hidden justify-self-end lg:inline-flex',
        children: headerCta.text,
        onClick: () => openModal('cal-booking'),
      });
      
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'hidden lg:block';
      ctaCol.appendChild(placeholder);
    }
  }
  renderCta();

  const mobileNav = initMobileNavMenu(header, {
    navItems,
    flyout,
    onClose: scrollState.closeMenu,
    isOpen: scrollState.getState().isMenuOpen,
    spotsRemaining,
  });

  function render() {
    const state = scrollState.getState();
    header.dataset.theme = state.headerTheme;

    const paddingX = isLg ? HEADER_PADDING_BY_STATE[state.headerState] : (state.headerState === 'top' ? 0 : state.headerState === 'scrolled' ? 16 : 24);
    contentWrap.className = cx('grid-container transition-[padding,background-color,color] duration-500 ease-out', state.headerState === 'top' ? 'bg-transparent' : 'bg-surface');
    contentWrap.style.paddingLeft = `${paddingX}px`;
    contentWrap.style.paddingRight = `${paddingX}px`;

headerLogoInstance.setMenuOpen(state.isMenuOpen);
 
    renderMenuButton();

    backdrop.className = cx(
      'fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm',
      'transition-opacity duration-500 ease-out',
      state.isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
    );

    mobileNav.setIsOpen(state.isMenuOpen);
  }
  isReady = true;
  render();

  runInitialHideEffect();
  runTransitionHideEffect();
  runPhaseResetEffect();

  function destroy() {
    scrollState.destroy();
    mobileNav.destroy();
    disposeLenisScroll?.();
  }

  return { headerElement: header, backdropElement: backdrop, destroy };
}
