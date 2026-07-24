
import { initSanityMedia } from '../../media/SanityMedia.js';
import { initLink } from '../../components/Link.js';
import { createSlideTrackTitle } from './SlideTrackTitle.js';

export function createSliderSlideCard(config) {
  const {
    item, index, springX, slideWidth, wrapWidth, centerOffset,
    totalWidth, containerWidth, onRegisterScramble, isDraggingRef, hasDraggedRef,
  } = config;

  let scrambleTriggerRef = null;
  const handleMouseEnter = () => scrambleTriggerRef?.();

  function computeItemX(springValue) {
    let x = index * wrapWidth + springValue + centerOffset;
    while (x > containerWidth + wrapWidth) x -= totalWidth;
    while (x < -(2 * wrapWidth)) x += totalWidth;
    return x;
  }

  function computeParallaxX(itemX) {
    return -((itemX + slideWidth / 2 - containerWidth / 2) / containerWidth * 150);
  }

  function handleClickCapture(e) {
    if (isDraggingRef.current || hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const href = item.uri ?? '#';

  const imageInner = document.createElement('div');
  imageInner.className = 'absolute inset-0 will-change-transform';
  if (item.mainImage) {
    
    initSanityMedia(imageInner, {
      media: item.mainImage,
      className: 'h-full w-full object-cover',
      imageProps: {
        sizes: '150vw',
        builderOptions: { sourceWidths: [800, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 3000, 3840] },
      },
    });
  }
  const imageWrap = document.createElement('div');
  imageWrap.className = 'relative w-full overflow-hidden';
  imageWrap.style.paddingBottom = '66.67%';
  imageWrap.appendChild(imageInner);

  const titleEl = createSlideTrackTitle(item.title, (trigger) => {
    scrambleTriggerRef = trigger;
    onRegisterScramble(index, trigger);
  });

  const metaRow = document.createElement('div');
  metaRow.className = 'mt-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16';
  metaRow.appendChild(titleEl);
  if (item.tags && item.tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'flex items-center gap-8 text-body text-foreground-muted';
    appendTagList(tagsEl, item.tags);
    metaRow.appendChild(tagsEl);
  }

  const rootEl = document.createElement('div');
  rootEl.className = 'will-change-transform';
  rootEl.style.position = 'absolute';
  rootEl.style.left = '0';
  rootEl.style.top = '0';
  rootEl.style.width = `${slideWidth}px`;

  const linkEl = initLink(rootEl, {
    href,
    className: 'group block overflow-hidden',
    dataCursorText: 'VIEW PROJECT',
    onMouseEnter: handleMouseEnter,
    onClick: handleClickCapture,
    draggable: false,
  });
  linkEl.append(imageWrap, metaRow);

  function applyDerivedPosition(springValue) {
    const itemX = computeItemX(springValue);
    rootEl.style.transform = `translateX(${itemX}px)`;
    const parallaxX = computeParallaxX(itemX);
    imageInner.style.transform = `translateX(${parallaxX}px) scale(1.225)`;
  }

  applyDerivedPosition(springX.get());
  const unsubscribe = springX.on('change', applyDerivedPosition);

  return {
    rootEl,
    destroy() {
      unsubscribe();
    },
  };
}

function appendTagList(parentEl, tags) {
  tags.forEach((tag, index) => {
    if (index > 0) {
      const sep = document.createElement('span');
      sep.className = 'text-foreground-muted';
      sep.textContent = '\u2014';
      parentEl.appendChild(sep);
    }
    const tagEl = document.createElement('span');
    tagEl.className = 'text-accent-sm uppercase';
    tagEl.textContent = `[${tag}]`;
    parentEl.appendChild(tagEl);
  });
}
