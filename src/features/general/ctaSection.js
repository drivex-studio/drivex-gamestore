import { initPageBuilderSection } from '../utilities/PageBuilderSection.js';
import { initScrollAnimatedHeadline } from '../utilities/ScrollAnimatedHeadline.js';
import { initSanityImage } from '../shared.js';
import { initAnimatedProse } from '../../components/AnimatedProse.js';
import { initButtonGroup } from '../utilities/ButtonGroup.js';

export function initContactSection(mainContainer, data) {
  const section = initPageBuilderSection({
    name: 'ctaSection',
    theme: 'light',
    padding: 'lg',
    gridClassName: 'gap-y-48',
    mainContainer,
  });


  const leftHeadline = section.registerInstance(
    initScrollAnimatedHeadline({ headline: data.headline })
  );
  const leftHeadlineWrapEl = document.createElement('div');
  leftHeadlineWrapEl.appendChild(leftHeadline.element);

  const imageWrapEl = document.createElement('div');
  imageWrapEl.className = 'max-lg:!max-w-full w-full h-full';
  const imageInnerEl = document.createElement('div');
  imageInnerEl.className = 'overflow-hidden h-full';
  imageInnerEl.style.aspectRatio = '16 / 9';
  const imageEl = initSanityImage({
    image: data.image,
    className: 'size-full',
  });
  if (imageEl) imageInnerEl.appendChild(imageEl);
  imageWrapEl.appendChild(imageInnerEl);

  const leftColEl = document.createElement('div');
  leftColEl.className = 'flex h-full flex-col justify-start items-start gap-80';
  leftColEl.appendChild(leftHeadlineWrapEl);
  leftColEl.appendChild(imageWrapEl);

  section.addSpan('grid-span-12 lg:grid-span-6 lg:grid-start-1', leftColEl);


  const rightHeadline = section.registerInstance(
    initScrollAnimatedHeadline({ headline: data.aside.headline })
  );
  const rightHeadlineWrapEl = document.createElement('div');
  rightHeadlineWrapEl.appendChild(rightHeadline.element);

  const proseWrapEl = document.createElement('div');
  proseWrapEl.className = 'prose';
  const linesWrapEl = document.createElement('div');
  linesWrapEl.className = 'flex flex-col gap-16';
  proseWrapEl.appendChild(linesWrapEl);

  data.aside.text.split('\n').forEach((line) => {
    const paragraphEl = document.createElement('div');
    paragraphEl.className = 'text-body empty:hidden';
    paragraphEl.dataset.paragraph = 'true';
    const proseInstance = section.registerInstance(
      initAnimatedProse(paragraphEl, { children: line })
    );
    linesWrapEl.appendChild(paragraphEl);
  });

  const ctaRowEl = document.createElement('div');
  ctaRowEl.className = 'flex items-start flex-col gap-16';
  const buttonGroupEl = initButtonGroup({
    buttonGroup: { layout: 'vertical', gap: 16, buttons: data.aside.buttons },
  });
  if (buttonGroupEl) ctaRowEl.appendChild(buttonGroupEl);

  const noteEl = document.createElement('p');
  noteEl.className = '!text-foreground';
  noteEl.textContent = data.aside.note;

  const rightColEl = document.createElement('div');
  rightColEl.className = 'flex h-full flex-col justify-between items-start gap-16';
  rightColEl.appendChild(rightHeadlineWrapEl);
  rightColEl.appendChild(proseWrapEl);
  rightColEl.appendChild(ctaRowEl);
  rightColEl.appendChild(noteEl);

  section.addSpan('grid-span-12 lg:grid-span-4 lg:grid-start-8', rightColEl);

  return section;
}
