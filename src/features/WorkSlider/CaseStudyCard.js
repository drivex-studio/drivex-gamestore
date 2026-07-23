import { initSanityMedia } from '../../media/SanityMedia.js';
import { initScrambleText } from '../../utils/ScrambleText.js';
import { initLink } from '../../components/Link.js';

const SPRING_TRANSITION = { stiffness: 300, damping: 30, mass: 0.5 };

export function createCaseStudyCard(item, className) {
  const { _id, title, uri, tags, mainImage } = item;
  const href = uri ?? '#';

  let scrambleTriggerRef = null;
  
  const handleMouseEnter = () => scrambleTriggerRef?.();

  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'relative w-full overflow-hidden';
  mediaWrap.style.paddingBottom = '66.67%';
  const mediaInner = document.createElement('div');
  mediaInner.className = 'absolute inset-0';
  mediaWrap.appendChild(mediaInner);

  if (mainImage) {
    
    initSanityMedia(mediaInner, {
      media: mainImage,
      className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
      imageProps: {
        sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
        builderOptions: { sourceWidths: [400, 600, 800, 1000, 1200, 1400] },
      },
    });
  }

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-accent';
  
  initScrambleText(titleEl, {
    duration: 0.5,
    text: title,
    onReady: (trigger) => { scrambleTriggerRef = trigger; },
  });

  const metaRow = document.createElement('div');
  metaRow.className = 'mt-16 flex items-start justify-between gap-16';
  metaRow.appendChild(titleEl);

  if (tags && tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'flex items-center gap-8 text-body text-foreground-muted';
    appendTagList(tagsEl, tags);
    metaRow.appendChild(tagsEl);
  }

  const rootEl = document.createElement('div');
  rootEl.className = className ?? '';
  rootEl.dataset.layoutId = _id;

  const linkEl = initLink(rootEl, {
    href,
    className: 'group block',
    dataCursorText: 'VIEW PROJECT',
    onMouseEnter: handleMouseEnter,
  });
  linkEl.append(mediaWrap, metaRow);

  return rootEl;
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
