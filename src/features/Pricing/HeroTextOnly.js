
import { initAnimatedHeadline } from '../AnimatedHeadline.js';
import { initAnimatedSubtext } from '../AnimatedSubtext.js';

import { usePageEnter } from '../../hooks/usePageEnter.js';
import { usePageEnterContext } from '../../hooks/usePageEnterContext.js';
import { cx } from '../../utils/cx.js';

export function initHeroTextOnly({ headline, headlineLevel, headlineDisplay, subtext, className } = {}) {
  const { prefersReducedMotion } = usePageEnterContext();
  let hasRevealed = false;
  let headlineHandle = null;
  let subtextHandle = null;

  const rootEl = document.createElement('div');
  rootEl.className = cx('grid-container', className);

  const gridLayoutEl = document.createElement('div');
  gridLayoutEl.className = 'grid-layout items-center justify-center';
  rootEl.appendChild(gridLayoutEl);

  const contentEl = document.createElement('div');
  contentEl.className = 'grid-span-12 lg:grid-span-10 lg:grid-start-2 flex flex-col items-center gap-16 text-center lg:gap-24';
  gridLayoutEl.appendChild(contentEl);

  if (headline) {
    headlineHandle = initAnimatedHeadline({
      as: headlineLevel ?? 'h1',
      displayAs: headlineDisplay,
      className: 'text-foreground',
      skip: prefersReducedMotion,
      children: headline,
    });
    contentEl.appendChild(headlineHandle.element);
  }

  if (subtext) {
    subtextHandle = initAnimatedSubtext({
      className: 'max-w-2xl text-body text-foreground-muted',
      skip: prefersReducedMotion,
      children: subtext,
    });
    contentEl.appendChild(subtextHandle.element);
  }

  function revealSequence(delay = 0) {
    if (hasRevealed) return;
    hasRevealed = true;
    const t = delay + 0.3;
    headlineHandle?.reveal?.(t);
    subtextHandle?.reveal?.(t + 0.15);
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

  return { element: rootEl, mount, destroy };
}
