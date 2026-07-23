
import { cx } from '../../utils/cx.js';

function createArrowButton({ pathD, label, onClick }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  svg.appendChild(path);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface';
  button.setAttribute('aria-label', label);
  button.appendChild(svg);
  button.addEventListener('click', onClick);
  return button;
}

export function createSliderNav(onPrev, onNext, className) {
  const rootEl = document.createElement('div');
  rootEl.className = cx('flex items-center gap-8', className);

  const prevButton = createArrowButton({ pathD: 'M10 12L6 8L10 4', label: 'Previous slide', onClick: onPrev });
  const nextButton = createArrowButton({ pathD: 'M6 4L10 8L6 12', label: 'Next slide', onClick: onNext });

  rootEl.append(prevButton, nextButton);
  return rootEl;
}
