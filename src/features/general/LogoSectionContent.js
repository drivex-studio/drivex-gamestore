// original component name: LogoSectionContent

import gsap from 'gsap';
import { usePageEnter } from '../../hooks/usePageEnter.js';
import { usePageEnterContext } from '../../hooks/usePageEnterContext.js';
import { SanityImage } from '../../media/SanityImage.js';
import { getImageSrc } from '../../media/shared/sanityImageUtils.js';
import { setStyles } from '../../media/shared/dom.js';
import { LOGO_HEIGHTS, getLogoSizeVars } from '../../utils/logoSizeVars.js';

import { usePageEnterMotion } from '../../hooks/usePageEnterMotion.js';

export function initLogoSectionContent(parentElement, props) {
  const { trustedBy, theme } = props;

  let containerEl = null;
  let titleEl = null;
  const itemEls = [];
  let hasAnimated = false;
  const { prefersReducedMotion } = usePageEnterContext();

  let element = null;

  if (trustedBy.items && trustedBy.items.length !== 0) {
    containerEl = document.createElement('div');
    containerEl.className = 'grid-container';

    const gridLayoutEl = document.createElement('div');
    gridLayoutEl.className = 'grid-layout';

    const rowEl = document.createElement('div');
    rowEl.className =
      'grid-span-12 lg:grid-start-3 lg:grid-span-8 flex flex-col items-center gap-12 lg:flex-row lg:justify-center lg:gap-32';

    if (trustedBy.title) {
      titleEl = document.createElement('p');
      titleEl.className = 'shrink-0 text-accent-sm text-foreground-muted';
      titleEl.textContent = trustedBy.title;
      rowEl.appendChild(titleEl);
    }

    const logosWrapperEl = document.createElement('div');
    logosWrapperEl.className =
      'flex flex-wrap items-center justify-center gap-x-12 gap-y-8 lg:gap-x-32';

    // Renamed from mangled source identifiers within the items loop:
    // e (item) -> item, r (index) -> index, s (variant) -> variant,
    // a (desktop height) -> desktopHeight, l (aspectRatio) -> aspectRatio, i (imageSrc) -> imageSrc
    trustedBy.items.forEach((item, index) => {
      if (item._type === 'image' && item.image) {
        const variant = item.variant ?? 'horizontal';
        const { desktop: desktopHeight } = LOGO_HEIGHTS[variant];
        const aspectRatio = item.image.dimensions?.aspectRatio;

        if (theme === 'light') {
          const spanEl = document.createElement('span');
          setStyles(spanEl, getLogoSizeVars(variant));

          // SanityImage is a vanilla-JS factory: SanityImage(parentElement, props).
          // It appends its own <picture> element to parentElement and returns
          // { el, destroy } -- it does not return a Node to appendChild manually.
          SanityImage(spanEl, {
            image: item.image,
            alt: item.alt ?? 'Client logo',
            height: desktopHeight,
            noPlaceholder: true,
            priority: true,
            className:
              '[&_img]:!h-(--logo-h) [&_img]:!w-auto [&_img]:!object-contain lg:[&_img]:!h-(--logo-h-desktop) h-auto w-auto opacity-60 grayscale hover:opacity-100 hover:grayscale-0',
          });

          itemEls[index] = spanEl;
          logosWrapperEl.appendChild(spanEl);
          return;
        }

        const imageSrc = getImageSrc(
          { ...item.image, crop: null, hotspot: null },
          { height: 2 * desktopHeight, fit: 'max' }
        );

        const spanEl = document.createElement('span');
        spanEl.setAttribute('role', 'img');
        spanEl.setAttribute('aria-label', item.alt ?? 'Client logo');
        spanEl.className =
          'block h-(--logo-h) bg-current text-foreground-muted hover:text-foreground lg:h-(--logo-h-desktop)';
        setStyles(spanEl, {
          ...getLogoSizeVars(variant),
          aspectRatio,
          maskImage: `url(${imageSrc})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${imageSrc})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        });

        itemEls[index] = spanEl;
        logosWrapperEl.appendChild(spanEl);
        return;
      }

      if (item._type === 'svgItem' && item.svgCode) {
        const variant = item.variant ?? 'horizontal';

        const spanEl = document.createElement('span');
        spanEl.setAttribute('role', 'img');
        spanEl.setAttribute('aria-label', item.alt ?? 'Client logo');
        Object.assign(spanEl.style, getLogoSizeVars(variant));
        spanEl.className =
          'block h-(--logo-h) text-foreground-muted hover:text-foreground lg:h-(--logo-h-desktop) [&_svg]:h-full [&_svg]:w-auto';
        spanEl.innerHTML = item.svgCode;

        itemEls[index] = spanEl;
        logosWrapperEl.appendChild(spanEl);
        return;
      }

      if (item._type === 'textItem' && item.text) {
        const spanEl = document.createElement('span');
        spanEl.className =
          'w-full text-center text-accent-sm text-foreground-muted lg:w-auto lg:text-left';
        spanEl.textContent = item.text;

        itemEls[index] = spanEl;
        logosWrapperEl.appendChild(spanEl);
        return;
      }

      // original source returned null here -- no element created, no ref assigned
    });

    rowEl.appendChild(logosWrapperEl);
    gridLayoutEl.appendChild(rowEl);
    containerEl.appendChild(gridLayoutEl);
    element = containerEl;
  }

  // useGSAP -> gsap.context() conversion (Section 1.9(d)); scope = containerEl (was `u`/containerRef)
  const gsapContext = gsap.context(() => {
    if (prefersReducedMotion) return;
    // original identifier: e (filtered initial targets)
    const initialTargets = [titleEl, ...itemEls].filter(Boolean);
    gsap.set(initialTargets, { opacity: 0, y: 20 });
  }, containerEl);

  // contextSafe(callback) -> gsapContext.add(name, callback); useMemo's memoization wrapper dropped,
  // the wrapped logic is preserved and computed once, in the same execution order as source.
  // Renamed from mangled source identifiers within playIntro:
  // e (delay arg) -> delay, t (timeline) -> tl, r (filtered targets) -> itemsToAnimate
  const playIntro = gsapContext.add('playIntro', (delay) => {
    if (hasAnimated) return;
    hasAnimated = true;

    const tl = gsap.timeline({ delay: delay + 0.2 });

    if (titleEl) {
      tl.to(titleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    }

    const itemsToAnimate = itemEls.filter(Boolean);
    if (itemsToAnimate.length > 0) {
      tl.to(
        itemsToAnimate,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.08,
          onComplete: () => {
            for (const el of itemsToAnimate) {
              if (el) {
                gsap.set(el, { clearProps: 'y,opacity' });
                el.classList.add('transition-colors');
              }
            }
          },
        },
        0.1
      );
    }
  });

  // SOURCE NOT PRESENT: usePageEnter (../../hooks/usePageEnter.js)
  usePageEnter(playIntro, { priority: 2, skip: prefersReducedMotion });

  if (parentElement && element) {
    parentElement.appendChild(element);
  }

  function destroyLogoSectionContent() {
    gsapContext.revert();
  }

  return { element, destroy: destroyLogoSectionContent };
}
