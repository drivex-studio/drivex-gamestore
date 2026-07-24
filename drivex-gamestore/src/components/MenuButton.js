
import { cx } from '../utils/cx.js';

export function initMenuButton(props = {}) {
  const { isOpen, onClick, className } = props;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = cx(
    'group flex cursor-pointer items-center gap-8 transition-colors transition-opacity duration-300 hover:opacity-70',
    'text-accent uppercase tracking-tight',
    className
  );
  button.setAttribute('aria-expanded', String(isOpen));
  button.setAttribute('aria-label', isOpen ? 'Close' : 'Menu');
  if (onClick) button.addEventListener('click', onClick);

  const labelStack = document.createElement('span');
  labelStack.className = 'relative h-[1em] w-[3.5em] overflow-hidden';
  const labelInner = document.createElement('span');
  labelInner.className = 'flex flex-col gap-2 transition-transform duration-300 ease-out';
  const translateY = isOpen ? 'calc(-1em - 2px)' : '0px';
  labelInner.style.transform = `translateY(${translateY})`;

  const menuLabel = document.createElement('span');
  menuLabel.className = 'block h-[1em] leading-none';
  menuLabel.textContent = 'Menu';
  const closeLabel = document.createElement('span');
  closeLabel.className = 'block h-[1em] leading-none';
  closeLabel.textContent = 'Close';
  labelInner.appendChild(menuLabel);
  labelInner.appendChild(closeLabel);
  labelStack.appendChild(labelInner);

  const iconStack = document.createElement('span');
  iconStack.className = 'relative flex h-16 w-16 flex-col items-center justify-center';
  const barTop = document.createElement('span');
  barTop.className = 'absolute h-[2px] w-full origin-center bg-current';
  barTop.style.transform = isOpen ? 'rotate(45deg) translateY(0px)' : 'rotate(0deg) translateY(-3px)';
  barTop.style.transition = 'transform 250ms ease-out';
  const barBottom = document.createElement('span');
  barBottom.className = 'absolute h-[2px] w-full origin-center bg-current';
  barBottom.style.transform = isOpen ? 'rotate(-45deg) translateY(0px)' : 'rotate(0deg) translateY(3px)';
  barBottom.style.transition = 'transform 250ms ease-out';
  iconStack.appendChild(barTop);
  iconStack.appendChild(barBottom);

  button.appendChild(labelStack);
  button.appendChild(iconStack);

  return button;
}