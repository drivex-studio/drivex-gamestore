
import { animate, stagger } from '@motionone/dom';
import { cx } from '../utils/cx.js';

function splitIntoLines(el) {
  if (!el) return [];

  const originalHTML = el.innerHTML;
  const text = el.textContent || '';
  if (!text.trim()) return [];

  el.textContent = '';

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const tempSpans = words.map((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + (i < words.length - 1 ? '\u00A0' : '');
    span.style.display = 'inline-block';
    el.appendChild(span);
    return span;
  });

  let lineGroups = [];
  try {
    let currentTop = null;
    let currentGroup = [];
    tempSpans.forEach((span) => {
      const top = span.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) < 1) {
        currentGroup.push(span);
      } else {
        lineGroups.push(currentGroup);
        currentGroup = [span];
      }
      currentTop = top;
    });
    if (currentGroup.length) lineGroups.push(currentGroup);
  } catch (err) {
    el.innerHTML = originalHTML;
    return [];
  }

  if (lineGroups.length === 0) {
    el.innerHTML = originalHTML;
    return [];
  }

  el.textContent = '';
  const lineEls = lineGroups.map((group) => {
    const mask = document.createElement('div');
    mask.style.overflow = 'clip';
    mask.className = 'split-line-mask';

    const line = document.createElement('div');
    line.className = 'split-line';
    line.style.transform = 'translateY(100%)';
    line.style.willChange = 'transform';

    group.forEach((wordSpan) => line.appendChild(wordSpan));
    mask.appendChild(line);
    el.appendChild(mask);
    return line;
  });

  return lineEls;
}

export function initAnimatedText(parentEl, props = {}) {
  if (!parentEl) {
    console.warn('initAnimatedText: parentEl is required');
    return null;
  }

  const {
    children,
    className,
    staggerDelay = 0.03,
    duration = 0.5,
    delay = 0,
    margin = '0px 0px -10% 0px',
    revert = false,
  } = props;

  const spanEl = document.createElement('span');
  spanEl.className = cx('invisible', className);

  if (children != null) {
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child instanceof Node) {
        spanEl.appendChild(child);
      } else if (typeof child === 'string') {
        spanEl.appendChild(document.createTextNode(child));
      }
    });
  }

  parentEl.appendChild(spanEl);

  const originalHTML = spanEl.innerHTML;
  const lines = splitIntoLines(spanEl);

  if (lines.length === 0) {
    spanEl.classList.remove('invisible');
    return spanEl;
  }

  const isInsideProse = !!spanEl.closest('[data-animated-prose-context]');
  if (isInsideProse) {
    return spanEl;
  }

  let hasEnteredViewport = false;
  let hasAnimated = false;
  let activeAnimation = null;

  const runAnimation = () => {
    if (!hasEnteredViewport || hasAnimated) return;
    hasAnimated = true;

    spanEl.style.visibility = 'visible';
    spanEl.classList.remove('invisible');

    try {
      activeAnimation = animate(
        lines,
        { y: ['100%', '0%'] },
        {
          delay: stagger(staggerDelay, { startDelay: delay }),
          duration,
          easing: [0.33, 1, 0.68, 1],
        }
      );
      activeAnimation.finished
        ?.then(() => {
          if (revert) spanEl.innerHTML = originalHTML;
        })
        .catch(() => {});
    } catch (err) {
      console.warn('AnimatedText: animation failed, showing content instantly', err);
      lines.forEach((line) => {
        line.style.transform = 'translateY(0%)';
      });
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          hasEnteredViewport = true;
          runAnimation();
          observer.disconnect();
        }
      });
    },
    { rootMargin: margin }
  );
  observer.observe(spanEl);

  spanEl._animatedTextCleanup = () => {
    observer.disconnect();
    activeAnimation?.cancel?.();
  };

  return spanEl;
}

export function destroyAnimatedText(spanEl) {
  spanEl?._animatedTextCleanup?.();
  if (spanEl && spanEl.parentNode) {
    spanEl.parentNode.removeChild(spanEl);
  }
}
