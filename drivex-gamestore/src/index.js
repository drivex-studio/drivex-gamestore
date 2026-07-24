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

