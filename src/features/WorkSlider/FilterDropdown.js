
import gsap from 'gsap';
import { cva } from 'class-variance-authority';
import { cx } from '../../utils/cx.js';
import { createArrowIcon } from './ArrowIcon.js';

const triggerVariants = cva({
  base: [
    'group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
    'text-accent-sm',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ],
  variants: {
    size: { sm: 'text-body-sm', default: 'text-body-sm lg:text-body', lg: 'text-body lg:text-body-lg' },
  },
  defaultVariants: { size: 'default' },
});

const iconWrapperVariants = cva({
  base: ['flex items-center justify-center', 'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'],
  variants: {
    size: { sm: 'size-32 lg:size-40', default: 'size-40 lg:size-48', lg: 'size-48 lg:size-56' },
    position: { left: 'origin-left -rotate-45 scale-0', right: 'absolute right-0 z-10 origin-right rotate-0 scale-100' },
    theme: { light: 'bg-foreground text-background', dark: 'bg-foreground text-background', brand: 'bg-brand text-black' },
  },
  defaultVariants: { size: 'default', theme: 'light' },
});

const labelWrapperVariants = cva({
  base: ['flex w-full flex-1 items-center justify-center gap-8', 'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'],
  variants: {
    size: {
      sm: 'h-32 -translate-x-[calc(32px+6px)] px-8 lg:h-40 lg:-translate-x-[calc(40px+6px)] lg:px-12',
      default: 'h-40 -translate-x-[calc(40px+6px)] px-12 lg:h-48 lg:-translate-x-[calc(48px+6px)] lg:px-16',
      lg: 'h-48 -translate-x-[calc(48px+6px)] px-16 lg:h-56 lg:-translate-x-[calc(56px+6px)] lg:px-24',
    },
    theme: { light: 'bg-foreground text-background', dark: 'bg-foreground text-background', brand: 'bg-brand text-black' },
  },
  defaultVariants: { size: 'default', theme: 'light' },
});

export function initFilterDropdown(parentEl, props = {}) {
  let { label, options = [], value, onChange, className, size = 'default', theme = 'light' } = props;

  let isOpen = false;

  const containerEl = document.createElement('div');
  containerEl.className = cx('relative', className);

  const leftIconWrap = document.createElement('span');
  const labelWrap = document.createElement('span');
  const rightIconWrap = document.createElement('span');
  const labelDot = document.createElement('span');
  labelDot.className = 'size-8 bg-brand';
  const labelSpan = document.createElement('span');
  labelSpan.className = 'text-accent-sm';

  leftIconWrap.appendChild(createArrowIcon('rotate-180'));
  rightIconWrap.appendChild(createArrowIcon());
  labelWrap.appendChild(labelDot);
  labelWrap.appendChild(labelSpan);

  const innerRow = document.createElement('span');
  innerRow.className = 'relative flex w-full items-center gap-6';
  innerRow.append(leftIconWrap, labelWrap, rightIconWrap);

  const triggerEl = document.createElement('button');
  triggerEl.type = 'button';
  triggerEl.setAttribute('aria-haspopup', 'listbox');
  triggerEl.appendChild(innerRow);
  containerEl.appendChild(triggerEl);

  const menuEl = document.createElement('div');
  menuEl.className = 'absolute top-full left-0 z-50 mt-8 min-w-200 origin-top-left bg-background md:min-w-0';
  menuEl.style.visibility = 'hidden';
  menuEl.style.opacity = '0';
  menuEl.setAttribute('role', 'listbox');
  menuEl.tabIndex = -1;
  menuEl.setAttribute('data-theme', 'dark');
  const menuListEl = document.createElement('div');
  menuListEl.className = 'py-8';
  menuEl.appendChild(menuListEl);
  containerEl.appendChild(menuEl);

  parentEl.appendChild(containerEl);

  const gsapContext = gsap.context(() => {}, containerEl);
  function animateMenu() {
    gsap.killTweensOf(menuEl);
    if (isOpen) {
      gsap.set(menuEl, { visibility: 'visible' });
      gsap.fromTo(menuEl, { opacity: 0, scale: 0.95, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' });
    } else {
      gsap.to(menuEl, {
        opacity: 0, scale: 0.95, y: -8, duration: 0.21, ease: 'power2.out',
        onComplete: () => gsap.set(menuEl, { visibility: 'hidden' }),
      });
    }
  }

  function setIsOpen(next) {
    isOpen = next;
    render();
    animateMenu();
  }

  function handleSelect(optionValue) {
    onChange?.(optionValue);
    setIsOpen(false);
  }

  function handleOptionKeyDown(e, optionValue) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(optionValue);
    }
  }

  function handleOutsideClick(e) {
    if (containerEl && !containerEl.contains(e.target)) setIsOpen(false);
  }
  document.addEventListener('mousedown', handleOutsideClick);

  function handleEscapeKey(e) {
    if (e.key === 'Escape') setIsOpen(false);
  }
  document.addEventListener('keydown', handleEscapeKey);

  function handleToggle() {
    setIsOpen(!isOpen);
  }
  triggerEl.addEventListener('click', handleToggle);

  function handleTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  }
  triggerEl.addEventListener('keydown', handleTriggerKeyDown);

  function render() {
    const optionsWithAll = [null, ...options];

    triggerEl.className = cx(triggerVariants({ size }), isOpen && 'group');
    leftIconWrap.className = cx(iconWrapperVariants({ size, theme, position: 'left' }), isOpen && 'rotate-0 scale-100');
    rightIconWrap.className = cx(iconWrapperVariants({ size, theme, position: 'right' }), isOpen && '-rotate-45 scale-0');
    labelWrap.className = cx(labelWrapperVariants({ size, theme }), isOpen && 'translate-x-0');
    triggerEl.setAttribute('aria-expanded', String(isOpen));
    triggerEl.setAttribute('data-open', String(isOpen));

    labelDot.style.display = value ? '' : 'none';
    labelSpan.textContent = value ?? (label ?? 'FILTER');

    menuListEl.innerHTML = '';
    optionsWithAll.forEach((option) => {
      const isSelected = option === value;
      const optionLabel = option ?? 'All';
      const optionEl = document.createElement('div');
      optionEl.setAttribute('role', 'option');
      optionEl.setAttribute('aria-selected', String(isSelected));
      optionEl.tabIndex = 0;
      optionEl.className = cx(
        'flex cursor-pointer items-center gap-8 px-16 py-8 transition-colors hover:bg-surface',
        isSelected && 'text-brand'
      );
      optionEl.addEventListener('keydown', (e) => handleOptionKeyDown(e, option));
      optionEl.addEventListener('click', () => handleSelect(option));

      if (isSelected) {
        const dot = document.createElement('span');
        dot.className = 'size-8 bg-brand';
        optionEl.appendChild(dot);
      }
      const text = document.createElement('span');
      text.className = 'text-accent-sm uppercase';
      text.textContent = `[${optionLabel}]`;
      optionEl.appendChild(text);

      menuListEl.appendChild(optionEl);
    });
  }

  render();

  function update(nextProps = {}) {
    if ('label' in nextProps) label = nextProps.label;
    if ('options' in nextProps) options = nextProps.options ?? [];
    if ('value' in nextProps) value = nextProps.value;
    if ('onChange' in nextProps) onChange = nextProps.onChange;
    if ('size' in nextProps) size = nextProps.size;
    if ('theme' in nextProps) theme = nextProps.theme;
    if ('className' in nextProps) containerEl.className = cx('relative', nextProps.className);
    render();
  }

  return {
    rootEl: containerEl,
    update,
    destroy: destroyFilterDropdown,
  };

  function destroyFilterDropdown() {
    document.removeEventListener('mousedown', handleOutsideClick);
    document.removeEventListener('keydown', handleEscapeKey);
    gsapContext.revert();
    containerEl.parentNode?.removeChild(containerEl);
  }
}
