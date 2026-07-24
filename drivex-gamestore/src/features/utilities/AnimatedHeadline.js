
import { gsap, ScrollTrigger } from '../../vendor.js';
import { useIdleGSAP, cx } from '../shared.js'; 

const HEADLINE_STYLE_MAP = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
  h6: 'text-h6',
};

export function initAnimatedHeadline({
  children,
  as = 'h1',
  displayAs,
  className,
  skip,
  trigger = 'manual',
  wrapperClassName,
} = {}) {
  const prefersReducedMotion = skip ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasRevealed = { current: false }; 
  let scrollTriggerInstance = null;

  const headlineClassName = cx(HEADLINE_STYLE_MAP[displayAs ?? as], className);

  const headlineEl = document.createElement(as);
  headlineEl.className = headlineClassName;

  const rawLines = String(children).split('\n');
  rawLines.forEach((lineText, lineIndex) => {
    if (lineIndex > 0) headlineEl.appendChild(document.createElement('br'));
    const words = lineText.split(/\s+/).filter(Boolean);
    words.forEach((word, wordIndex) => {
      if (wordIndex > 0) headlineEl.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.dataset.word = 'true';
      span.dataset.explicitLine = String(lineIndex);
      span.textContent = word;
      headlineEl.appendChild(span);
    });
  });

  let wrapperEl = null;
  let rootEl = headlineEl;
  if (trigger === 'scroll') {
    wrapperEl = document.createElement('div');
    wrapperEl.className = wrapperClassName;
    wrapperEl.appendChild(headlineEl);
    rootEl = wrapperEl;
  }

  function reveal(delay = 0) {
    if (hasRevealed.current || prefersReducedMotion || !headlineEl) return;
    hasRevealed.current = true;
    const lineEls = headlineEl.querySelectorAll('[data-line]');
    for (let i = 0; i < lineEls.length; i++) {
      const lineEl = lineEls[i];
      if (!lineEl) continue;
      const lineDelay = delay + 0.15 * i;
      const inner = lineEl.querySelector('[data-line-inner]');
      const brandRect = lineEl.querySelector('[data-brand-rect]');
      const fgRect = lineEl.querySelector('[data-fg-rect]');
      if (!inner || !brandRect || !fgRect) continue;
      const rects = [brandRect, fgRect];
      const tl = gsap.timeline({ delay: lineDelay });
      tl.to(brandRect, { scaleX: 1, duration: 0.45, ease: 'power3.inOut' }, 0);
      tl.to(fgRect, { scaleX: 1, duration: 0.45, ease: 'power3.inOut' }, 0.1);
      tl.set(inner, { opacity: 1 }, 0.5);
      tl.set(rects, { transformOrigin: 'right' }, 0.5);
      tl.to(fgRect, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.5);
      tl.to(brandRect, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.6);
    }
  }

  function reset() {
    hasRevealed.current = false;
    if (!headlineEl) return;
    gsap.set(headlineEl.querySelectorAll('[data-line-inner]'), { opacity: 0 });
    gsap.set(headlineEl.querySelectorAll('[data-brand-rect], [data-fg-rect]'), {
      scaleX: 0,
      transformOrigin: 'left',
    });
  }

  function rebuildAsLines(lines) {
    headlineEl.innerHTML = '';
    lines.forEach((lineText, lineIndex) => {
      if (lineIndex > 0) headlineEl.appendChild(document.createElement('br'));
      const lineEl = document.createElement('div');
      lineEl.dataset.line = String(lineIndex);
      lineEl.className = 'relative inline-block';

      const inner = document.createElement('span');
      inner.dataset.lineInner = 'true';
      inner.className = 'block whitespace-nowrap';
      inner.textContent = lineText;
      lineEl.appendChild(inner);

      if (!prefersReducedMotion) {
        const brandRect = document.createElement('div');
        brandRect.dataset.brandRect = 'true';
        brandRect.className = 'absolute -inset-x-[0.1em] -inset-y-[0.1em] bg-brand';
        const fgRect = document.createElement('div');
        fgRect.dataset.fgRect = 'true';
        fgRect.className = 'absolute -inset-x-[0.1em] -inset-y-[0.1em] bg-foreground';
        lineEl.appendChild(brandRect);
        lineEl.appendChild(fgRect);
      }

      headlineEl.appendChild(lineEl);
    });
  }

  function measureAndBuildLines() {
    const wordEls = headlineEl.querySelectorAll('[data-word]');
    if (wordEls.length === 0) return;
    const lines = [];
    let currentLineWords = [];
    let lastTop = -Infinity;
    let lastExplicitLine = -1;
    for (const wordEl of wordEls) {
      const top = wordEl.getBoundingClientRect().top;
      const explicitLine = Number(wordEl.dataset.explicitLine ?? -1);
      const explicitLineChanged = explicitLine !== lastExplicitLine && lastExplicitLine !== -1;
      if ((lastTop > -Infinity && top - lastTop > 2) || explicitLineChanged) {
        lines.push(currentLineWords.join(' '));
        currentLineWords = [];
      }
      currentLineWords.push(wordEl.textContent || '');
      lastTop = top;
      lastExplicitLine = explicitLine;
    }
    if (currentLineWords.length > 0) lines.push(currentLineWords.join(' '));

    rebuildAsLines(lines);

    if (!prefersReducedMotion) {
      gsap.set(headlineEl.querySelectorAll('[data-line-inner]'), { opacity: 0 });
      gsap.set(headlineEl.querySelectorAll('[data-brand-rect], [data-fg-rect]'), {
        scaleX: 0,
        transformOrigin: 'left',
      });
    }

    useIdleGSAP(() => {
      if (trigger !== 'scroll' || prefersReducedMotion) return;
      const scrollTarget = wrapperEl || headlineEl;
      if (scrollTarget) {
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: scrollTarget,
          start: 'top bottom',
          once: true,
          onEnter: () => reveal(),
        });
      }
    }, { dependencies: [trigger, prefersReducedMotion, lines] });
  }

  function mount() {
    measureAndBuildLines();
  }

  function destroy() {
    if (scrollTriggerInstance) scrollTriggerInstance.kill();
  }

  return { element: rootEl, mount, reveal, reset, destroy };
}
