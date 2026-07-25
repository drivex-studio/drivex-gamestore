import { initScrollAnimatedHeadline } from '../utilities/ScrollAnimatedHeadline.js';
import { initSanityMedia } from '../../media/SanityMedia.js';
import { SanityImage } from '../../media/SanityImage.js';
import { getLenis } from '../../lib/lenisState.js';
import { gsap, ScrollTrigger } from '../../vendor.js';

function createEl(tag, className = '', children = []) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  children.forEach((child) => {
    if (!child) return;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}

export function initAnimatedListSectionClient(parentElement, props = {}) {
  const {
    headline,
    label,
    text,
    items = [],
    variant = 'standard',
    headlineDisplay,
    fixedMedia,
    className,
    ...restProps
  } = props;

  const isImageLeft = variant === 'imageLeft';
  let activeIndex = 0;
  let rotationMultiplier = 0;
  let indicatorY = 0;
  const childInstances = [];

  const el = document.createElement('div');
  el.className = className ? className.trim() : '';
  Object.entries(restProps).forEach(([key, value]) => {
    if (typeof value !== 'function') el.setAttribute(key, value);
  });

  let desktopContainerEl;
  let indicatorEl;
  let imageTrackEl;
  const itemEls = [];

  function appendHeadline(targetEl, extraClassName) {
    if (!headline?.text) return;
    const headlineInst = initScrollAnimatedHeadline({
      headline: { text: headline.text, level: headline.level ?? 'h2' },
      displayAs: headlineDisplay ?? headline.level ?? 'h2',
      className: extraClassName,
    });
    if (headlineInst?.element) targetEl.appendChild(headlineInst.element);
    childInstances.push(headlineInst);
  }

  function buildListItems(container) {
    items.forEach((item, index) => {
      const itemEl = createEl('div', 'flex cursor-pointer items-start gap-16 pl-16');
      itemEl.setAttribute('data-active', index === 0 ? 'true' : 'false');

      const indexEl = createEl('span', 'mt-4 font-mono text-body text-foreground-muted', [String(index + 1).padStart(2, '0')]);
      const bodyEl = createEl('div', 'flex-1', [
        createEl('h3', 'mb-8 text-h4', [item.headline ?? '']),
        createEl('p', 'text-body text-foreground-muted', [item.text ?? '']),
      ]);

      itemEl.appendChild(indexEl);
      itemEl.appendChild(bodyEl);
      container.appendChild(itemEl);
      itemEls.push({ el: itemEl, index });
    });
  }

  // --- Desktop layout ---
  desktopContainerEl = createEl('div', 'relative hidden min-h-[320vh] py-64 lg:block lg:py-128');
  const stickyEl = createEl('div', 'sticky top-0 flex h-screen items-center');
  const gridContainerEl = createEl('div', 'grid-container');
  const gridLayoutEl = createEl('div', 'grid-layout');

  if (isImageLeft) {
    const leftColEl = createEl('div', 'lg:grid-start-2 lg:grid-span-4 flex flex-col justify-between gap-32');
    const textWrapEl = createEl('div');

    appendHeadline(textWrapEl);
    if (text) textWrapEl.appendChild(createEl('p', 'mt-16 text-body text-foreground-muted', [text]));
    if (label) textWrapEl.appendChild(createEl('span', 'section-label mt-16 block', [label]));
    leftColEl.appendChild(textWrapEl);

    if (fixedMedia) {
      const mediaWrapEl = createEl('div', 'overflow-hidden');
      mediaWrapEl.style.aspectRatio = fixedMedia.aspectRatio ?? '4/5';
      const mediaInst = initSanityMedia(mediaWrapEl, {
        media: fixedMedia,
        className: '[&_img]:!h-full [&_img]:!w-full h-full w-full [&_img]:absolute [&_img]:inset-0 [&_img]:object-cover',
      });
      childInstances.push(mediaInst);
      leftColEl.appendChild(mediaWrapEl);
    }

    const rightColEl = createEl('div', 'lg:grid-start-7 lg:grid-span-5 flex flex-col justify-center');
    const listWrapEl = createEl('div', 'relative space-y-48');

    indicatorEl = createEl('div', 'absolute top-8 left-[28px] z-10 h-12 w-12 bg-brand');
    listWrapEl.appendChild(indicatorEl);
    buildListItems(listWrapEl);

    rightColEl.appendChild(listWrapEl);
    gridLayoutEl.appendChild(leftColEl);
    gridLayoutEl.appendChild(rightColEl);
  } else {
    const subGridEl = createEl('div', 'grid-start-3 grid-span-8 grid-subgrid');
    const headerRowEl = createEl('div', 'grid-span-8 mb-64 flex items-end justify-between');
    const headerTextWrapEl = createEl('div');

    appendHeadline(headerTextWrapEl);
    if (text) headerTextWrapEl.appendChild(createEl('p', 'mt-16 text-body text-foreground-muted', [text]));
    headerRowEl.appendChild(headerTextWrapEl);
    if (label) headerRowEl.appendChild(createEl('span', 'section-label', [label]));

    const contentRowEl = createEl('div', 'grid-span-8 flex');
    const listColEl = createEl('div', 'flex flex-col justify-center lg:flex-[1.1] lg:pr-[10%]');
    const listWrapEl = createEl('div', 'relative space-y-48');

    indicatorEl = createEl('div', 'absolute top-8 left-[28px] z-10 h-12 w-12 bg-brand');
    listWrapEl.appendChild(indicatorEl);
    buildListItems(listWrapEl);
    listColEl.appendChild(listWrapEl);

    const imageColEl = createEl('div', 'relative aspect-[4/5] flex-1 overflow-hidden');
    imageTrackEl = createEl('div', 'flex h-full flex-col');

    items.forEach((item) => {
      const imgWrapEl = createEl('div', 'h-full w-full flex-shrink-0');
      if (item.image) {
        const imgInst = SanityImage(imgWrapEl, {
          image: item.image,
          alt: item.alt ?? item.headline ?? '',
          className: '[&_img]:!h-full [&_img]:!w-full h-full w-full [&_img]:absolute [&_img]:inset-0 [&_img]:object-cover',
        });
        childInstances.push(imgInst);
      }
      imageTrackEl.appendChild(imgWrapEl);
    });
    imageColEl.appendChild(imageTrackEl);

    contentRowEl.appendChild(listColEl);
    contentRowEl.appendChild(imageColEl);
    subGridEl.appendChild(headerRowEl);
    subGridEl.appendChild(contentRowEl);
    gridLayoutEl.appendChild(subGridEl);
  }

  gridContainerEl.appendChild(gridLayoutEl);
  stickyEl.appendChild(gridContainerEl);
  desktopContainerEl.appendChild(stickyEl);
  el.appendChild(desktopContainerEl);

  // --- Mobile layout ---
  const mobileContainerEl = createEl('div', 'grid-container py-64 lg:hidden');
  const mobileHeaderEl = createEl('div', 'mb-32');

  appendHeadline(mobileHeaderEl, 'mb-16');
  if (label) mobileHeaderEl.appendChild(createEl('span', 'section-label', [label]));
  if (text) mobileHeaderEl.appendChild(createEl('p', 'mt-16 text-body text-foreground-muted', [text]));
  mobileContainerEl.appendChild(mobileHeaderEl);

  if (isImageLeft && fixedMedia) {
    const mobileMediaEl = createEl('div', 'mb-48 overflow-hidden');
    mobileMediaEl.style.aspectRatio = fixedMedia.aspectRatio ?? '4/5';
    const mediaInst = initSanityMedia(mobileMediaEl, {
      media: fixedMedia,
      className: 'h-full w-full',
    });
    childInstances.push(mediaInst);
    mobileContainerEl.appendChild(mobileMediaEl);
  }

  const mobileListWrapEl = createEl('div', 'space-y-48');
  items.forEach((item, index) => {
    const rowEl = createEl('div', 'space-y-16');
    const rowHeaderEl = createEl('div', 'flex gap-16');

    const numWrapEl = createEl('div', 'flex items-start gap-12', [
      createEl('div', 'mt-8 h-12 w-12 bg-brand'),
      createEl('span', 'mt-4 font-mono text-body-sm text-foreground-muted', [String(index + 1).padStart(2, '0')]),
    ]);
    const bodyEl = createEl('div', 'flex-1', [
      createEl('h3', 'mb-8 text-h4', [item.headline ?? '']),
      createEl('p', 'text-body text-foreground-muted', [item.text ?? '']),
    ]);
    rowHeaderEl.appendChild(numWrapEl);
    rowHeaderEl.appendChild(bodyEl);
    rowEl.appendChild(rowHeaderEl);

    if (!isImageLeft && item.image) {
      const imgWrapEl = createEl('div', 'aspect-[4/5] overflow-hidden');
      const imgInst = SanityImage(imgWrapEl, {
        image: item.image,
        alt: item.alt ?? item.headline ?? '',
        className: 'h-full w-full',
      });
      childInstances.push(imgInst);
      rowEl.appendChild(imgWrapEl);
    }
    mobileListWrapEl.appendChild(rowEl);
  });
  mobileContainerEl.appendChild(mobileListWrapEl);
  el.appendChild(mobileContainerEl);

  // --- Behavior wiring ---
  function scrollToItem(index) {
    const lenis = getLenis();
    if (!desktopContainerEl || !lenis) return;

    const rect = desktopContainerEl.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const scrollableHeight = desktopContainerEl.scrollHeight - window.innerHeight;
    const totalItemsMinusOne = items.length - 1;

    const scrollFactor = index === 0
      ? 0.08333333333333333
      : 0.16666666666666666 + (0.8333333333333334 / totalItemsMinusOne) * (index - 0.5);

    const targetScroll = scrollTop + scrollFactor * scrollableHeight;

    lenis.scrollTo(targetScroll, {
      duration: 0.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  }

  const clickHandlers = [];
  itemEls.forEach(({ el: itemEl, index }) => {
    const handler = () => scrollToItem(index);
    itemEl.addEventListener('click', handler);
    clickHandlers.push({ el: itemEl, handler });
  });

  function updateVisuals() {
    if (itemEls.length > 0 && itemEls[activeIndex] && itemEls[0]) {
      const firstRect = itemEls[0].el.getBoundingClientRect();
      const activeRect = itemEls[activeIndex].el.getBoundingClientRect();
      indicatorY = activeRect.top - firstRect.top;
    }

    if (indicatorEl) {
      gsap.to(indicatorEl, {
        y: indicatorY,
        rotation: 90 * rotationMultiplier,
        duration: 0.8,
        ease: 'back.inOut(1.2)',
      });
    }

    itemEls.forEach(({ el: itemEl, index }) => {
      const isActive = index === activeIndex;
      itemEl.setAttribute('data-active', isActive ? 'true' : 'false');
      gsap.to(itemEl, {
        opacity: isActive ? 1 : 0.4,
        x: isActive ? 48 : 0,
        duration: 0.8,
        ease: 'power3.inOut',
      });
    });

    if (imageTrackEl) {
      gsap.to(imageTrackEl, {
        y: `-${100 * activeIndex}%`,
        duration: 0.8,
        ease: 'power3.inOut',
      });
    }
  }

  function handleResize() {
    updateVisuals();
  }
  window.addEventListener('resize', handleResize);

  itemEls.forEach(({ el: itemEl }) => gsap.set(itemEl, { opacity: 0.4, x: 0 }));
  if (itemEls[0]) gsap.set(itemEls[0].el, { opacity: 1, x: 48 });
  if (indicatorEl) gsap.set(indicatorEl, { y: 0, rotation: 0 });
  if (imageTrackEl) gsap.set(imageTrackEl, { y: '0%' });

  // Deferred to the next animation frame: by then `el` has already been
  // appended into the live DOM (see bottom of this function), so
  // ScrollTrigger measures real, laid-out geometry instead of a detached node.
  let scrollTrigger;
  requestAnimationFrame(() => {
    updateVisuals();

    scrollTrigger = ScrollTrigger.create({
      trigger: desktopContainerEl,
      start: 'start start',
      end: 'end end',
      onUpdate: (self) => {
        const progress = self.progress;
        const totalItems = items.length;
        let newIndex = 0;

        if (progress >= 0.16666666666666666) {
          newIndex = Math.min(
            Math.floor(((progress - 0.16666666666666666) / 0.8333333333333334) * (totalItems - 1)) + 1,
            totalItems - 1
          );
        }

        if (newIndex !== activeIndex) {
          activeIndex = newIndex;
          rotationMultiplier += 1;
          updateVisuals();
        }
      },
    });
  });

  function mount() {
    childInstances.forEach((inst) => inst?.mount?.());
  }

  function destroy() {
    window.removeEventListener('resize', handleResize);
    clickHandlers.forEach(({ el: itemEl, handler }) => {
      itemEl.removeEventListener('click', handler);
    });

    if (scrollTrigger) scrollTrigger.kill();
    if (indicatorEl) gsap.killTweensOf(indicatorEl);
    if (imageTrackEl) gsap.killTweensOf(imageTrackEl);

    itemEls.forEach(({ el: itemEl }) => gsap.killTweensOf(itemEl));
    childInstances.forEach((inst) => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, element: el, mount, destroy };
}

export default initAnimatedListSectionClient;
