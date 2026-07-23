
import { gsap, SplitText }from '../../vendor.js';
import { cx } from '../shared.js'; 
export function initAnimatedSubtext({ children, className, skip = false, staggerDelay = 0.05, duration = 0.8 } = {}) {
  let splitInstance = null; 

  const paragraphEl = document.createElement('p');
  paragraphEl.className = skip ? className : cx('invisible', className);
  renderTextWithBreaks(paragraphEl, children);

  function mount() {
    if (!skip) {
      splitInstance = new SplitText(paragraphEl, {
        type: 'lines',
        autoSplit: true,
        aria: false,
        deepSlice: true,
        reduceWhiteSpace: false,
        mask: 'lines',
        linesClass: 'split-line',
        onSplit: () => {
          
        },
      });
    }
  }

  function reveal(delay = 0) {
    if (!paragraphEl || !splitInstance || skip) return;
    const lines = splitInstance.lines ?? [];
    if (lines.length !== 0) {
      paragraphEl.style.visibility = 'visible';
      gsap.fromTo(lines, { y: '100%' }, { y: '0%', duration, ease: 'power3.out', stagger: staggerDelay, delay });
    }
  }

  function destroy() {
    splitInstance?.revert();
    splitInstance = null;
  }

  return { element: paragraphEl, mount, reveal, destroy };
}

function renderTextWithBreaks(parentEl, text) {
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    const span = document.createElement('span');
    span.textContent = line;
    parentEl.appendChild(span);
    if (index < lines.length - 1) parentEl.appendChild(document.createElement('br'));
  });
}
