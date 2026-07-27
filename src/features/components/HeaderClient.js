// src/features/components/HeaderClient.js
import { watchPathname, watchRouter } from '../hooks/watchRouter.js';
import { subscribePageTransition } from '../hooks/subscribePageTransition.js';
import { subscribeModal } from '../hooks/subscribeModal.js';
import { subscribePageEnterContext } from '../hooks/subscribePageEnterContext.js';
import { subscribePreloader } from '../hooks/subscribePreloader.js';
import { subscribeBreakpoint } from '../hooks/subscribeBreakpoint.js';
import { subscribeAsciiDelay } from '../hooks/subscribeAsciiDelay.js';
import { getLenis } from '../utils/lenis.js';
import { watchLenis } from '../hooks/watchLenis.js';
import { subscribePageEnter } from '../hooks/subscribePageEnter.js';
import { cx } from '../utils/cx.js';
import { HeaderLogo } from '../components/HeaderLogo.js';
import { HeaderMenuButton } from './HeaderMenuButton.js';
import { AnimatedButton } from '../components/AnimatedButton.js';
import { HeaderFlyout } from './HeaderFlyout.js';

// ---- HeaderClient ----
export class HeaderClient {
  constructor(parentElement, props = {}) {
    // -- Props --
    const { navItems, headerCta, flyout, spotsRemaining, ...restProps } = props;
    this.navItems = navItems;
    this.headerCta = headerCta;
    this.flyout = flyout;
    this.spotsRemaining = spotsRemaining;

    // -- Hook-derived state --
    this.pathname = watchPathname();                                 // originally: usePathname()
    this.pageTransition = subscribePageTransition();                 // originally: usePageTransition()
    this.modal = subscribeModal();                                   // originally: useModal()
    this.pageEnterContext = subscribePageEnterContext();             // originally: usePageEnterContext()
    this.preloader = subscribePreloader();                           // originally: usePreloader()
    this.isLg = subscribeBreakpoint('lg');                           // originally: useBreakpoint("lg")
    this.asciiDelay = subscribeAsciiDelay();                         // originally: useAsciiDelay()

    // -- Internal Header State --
    this.scrollState = 'top';                                        // 'top' | 'scrolled'
    this.isMenuOpen = false;                                         // boolean
    this.headerTheme = 'dark';                                       // 'light' | 'dark' | 'brand'
    this.isHeaderHiddenByScroll = false;

    // -- Refs (kept as { current } objects per Section 3b rule) --
    this.headerRef = { current: null };                              // originally: U = useRef(null)
    this.innerBarRef = { current: null };                            // originally: W = useRef(null)

    // -- Child Instances --
    this.childInstances = [];
    this.menuButtonInstance = null;
    this.flyoutInstance = null;
    this.logoInstance = null;

    // -- DOM Root Setup --
    this.el = document.createElement('div');

    Object.entries(restProps).forEach(([k, v]) => {
      if (typeof v !== 'function') this.el.setAttribute(k, v);
    });

    this.buildDOM();
    this.initScrollAndThemeListeners();
    this.initPageEnterAndTransitionHandlers();

    if (parentElement) {
      parentElement.appendChild(this.el);
    }
  }

  // Get current header state string: 'menuOpen' | 'scrolled' | 'top'
  getHeaderState() {
    return this.isMenuOpen ? 'menuOpen' : this.scrollState;
  }

  // Check section themes on scroll / page load
  checkTheme = (offsetTop) => {
    const SECTION_SELECTOR = 'main [data-page-builder-section][data-theme]';
    const sections = document.querySelectorAll(SECTION_SELECTOR);
    if (sections.length === 0) return false;

    const matched = Array.from(sections).find(sec => {
      const rect = sec.getBoundingClientRect();
      return rect.top <= offsetTop && rect.bottom > offsetTop;
    });

    if (matched) {
      const theme = matched.dataset.theme;
      if (theme && ['light', 'dark', 'brand'].includes(theme)) {
        this.setHeaderTheme(theme);
        return true;
      }
    }

    const firstTheme = sections[0]?.dataset.theme;
    if (firstTheme && ['light', 'dark', 'brand'].includes(firstTheme)) {
      this.setHeaderTheme(firstTheme);
      return true;
    }
    return false;
  };

  setHeaderTheme(theme) {
    this.headerTheme = theme;
    if (this.headerRef.current) {
      this.headerRef.current.setAttribute('data-theme', theme);
    }
  }

  toggleMenu = () => {
    this.setMenuOpen(!this.isMenuOpen);
  };

  closeMenu = () => {
    this.setMenuOpen(false);
  };

  setMenuOpen(isOpen) {
    this.isMenuOpen = isOpen;

    // Lenis scroll control
    const lenis = getLenis();
    if (isOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }

    this.updateLayout();
  }

  handleKeyDown = (e) => {
    if (e.key === 'Escape' && this.isMenuOpen) {
      this.closeMenu();
    }
  };

  handleScroll = () => {
    this.scrollState = window.scrollY > 50 ? 'scrolled' : 'top';
    if (this.innerBarRef.current) {
      this.checkTheme(this.innerBarRef.current.offsetTop);
    }
    this.updateLayout();
  };

  initScrollAndThemeListeners() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('keydown', this.handleKeyDown);

    // Initial theme sync
    if (this.innerBarRef.current) {
      const offsetTop = this.innerBarRef.current.offsetTop;
      if (document.querySelectorAll('main [data-page-builder-section][data-theme]').length > 0) {
        this.checkTheme(offsetTop);
      } else {
        this.themeObserver = new MutationObserver(() => {
          if (document.querySelectorAll('main [data-page-builder-section][data-theme]').length > 0) {
            this.checkTheme(offsetTop);
            this.themeObserver?.disconnect();
          }
        });
        this.themeObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-theme']
        });
      }
    }

    // Lenis scroll observer for hiding header near footer
    this.lenisUnsubscribe = watchLenis(() => {
      if (this.pageEnterContext?.prefersReducedMotion || !this.headerRef.current) return;
      const threshold = 0.1 * window.innerHeight;
      let shouldHide = false;

      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.height > 0 && rect.top <= threshold) {
          shouldHide = true;
        }
      }

      if (!shouldHide) {
        const hideElements = document.querySelectorAll('[data-hide-header]');
        for (const el of hideElements) {
          if (el.getBoundingClientRect().top <= threshold) {
            shouldHide = true;
            break;
          }
        }
      }

      if (shouldHide !== this.isHeaderHiddenByScroll) {
        this.isHeaderHiddenByScroll = shouldHide;
        this.headerRef.current.classList.toggle('header-hidden', shouldHide);
      }
    });
  }

  initPageEnterAndTransitionHandlers() {
    const prefersReducedMotion = this.pageEnterContext?.prefersReducedMotion;
    const isInitialLoad = this.preloader?.isInitialLoad;

    // Initial load hidden setup
    if (isInitialLoad && !prefersReducedMotion && this.headerRef.current) {
      this.headerRef.current.classList.add('header-hidden', 'no-transition');
      requestAnimationFrame(() => {
        this.headerRef.current?.classList.remove('no-transition');
      });
    }

    // Page enter hook
    const onPageEnter = (delaySec) => {
      if (this.headerRef.current) {
        setTimeout(() => {
          this.headerRef.current?.classList.remove('header-hidden');
        }, (delaySec + (isInitialLoad ? this.asciiDelay : 0)) * 1000);
      }
    };

    subscribePageEnter(onPageEnter, {
      priority: 0,
      skip: prefersReducedMotion
    });
  }

  buildDOM() {
    // 1. Overlay Backdrop
    this.backdropEl = document.createElement('div');
    this.backdropEl.setAttribute('aria-hidden', 'true');
    this.backdropEl.addEventListener('click', this.closeMenu);
    this.el.appendChild(this.backdropEl);

    // 2. Header Container
    const headerEl = document.createElement('header');
    headerEl.setAttribute('data-theme', this.headerTheme);
    headerEl.className = cx(
      'fixed inset-x-0 top-0 z-[9999]',
      'flex flex-col gap-8 pt-16',
      '!bg-transparent transition-colors duration-300 ease-out'
    );
    this.headerRef.current = headerEl;

    // 3. Inner Bar
    const innerBarEl = document.createElement('div');
    this.innerBarRef.current = innerBarEl;

    const barContentWrap = document.createElement('div');
    barContentWrap.className = 'py-16';

    const barGrid = document.createElement('div');
    barGrid.className = 'grid grid-cols-2 items-center lg:grid-cols-3';

    // Logo column
    const logoCol = document.createElement('div');
    logoCol.className = 'justify-self-start';
    this.logoInstance = new HeaderLogo(logoCol, { isMenuOpen: this.isMenuOpen });
    this.childInstances.push(this.logoInstance);
    barGrid.appendChild(logoCol);

    // Menu toggle column
    const toggleCol = document.createElement('div');
    toggleCol.className = 'justify-self-end lg:justify-self-center';
    this.menuButtonInstance = new HeaderMenuButton(toggleCol, {
      isOpen: this.isMenuOpen,
      onClick: this.toggleMenu
    });
    this.childInstances.push(this.menuButtonInstance);
    barGrid.appendChild(toggleCol);

    // Header CTA column
    const ctaCol = document.createElement('div');
    if (this.headerCta?.text) {
      const ctaBtn = new AnimatedButton(ctaCol, {
        size: 'sm',
        theme: 'brand',
        className: 'hidden justify-self-end lg:inline-flex',
        onClick: () => this.modal?.openModal?.('cal-booking'),
        children: this.headerCta.text
      });
      this.childInstances.push(ctaBtn);
    } else {
      ctaCol.className = 'hidden lg:block';
    }
    barGrid.appendChild(ctaCol);

    barContentWrap.appendChild(barGrid);
    innerBarEl.appendChild(barContentWrap);
    headerEl.appendChild(innerBarEl);

    // 4. Flyout Overlay
    this.flyoutInstance = new HeaderFlyout(headerEl, {
      navItems: this.navItems,
      flyout: this.flyout,
      onClose: this.closeMenu,
      isOpen: this.isMenuOpen,
      spotsRemaining: this.spotsRemaining
    });
    this.childInstances.push(this.flyoutInstance);

    this.el.appendChild(headerEl);

    this.updateLayout();
  }

  updateLayout() {
    const currentState = this.getHeaderState();

    // Height / Padding mappings
    const paddingMap = { top: 0, scrolled: 16, menuOpen: 64 };
    const ea = paddingMap[currentState];
    const ei = this.isLg ? ea : (currentState === 'top' ? 0 : (currentState === 'scrolled' ? 16 : 24));

    // Backdrop state
    const ed = this.isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0';
    this.backdropEl.className = cx(
      'fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm',
      'transition-opacity duration-500 ease-out',
      ed
    );

    // Inner bar styles
    const em = (currentState === 'top') ? 'bg-transparent' : 'bg-surface';
    this.innerBarRef.current.className = cx(
      'grid-container transition-[padding,background-color,color] duration-500 ease-out',
      em
    );
    this.innerBarRef.current.style.paddingLeft = `${ei}px`;
    this.innerBarRef.current.style.paddingRight = `${ei}px`;

    // Update child components
    if (this.menuButtonInstance) {
      this.menuButtonInstance.update(this.isMenuOpen);
    }
    if (this.flyoutInstance) {
      this.flyoutInstance.updateAnimation(this.isMenuOpen);
    }
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    if (typeof this.lenisUnsubscribe === 'function') {
      this.lenisUnsubscribe();
    }

    this.childInstances.forEach(inst => inst?.destroy?.());
    this.el.remove();
  }
}

export { HeaderClient };
