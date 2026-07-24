
import { gsap } from '../../vendor.js';

import { initAnimatedHeadline } from '../utilities/AnimatedHeadline.js';
import { initAnimatedSubtext } from '../utilities/AnimatedSubtext.js';
import { initButtonGroup } from '../utilities/ButtonGroup.js';
import { useAsciiDelay } from '../../hooks/useAsciiDelay.js'; 
import { usePageEnter } from '../../hooks/usePageEnter.js'; 
import { usePageEnterContext } from '../../hooks/usePageEnterContext.js'; 
import { SanityImage as initSanityImage } from '../../media/SanityImage.js'; 
import { cx } from '../../utils/cx.js'; 
import { LOGO_HEIGHTS, getLogoSizeVars } from '../../utils/logoSizeVars.js';

export function initHeroSectionContent({
  className,
  headline,
  headlineLevel,
  headlineDisplay,
  subtext,
  ctas,
  trustedBy,
  children,
} = {}) {
  const logoItemEls = []; 
  let hasRevealed = false; 
  const { prefersReducedMotion } = usePageEnterContext(); 
  let headlineHandle = null; 
  let subtextHandle = null; 
  const asciiDelay = useAsciiDelay(); 

  const containerEl = document.createElement('div');
  containerEl.className = cx(className);

  const topRowEl = document.createElement('div');
  topRowEl.className =
    'grid-span-12 lg:grid-span-8 flex flex-col justify-start gap-24 pt-24 lg:mt-auto lg:mb-auto lg:justify-center lg:gap-32 lg:pt-0';
  containerEl.appendChild(topRowEl);

  if (headline) {
    headlineHandle = initAnimatedHeadline({
      as: headlineLevel ?? 'h1',
      displayAs: headlineDisplay,
      className: 'text-foreground',
      skip: prefersReducedMotion,
      children: headline,
    });
    topRowEl.appendChild(headlineHandle.element);
  }

  if (subtext) {
    subtextHandle = initAnimatedSubtext({
      className: 'max-w-xl text-body-sm text-foreground lg:text-body lg:text-foreground-muted',
      skip: prefersReducedMotion,
      children: subtext,
    });
    topRowEl.appendChild(subtextHandle.element);
  }

  const ctaWrapEl = document.createElement('div'); 
  ctaWrapEl.className = 'pointer-events-auto';
  if (ctas) {
    const buttonGroupEl = initButtonGroup({ buttonGroup: ctas });
    if (buttonGroupEl) ctaWrapEl.appendChild(buttonGroupEl);
  }
  topRowEl.appendChild(ctaWrapEl);

  if (children) {
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child) containerEl.appendChild(child);
    });
  }

  let trustedByTitleEl = null; 
  if (trustedBy?.items && trustedBy.items.length > 0) {
    const trustedByRowEl = document.createElement('div');
    trustedByRowEl.className =
      'grid-span-12 lg:grid-span-7 pointer-events-auto mt-32 flex flex-col items-center gap-16 text-center lg:mt-0 lg:flex-row lg:items-center lg:text-left';

    if (trustedBy.title) {
      trustedByTitleEl = document.createElement('div');
      trustedByTitleEl.className = 'max-w-auto shrink-0 lg:max-w-240';
      const titleTextEl = document.createElement('p');
      titleTextEl.className = 'text-accent-sm text-foreground-muted';
      titleTextEl.textContent = trustedBy.title;
      trustedByTitleEl.appendChild(titleTextEl);
      trustedByRowEl.appendChild(trustedByTitleEl);
    }

    const logosWrapEl = document.createElement('div');
    logosWrapEl.className = 'flex flex-wrap items-center justify-center gap-x-8 gap-y-8 lg:justify-start lg:gap-x-16';
    trustedBy.items.forEach((item, index) => {
      let logoEl = null;
      if (item._type === 'image' && item.image) {
        const variant = item.variant ?? 'horizontal';
        const { desktop } = LOGO_HEIGHTS[variant];
        logoEl = document.createElement('span');
        Object.assign(logoEl.style, getLogoSizeVars(variant));
        const imageEl = initSanityImage({
          image: item.image,
          alt: item.alt ?? 'Client logo',
          height: desktop,
          priority: true,
          className:
            '[&_img]:!h-(--logo-h) [&_img]:!w-auto [&_img]:!object-contain sm:[&_img]:!h-(--logo-h-desktop) h-auto w-auto grayscale transition-all hover:grayscale-0',
        });
        if (imageEl) logoEl.appendChild(imageEl);
      } else if (item._type === 'svgItem' && item.svgCode) {
        const variant = item.variant ?? 'horizontal';
        logoEl = document.createElement('span');
        logoEl.setAttribute('role', 'img');
        logoEl.setAttribute('aria-label', item.alt ?? 'Client logo');
        Object.assign(logoEl.style, getLogoSizeVars(variant));
        logoEl.className =
          'block h-(--logo-h) text-foreground-muted transition-colors hover:text-foreground sm:h-(--logo-h-desktop) [&_svg]:h-full [&_svg]:w-auto';
        logoEl.innerHTML = item.svgCode;
      } else if (item._type === 'textItem' && item.text) {
        logoEl = document.createElement('span');
        logoEl.className = 'text-accent-sm text-foreground-muted';
        logoEl.textContent = item.text;
      }
      if (logoEl) {
        logoItemEls[index] = logoEl;
        logosWrapEl.appendChild(logoEl);
      }
    });
    trustedByRowEl.appendChild(logosWrapEl);
    containerEl.appendChild(trustedByRowEl);
  }

  if (!prefersReducedMotion) {
    const initialHideTargets = [ctaWrapEl, trustedByTitleEl, ...logoItemEls].filter(Boolean);
    gsap.set(initialHideTargets, { opacity: 0, y: 20 });
  }

  function revealSequence(delay = 0) {
    if (hasRevealed) return;
    hasRevealed = true;
    const t = delay + asciiDelay;
    headlineHandle?.reveal?.(t);
    subtextHandle?.reveal?.(t + 0.15);
    const tl = gsap.timeline({ delay: t + 0.2 });
    if (ctaWrapEl) tl.to(ctaWrapEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1);
    if (trustedByTitleEl) tl.to(trustedByTitleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.2);
    const validLogoEls = logoItemEls.filter(Boolean);
    if (validLogoEls.length > 0) {
      tl.to(
        validLogoEls,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.08,
          onComplete: () => {
            for (const el of validLogoEls) {
              if (el) gsap.set(el, { clearProps: 'y,opacity' });
            }
          },
        },
        0.3
      );
    }
  }

  usePageEnter(revealSequence, { priority: 1, skip: prefersReducedMotion });

  function mount() {
    headlineHandle?.mount?.();
    subtextHandle?.mount?.();
  }

  function destroy() {
    headlineHandle?.destroy?.();
    subtextHandle?.destroy?.();
  }

  return { element: containerEl, mount, destroy };
}
