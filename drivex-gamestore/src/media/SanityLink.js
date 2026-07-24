import { cx, cva } from '../utils/cx.js'; 
import { appendChildValue, applyRestProps } from './shared/dom.js';
import { createIconElement, createPlusElement } from './Icon.js'; 
import { useModal } from '../hooks/useModal.js'; 

const x = cva({
  base: [
    'flex items-center justify-center',
    'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'
  ],
  variants: {
    size: { sm: 'size-40', default: 'size-48', lg: 'size-56' },
    position: { left: 'origin-left -rotate-45 scale-0', right: 'absolute right-0 z-10 origin-right rotate-0 scale-100' },
    theme: { light: 'bg-foreground text-background', dark: 'bg-foreground text-background', brand: 'bg-brand text-black' }
  },
  defaultVariants: { size: 'default', theme: 'light' }
});

const w = cva({
  base: [
    'flex w-full flex-1 items-center justify-center',
    'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'
  ],
  variants: {
    size: {
      sm: 'h-40 -translate-x-[calc(40px+6px)] px-12',
      default: 'h-48 -translate-x-[calc(48px+6px)] px-16',
      lg: 'h-56 -translate-x-[calc(56px+6px)] px-24'
    },
    theme: { light: 'bg-foreground text-background', dark: 'bg-foreground text-background', brand: 'bg-brand text-black' }
  },
  defaultVariants: { size: 'default', theme: 'light' }
});

export function SanityLink(props = {}) {
  const { link, children, animated, size, theme, ...restProps } = props;
  const resolvedSize = size === undefined ? 'default' : size;
  const resolvedTheme = theme === undefined ? 'light' : theme;
  const { isOpen, modalId, openModal } = useModal();
  const childContent = children ?? link.text;
  const activeModal = isOpen && modalId === link.modalId;
  let el;

  if (link.type === 'modal' && link.modalId) {
    function handleClick() {
      openModal(link.modalId);
    }

    if (animated) {
      el = document.createElement('button');
      el.type = 'button';
      el.className = cx(
        'group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
        'font-medium font-mono uppercase',
        'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        resolvedSize === 'sm' && 'text-body-sm',
        resolvedSize === 'default' && 'text-body',
        resolvedSize === 'lg' && 'text-body-lg',
        restProps.className
      );
      const wrapper = document.createElement('span');
      wrapper.className = 'relative flex w-full items-center gap-6';

      const left = document.createElement('span');
      left.className = cx(x({ size: resolvedSize, theme: resolvedTheme, position: 'left' }), 'group-hover:rotate-0 group-hover:scale-100', activeModal && 'rotate-0 scale-100');
      left.appendChild(createPlusElement({}));

      const label = document.createElement('span');
      label.className = cx(w({ size: resolvedSize, theme: resolvedTheme }), 'group-hover:translate-x-0', activeModal && 'translate-x-0');
      appendChildValue(label, childContent);

      const right = document.createElement('span');
      right.className = cx(x({ size: resolvedSize, theme: resolvedTheme, position: 'right' }), 'group-hover:-rotate-45 group-hover:scale-0', activeModal && '-rotate-45 scale-0');
      right.appendChild(createPlusElement({}));

      wrapper.appendChild(left);
      wrapper.appendChild(label);
      wrapper.appendChild(right);
      el.appendChild(wrapper);
      applyRestProps(el, restProps);
    } else {
      el = document.createElement('button');
      el.type = 'button';
      applyRestProps(el, restProps);
      appendChildValue(el, childContent);
    }

    el.addEventListener('click', handleClick);
    return el;
  }

  el = document.createElement('a');
  el.href = link.href;
  if (link.openInNewTab) el.target = '_blank';
  if (link.openInNewTab) el.rel = 'noopener noreferrer';
  if (link.canDownload) el.setAttribute('download', '');
  applyRestProps(el, restProps);
  appendChildValue(el, childContent);

  return el;
}

export function createSanityLinkIcon(props = {}) {
  const { link, ...restProps } = props;
  if (link.openInNewTab) return createIconElement({ name: 'arrow-up-right', ...restProps });
  if (link.canDownload) return createIconElement({ name: 'arrow-down', ...restProps });
  return createIconElement({ name: 'arrow-right', ...restProps });
}
