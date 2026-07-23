
import gsap from 'gsap';
import { cx } from '../../utils/cx.js';
import { SanityImage } from '../../media/SanityImage.js';

const DOT_TRANSITION = { duration: 0.8, ease: 'back.inOut(1.4)' };
const HIGHLIGHT_TRANSITION = { duration: 0.8, ease: 'back.inOut(1.4)' };

export function initSlideIndicator(parentEl, props = {}) {
  let { items = [], currentIndex = 0, onSelect, rotationCount, gap = 16, className } = props;

  const rootEl = document.createElement('div');
  rootEl.className = cx('relative flex flex-col items-center', className);

  const trackEl = document.createElement('div');
  trackEl.className = 'relative overflow-hidden';

  const highlightEl = document.createElement('div');
  highlightEl.className = 'pointer-events-none absolute top-0 z-10 h-full border border-foreground/30';
  highlightEl.style.width = '80px';
  trackEl.appendChild(highlightEl);

  const thumbsEl = document.createElement('div');
  thumbsEl.className = 'flex items-center';
  thumbsEl.style.gap = `${gap}px`;
  trackEl.appendChild(thumbsEl);

  rootEl.appendChild(trackEl);

  const progressTrackEl = document.createElement('div');
  progressTrackEl.className = 'relative mt-8';
  const progressDotEl = document.createElement('div');
  progressDotEl.className = 'absolute top-0 h-8 w-8 bg-brand';
  progressTrackEl.appendChild(progressDotEl);
  rootEl.appendChild(progressTrackEl);

  if (items.length > 0) parentEl.appendChild(rootEl);

  function renderThumbs() {
    thumbsEl.innerHTML = '';
    items.forEach((item, index) => {
      const isCurrent = index === currentIndex;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'group';
      button.setAttribute('aria-label', `Go to ${item.title ?? `slide ${index + 1}`}`);
      if (isCurrent) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', () => onSelect?.(index));

      const thumbWrap = document.createElement('div');
      thumbWrap.className = cx(
        'relative aspect-[16/9] w-80 overflow-hidden transition-opacity duration-300',
        isCurrent ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
      );
      if (item.mainImage?.image) {
        
        SanityImage(thumbWrap, {
          image: item.mainImage.image,
          alt: item.title ?? '',
          className: 'h-full w-full object-cover',
        });
      }
      button.appendChild(thumbWrap);
      thumbsEl.appendChild(button);
    });
  }

  function applyDimensions() {
    const itemCount = items.length;
    const totalTrackWidth = 80 * itemCount + (itemCount - 1) * gap;
    progressTrackEl.style.width = `${totalTrackWidth}px`;
  }

  function animatePositions() {
    const itemCount = items.length;
    if (itemCount === 0) return;
    const thumbWithGap = 80 + gap;
    const highlightX = currentIndex * thumbWithGap;
    const dotXBase = currentIndex * thumbWithGap + 40;
    const progressDotX = dotXBase - 4;
    const progressDotRotation = 90 * (rotationCount ?? 0);

    gsap.to(highlightEl, { x: highlightX, ...HIGHLIGHT_TRANSITION });
    gsap.to(progressDotEl, { x: progressDotX, rotate: progressDotRotation, ...DOT_TRANSITION });
  }

  function render() {
    if (items.length === 0) {
      rootEl.parentNode?.removeChild(rootEl);
      return;
    }
    if (!rootEl.parentNode) parentEl.appendChild(rootEl);
    renderThumbs();
    applyDimensions();
    animatePositions();
  }

  render();

  function update(nextProps = {}) {
    if ('items' in nextProps) items = nextProps.items ?? [];
    if ('currentIndex' in nextProps) currentIndex = nextProps.currentIndex;
    if ('onSelect' in nextProps) onSelect = nextProps.onSelect;
    if ('rotationCount' in nextProps) rotationCount = nextProps.rotationCount;
    if ('gap' in nextProps) gap = nextProps.gap;
    if ('className' in nextProps) rootEl.className = cx('relative flex flex-col items-center', nextProps.className);
    render();
  }

  function destroy() {
    rootEl.parentNode?.removeChild(rootEl);
  }

  return { rootEl, update, destroy };
}
