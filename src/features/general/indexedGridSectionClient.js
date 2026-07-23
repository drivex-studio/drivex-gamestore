import { initScrollAnimatedHeadline } from '../ScrollAnimatedHeadline.js';
import { initScrambleGroup } from '../../utils/ScrambleGroup.js'; 
import { initScrambleText } from '../../utils/ScrambleText.js'; 
import gsap from 'gsap';

export function initIndexedGridSectionClient(parentElement, props = {}) {
  const {
    className,
    headline,
    text,
    label,
    items = [],
    disableCursor = true,
    variant = 'standard',
    ...restProps
  } = props;

  const childInstances = [];
  const scrambleTriggers = [];
  const eventListeners = [];
  const isTwoColumn = variant === 'twoColumn';

  const el = document.createElement('div');
  const baseClass = 'grid-container';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  if ((headline && headline.text) || text || label) {
    const headerGrid = document.createElement('div');
    headerGrid.className = 'grid-layout mb-48 lg:mb-64';

    const mainHeaderCols = document.createElement('div');
    mainHeaderCols.className = `${isTwoColumn ? 'lg:grid-start-4 lg:grid-span-6 ' : ''}grid-span-12 flex flex-col gap-16 lg:flex-row lg:items-end lg:justify-between`.trim();

    if (headline && headline.text) {
      const headlineInst = initScrollAnimatedHeadline(mainHeaderCols, {
        headline: { text: headline.text, level: headline.level ?? 'h2' },
        className: 'lg:max-w-1/2'
      });
      if (headlineInst) childInstances.push(headlineInst);
    }

    if (text) {
      const textSpan = document.createElement('span');
      textSpan.className = 'section-label';
      textSpan.textContent = text;
      mainHeaderCols.appendChild(textSpan);
    }
    headerGrid.appendChild(mainHeaderCols);

    if (label) {
      const labelCols = document.createElement('div');
      labelCols.className = `${isTwoColumn ? 'lg:grid-start-4 lg:grid-span-6 ' : ''}grid-span-12 mt-32 flex items-center gap-8`.trim();

      const labelSquare = document.createElement('div');
      labelSquare.className = 'h-12 w-12 bg-brand';
      labelCols.appendChild(labelSquare);

      const labelSpan = document.createElement('span');
      labelSpan.className = 'text-accent-sm uppercase';
      labelSpan.textContent = label;
      labelCols.appendChild(labelSpan);

      headerGrid.appendChild(labelCols);
    }

    el.appendChild(headerGrid);
  }

  const itemsGridLayout = document.createElement('div');
  itemsGridLayout.className = 'grid-layout';

  let itemsContainer = itemsGridLayout;
  if (isTwoColumn) {
    const subGrid = document.createElement('div');
    subGrid.className = 'grid-span-12 lg:grid-start-4 lg:grid-span-6 lg:grid-subgrid';
    itemsGridLayout.appendChild(subGrid);
    itemsContainer = subGrid;
  }


  const scrambleGroupInst = initScrambleGroup(el, {
    stagger: 0.08,
    start: 'top 85%',
    children: itemsGridLayout
  });
  if (scrambleGroupInst) childInstances.push(scrambleGroupInst);

  items.forEach((item, n) => {
    const caseStudyTitle = item.caseStudy?.title;
    const reverseIndex = items.length - n - 1;
    const hasCursorText = !disableCursor && caseStudyTitle;

    const itemEl = document.createElement('div');
    itemEl.className = isTwoColumn
      ? 'grid-span-12 md:grid-span-6 lg:grid-span-3'
      : 'grid-span-12 md:grid-span-6 lg:grid-span-4';

    if (hasCursorText) {
      itemEl.setAttribute('data-cursor-text', caseStudyTitle.toUpperCase());
      itemEl.setAttribute('data-cursor-stripes-left', String(n));
      itemEl.setAttribute('data-cursor-stripes-right', String(reverseIndex));
    }

    const headerWrap = document.createElement('div');
    headerWrap.className = 'relative flex items-center pt-24 pb-16 lg:pt-32 lg:pb-20';

    const brandSquare = document.createElement('span');
    brandSquare.className = 'absolute top-1/2 left-0 hidden size-12 bg-brand lg:block';
    brandSquare.setAttribute('aria-hidden', 'true');
    gsap.set(brandSquare, { scale: 0, rotate: -90 });
    headerWrap.appendChild(brandSquare);

    const h3El = document.createElement('h3');
    h3El.className = 'text-accent uppercase';
    gsap.set(h3El, { x: 0 });

    const scrambleInst = initScrambleText(h3El, {
      duration: 0.5,
      revealMode: true,
      onReady: (trigger) => { scrambleTriggers[n] = trigger; },
      children: item.title
    });
    if (scrambleInst) childInstances.push(scrambleInst);

    headerWrap.appendChild(h3El);
    itemEl.appendChild(headerWrap);

    const divider = document.createElement('div');
    divider.className = 'h-px w-full bg-border';
    itemEl.appendChild(divider);

    const descEl = document.createElement('p');
    descEl.className = 'pt-16 pb-24 text-body text-foreground-muted lg:max-w-2/3 lg:pt-20 lg:pb-32';
    descEl.textContent = item.description;
    itemEl.appendChild(descEl);

    itemsContainer.appendChild(itemEl);

    function handleMouseEnter() {
      gsap.to(brandSquare, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out' });
      gsap.to(h3El, { x: 28, duration: 0.5, ease: 'power3.out' });
      if (scrambleTriggers[n]) scrambleTriggers[n]();
    }

    function handleMouseLeave() {
      gsap.to(brandSquare, { scale: 0, rotate: -90, duration: 0.5, ease: 'back.out' });
      gsap.to(h3El, { x: 0, duration: 0.5, ease: 'power3.out' });
    }

    itemEl.addEventListener('mouseenter', handleMouseEnter);
    itemEl.addEventListener('mouseleave', handleMouseLeave);
    
    eventListeners.push(
      { node: itemEl, event: 'mouseenter', handler: handleMouseEnter },
      { node: itemEl, event: 'mouseleave', handler: handleMouseLeave }
    );
  });


  function mount() {
    childInstances.forEach(inst => inst?.mount?.());
  }

  function destroy() {
    eventListeners.forEach(({ node, event, handler }) => {
      node.removeEventListener(event, handler);
    });
    childInstances.forEach(inst => inst?.destroy?.());
    gsap.killTweensOf(el.querySelectorAll('*'));
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, mount, destroy }; 
}
export default initIndexedGridSectionClient;
