
import { cx } from '../../utils/cx.js';
import { createCaseStudyCard } from './CaseStudyCard.js';

export function createCaseStudyGrid(items, className) {
  const rootEl = document.createElement('div');
  rootEl.className = cx('grid-container', className);

  const gridEl = document.createElement('div');
  gridEl.className = 'grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3';
  items.forEach((item) => {
    
    gridEl.appendChild(createCaseStudyCard(item));
  });

  rootEl.appendChild(gridEl);
  return rootEl;
}
