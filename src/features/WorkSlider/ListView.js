
import { cx } from '../../utils/cx.js';
import { initSanityMedia } from '../../media/SanityMedia.js';
import { initLink } from '../../components/Link.js';

const SPRING_TRANSITION = { stiffness: 300, damping: 30, mass: 0.5 };

export function createListView(items, className) {
  const rootEl = document.createElement('div');
  rootEl.className = cx('grid-container', className);

  const listEl = document.createElement('div');
  listEl.className = 'divide-y divide-foreground/10';
  items.forEach((item) => listEl.appendChild(createListItem(item)));

  rootEl.appendChild(listEl);
  return rootEl;
}

function createListItem(item) {
  
  const rootEl = document.createElement('div');
  rootEl.dataset.layoutId = item._id;

  const linkEl = initLink(rootEl, {
    href: item.uri ?? '#',
    className: 'group flex items-stretch',
    dataCursorText: 'VIEW PROJECT',
  });

  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'relative aspect-square w-80 shrink-0 overflow-hidden';
  if (item.mainImage) {
    
    initSanityMedia(mediaWrap, {
      media: item.mainImage,
      className: 'h-full w-full object-cover',
      imageProps: { sizes: '80px', builderOptions: { sourceWidths: [160, 240] } },
    });
  }

  const contentEl = document.createElement('div');
  contentEl.className = 'flex min-w-0 flex-1 items-center justify-between gap-8 px-16 py-12';
  const titleEl = document.createElement('h3');
  titleEl.className = 'truncate text-accent';
  titleEl.textContent = item.title;
  contentEl.appendChild(titleEl);

  if (item.tags && item.tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'xs:flex hidden shrink-0 items-center gap-8 text-body text-foreground-muted';
    appendTagList(tagsEl, item.tags);
    contentEl.appendChild(tagsEl);
  }

  linkEl.append(mediaWrap, contentEl);
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
