import { initPageBuilderSection } from './features/utilities/PageBuilderSection.js';

import { initScrollAnimatedHeadline } from './features/utilities/ScrollAnimatedHeadline.js';
import { initCardsSectionClient } from './features/general/CardsSectionClient.js';
import { initAnimatedListSectionClient } from './features/general/AnimatedListSectionClient.js';
import { initFeaturedWorkSectionClient } from './features/general/FeaturedWorkSectionClient.js';
import { initIndexedGridSectionClient } from './features/general/indexedGridSectionClient.js';
import { initAccordionClient } from './features/general/AccordionClient.js';

import { cardsSectionData } from './data/cardsSectionData.js';
import { animatedListSectionData } from './data/animatedListSectionData.js';
import { featuredWorkSectionData } from './data/featuredWorkSectionData.js';
import { indexedGridSectionData } from './data/indexedGridSectionData.js';
import { accordionData, accordionSectionData } from './data/accordionData.js';

import { SanityImage } from './media/SanityImage.js';
import { initAnimatedProse } from './components/AnimatedProse.js';
import { initButtonGroup } from './features/utilities/ButtonGroup.js';
import { ctaSectionData } from './data/ctaSectionData.js';

export function initCardsSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'light');
  sectionEl.setAttribute('data-page-builder-section', 'cardsSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const gridContainerEl = document.createElement('div');
  gridContainerEl.className = 'grid-container';

  const gridLayoutEl = document.createElement('div');
  gridLayoutEl.className = 'grid-layout';

  const gridSpanEl = document.createElement('div');
  gridSpanEl.className = 'grid-span-12';

  const cardsSectionInstance = initCardsSectionClient({ cards: cardsSectionData });

  gridSpanEl.appendChild(cardsSectionInstance.element);
  gridLayoutEl.appendChild(gridSpanEl);
  gridContainerEl.appendChild(gridLayoutEl);
  sectionEl.appendChild(gridContainerEl);

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function destroy() {
    if (typeof cardsSectionInstance.destroy === 'function') {
      cardsSectionInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, destroy };
}

export function initAnimatedListSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'light');
  sectionEl.setAttribute('data-page-builder-section', 'animatedListSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const listSectionInstance = initAnimatedListSectionClient(sectionEl, animatedListSectionData);

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function mount() {
    if (typeof listSectionInstance.mount === 'function') {
      listSectionInstance.mount();
    }
  }

  function destroy() {
    if (typeof listSectionInstance.destroy === 'function') {
      listSectionInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, mount, destroy };
}

export function initFeaturedWorkSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'dark');
  sectionEl.setAttribute('data-page-builder-section', 'featuredWorkSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const featuredWorkInstance = initFeaturedWorkSectionClient(sectionEl, {
    section: featuredWorkSectionData,
  });

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function mount() {
    if (featuredWorkInstance && typeof featuredWorkInstance.mount === 'function') {
      featuredWorkInstance.mount();
    }
  }

  function destroy() {
    if (typeof featuredWorkInstance.destroy === 'function') {
      featuredWorkInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, mount, destroy };
}

export function initIndexedGridSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'light');
  sectionEl.setAttribute('data-page-builder-section', 'indexedGridSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const IndexedGridInstance = initIndexedGridSectionClient(sectionEl, {
    ...indexedGridSectionData,
  });

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function mount() {
    if (IndexedGridInstance && typeof IndexedGridInstance.mount === 'function') {
      IndexedGridInstance.mount();
    }
  }

  function destroy() {
    if (typeof IndexedGridInstance.destroy === 'function') {
      IndexedGridInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, mount, destroy };
}

export function initAccordionSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'dark');
  sectionEl.setAttribute('data-page-builder-section', 'accordionSection');
  sectionEl.className = 'bg-background py-64 lg:py-96';

  const gridContainerEl = document.createElement('div');
  gridContainerEl.className = 'grid-container';

  const gridLayoutEl = document.createElement('div');
  gridLayoutEl.className = 'grid-layout';

  const headingSpanEl = document.createElement('div');
  headingSpanEl.className = 'grid-span-12 lg:grid-span-4 sticky top-0 z-10 -mx-(--site-grid-margin) bg-background px-(--site-grid-margin) pt-header pb-32 lg:top-header lg:z-auto lg:mx-0 lg:bg-transparent lg:px-0 lg:pt-32';

  const headlineInstance = initScrollAnimatedHeadline({
    headline: accordionSectionData.headline,
  });
  headingSpanEl.appendChild(headlineInstance.element);

  const accordionSpanEl = document.createElement('div');
  accordionSpanEl.className = 'grid-span-12 lg:grid-span-6 lg:grid-start-6 mt-48 lg:mt-0';

  const accordionInstance = initAccordionClient(accordionSpanEl, accordionData);

  gridLayoutEl.appendChild(headingSpanEl);
  gridLayoutEl.appendChild(accordionSpanEl);
  gridContainerEl.appendChild(gridLayoutEl);
  sectionEl.appendChild(gridContainerEl);

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function mount() {
    headlineInstance.mount();
  }

  function destroy() {
    headlineInstance.destroy();
    if (typeof accordionInstance.destroy === 'function') {
      accordionInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, mount, destroy };
}

export function initCtaSection(mainContainer) {
  const data = ctaSectionData;

  const section = initPageBuilderSection({
    name: data.sectionType,
    theme: data.theme,
    padding: 'pt-64 lg:pt-128 pb-64 lg:pb-128',
    gridClassName: 'gap-y-48',
    mainContainer,
  });

  // ---- left column: headline + image ----
  const leftHeadline = section.registerInstance(
    initScrollAnimatedHeadline({ headline: data.content.leftColumn.headline })
  );

  const imageWrapEl = document.createElement('div');
  imageWrapEl.className = 'max-lg:!max-w-full w-full h-full';
  const imageInnerEl = document.createElement('div');
  imageInnerEl.className = 'overflow-hidden h-full';
  imageInnerEl.style.aspectRatio = '16 / 9';

  const imageInstance = SanityImage(imageInnerEl, {
    image: data.content.leftColumn.image,
    className: 'size-full',
  });
  if (imageInstance) section.registerInstance(imageInstance);

  imageWrapEl.appendChild(imageInnerEl);


  const leftColEl = document.createElement('div');
  leftColEl.className = 'flex h-full flex-col justify-start items-start gap-80';
  leftColEl.appendChild(leftHeadline.element);
  leftColEl.appendChild(imageWrapEl);

  section.addSpan('grid-span-12 lg:grid-span-6 lg:grid-start-1', leftColEl);

  // ---- right column: headline + contact info + buttons + note ----
  const rightColumn = data.content.rightColumn;

  const rightHeadline = section.registerInstance(
    initScrollAnimatedHeadline({ headline: rightColumn.headline })
  );

  const proseWrapEl = document.createElement('div');
  proseWrapEl.className = 'prose';
  const linesWrapEl = document.createElement('div');
  linesWrapEl.className = 'flex flex-col gap-16';
  proseWrapEl.appendChild(linesWrapEl);

  const contactLines = [rightColumn.contactInfo.email, rightColumn.contactInfo.subtext];
  contactLines.forEach((line) => {
    const paragraphEl = document.createElement('div');
    paragraphEl.className = 'text-body empty:hidden';
    paragraphEl.dataset.paragraph = 'true';
    section.registerInstance(initAnimatedProse(paragraphEl, { children: line }));
    linesWrapEl.appendChild(paragraphEl);
  });

  const ctaRowEl = document.createElement('div');
  ctaRowEl.className = 'flex items-start flex-col gap-16';
  const buttonGroupEl = initButtonGroup({
    buttonGroup: { layout: 'vertical', gap: 16, buttons: rightColumn.ctaButtons },
  });
  if (buttonGroupEl) ctaRowEl.appendChild(buttonGroupEl);

  const noteEl = document.createElement('p');
  noteEl.className = '!text-foreground';
  noteEl.textContent = rightColumn.note;

  const rightColEl = document.createElement('div');
  rightColEl.className = 'flex h-full flex-col justify-between items-start gap-16';
  rightColEl.appendChild(rightHeadline.element);
  rightColEl.appendChild(proseWrapEl);
  rightColEl.appendChild(ctaRowEl);
  rightColEl.appendChild(noteEl);

  section.addSpan('grid-span-12 lg:grid-span-4 lg:grid-start-8', rightColEl);

  return section;
}
