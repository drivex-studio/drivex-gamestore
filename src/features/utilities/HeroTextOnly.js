import { getPageEnterContext, watchPageEnter } from '../shared.js';

import { initAnimatedHeadline } from './AnimatedHeadline.js';
import { initAnimatedSubtext } from './AnimatedSubtext.js';

import gsap from 'gsap';

// ---- HeroTextOnly ----
export function initHeroTextOnly(parentElement, props = {}) {
  const {
    headline,
    headlineLevel,
    headlineDisplay,
    subtext,
    className,
    ...restProps
  } = props;

  let isRevealed = false;
  const childInstances = [];

  const { prefersReducedMotion } = getPageEnterContext();

  const el = document.createElement('div');
  el.className = className ? `grid-container ${className}`.trim() : 'grid-container';

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  const layoutEl = document.createElement('div');
  layoutEl.className = 'grid-layout items-center justify-center';
  el.appendChild(layoutEl);

  const contentEl = document.createElement('div');
  contentEl.className = 'grid-span-12 lg:grid-span-10 lg:grid-start-2 flex flex-col items-center gap-16 text-center lg:gap-24';
  layoutEl.appendChild(contentEl);


  let headlineInstance = null;
  if (headline) {
    headlineInstance = initAnimatedHeadline({
      as: headlineLevel ?? 'h1',
      displayAs: headlineDisplay ?? undefined,
      className: 'text-foreground',
      skip: prefersReducedMotion,
      children: headline,
    });
    if (headlineInstance) {
      contentEl.appendChild(headlineInstance.element);
      headlineInstance.mount();
      childInstances.push(headlineInstance);
    }
  }

  let subtextInstance = null;
  if (subtext) {
    subtextInstance = initAnimatedSubtext({
      className: 'max-w-2xl text-body text-foreground-muted',
      skip: prefersReducedMotion,
      children: subtext,
    });
    if (subtextInstance) {
      contentEl.appendChild(subtextInstance.element);
      subtextInstance.mount();
      childInstances.push(subtextInstance);
    }
  }

  function handleReveal(e) {
    if (isRevealed) return;
    isRevealed = true;
    let t = e + 0.3;

    if (headlineInstance && typeof headlineInstance.reveal === 'function') {
      headlineInstance.reveal(t);
    }
    if (subtextInstance && typeof subtextInstance.reveal === 'function') {
      subtextInstance.reveal(t + 0.15);
    }
  }


  const pageEnterObserver = watchPageEnter(handleReveal, {
    priority: 1,
    skip: prefersReducedMotion,
  });

  function destroy() {
    if (pageEnterObserver && typeof pageEnterObserver.destroy === 'function') {
      pageEnterObserver.destroy();
    }
    childInstances.forEach(inst => inst?.destroy?.());
    gsap.killTweensOf(el);
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, reveal: handleReveal };
}
