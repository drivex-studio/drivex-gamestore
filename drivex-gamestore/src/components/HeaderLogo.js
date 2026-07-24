import { cx } from '../utils/cx.js';
import { initLogoGood } from './LogoGood.js';
import { initLogoFella } from './LogoFella.js';

export function initHeaderLogo(parentElement, props = {}) {
  const { isMenuOpen = false, className } = props;

  const link = document.createElement('a');
  link.href = '/';
  link.setAttribute('aria-label', 'Good Fella - Home');
  link.className = cx('relative block h-24 shrink-0 overflow-hidden transition-colors duration-300', className);

  const track = document.createElement('div');
  track.className = 'flex flex-col gap-2 transition-transform duration-500 ease-out';
  track.style.transform = `translateY(${isMenuOpen ? -26 : 0}px)`;

  const goodWrap = document.createElement('div');
  goodWrap.className = 'h-24 shrink-0';
  initLogoGood(goodWrap, { className: 'h-24 w-auto' });

  const fellaWrap = document.createElement('div');
  fellaWrap.className = 'h-24 shrink-0';
  initLogoFella(fellaWrap, { className: 'h-24 w-auto' });

  track.appendChild(goodWrap);
  track.appendChild(fellaWrap);
  link.appendChild(track);

  parentElement.appendChild(link);

  return {
    el: link,
    setMenuOpen(nextIsMenuOpen) {
      track.style.transform = `translateY(${nextIsMenuOpen ? -26 : 0}px)`;
    },
  };
}
