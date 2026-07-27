// Auto-split from app.js
import { cx } from '../utils/cx.js';

// ---- HeaderMenuButton ----
export class HeaderMenuButton {
  constructor(parentElement, props = {}) {
    // -- Props --
    const { isOpen = false, onClick, className, ...restProps } = props;
    this.isOpen = isOpen;                   
    this.onClick = onClick;                      
    this.className = className;       

    // -- DOM setup --
    this.el = document.createElement('button');
    this.el.type = 'button';

    Object.entries(restProps).forEach(([k, v]) => {
      if (typeof v !== 'function') this.el.setAttribute(k, v);
    });

    this.labelContainerEl = document.createElement('span');
    this.labelInnerEl = document.createElement('span');
    this.menuLabelEl = document.createElement('span');
    this.closeLabelEl = document.createElement('span');

    this.iconContainerEl = document.createElement('span');
    this.line1El = document.createElement('span');
    this.line2El = document.createElement('span');

    this.buildDOM();
    this.update(this.isOpen);

    // -- Behavioral event wiring --
    if (this.onClick) {
      this.el.addEventListener('click', this.handleClick);
    }

    if (parentElement) {
      parentElement.appendChild(this.el);
    }
  }

  handleClick = (e) => {
    if (this.onClick) {
      this.onClick(e);
    }
  };

  buildDOM() {
    this.labelContainerEl.className = 'relative h-[1em] w-[3.5em] overflow-hidden';
    this.labelInnerEl.className = 'flex flex-col gap-2 transition-transform duration-300 ease-out';
    
    this.menuLabelEl.className = 'block h-[1em] leading-none';
    this.menuLabelEl.textContent = 'Menu';
    
    this.closeLabelEl.className = 'block h-[1em] leading-none';
    this.closeLabelEl.textContent = 'Close';

    this.labelInnerEl.appendChild(this.menuLabelEl);
    this.labelInnerEl.appendChild(this.closeLabelEl);
    this.labelContainerEl.appendChild(this.labelInnerEl);

    this.iconContainerEl.className = 'relative flex h-16 w-16 flex-col items-center justify-center';
    
    this.line1El.className = 'absolute h-[2px] w-full origin-center bg-current';
    this.line1El.style.transition = 'transform 250ms ease-out';

    this.line2El.className = 'absolute h-[2px] w-full origin-center bg-current';
    this.line2El.style.transition = 'transform 250ms ease-out';

    this.iconContainerEl.appendChild(this.line1El);
    this.iconContainerEl.appendChild(this.line2El);

    this.el.appendChild(this.labelContainerEl);
    this.el.appendChild(this.iconContainerEl);
  }

  update(isOpen) {
    this.isOpen = isOpen;
    const p = isOpen ? 'calc(-1em - 2px)' : '0px';
    const b = isOpen ? 'rotate(45deg) translateY(0px)' : 'rotate(0deg) translateY(-3px)';
    const v = isOpen ? 'rotate(-45deg) translateY(0px)' : 'rotate(0deg) translateY(3px)';
    const y = isOpen ? 'Close' : 'Menu';

    const baseClass = cx(
      'group flex cursor-pointer items-center gap-8 transition-colors transition-opacity duration-300 hover:opacity-70',
      'text-accent uppercase tracking-tight',
      this.className
    );

    this.el.className = baseClass;
    this.el.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    this.el.setAttribute('aria-label', y);

    this.labelInnerEl.style.transform = `translateY(${p})`;
    this.line1El.style.transform = b;
    this.line2El.style.transform = v;
  }

  destroy() {
    if (this.onClick) {
      this.el.removeEventListener('click', this.handleClick);
    }
    this.el.remove();
  }
}

export { HeaderMenuButton };
