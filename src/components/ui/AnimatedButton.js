
import { Slot } from '../../lib/SlotClone.js';
import { Slottable } from '../../lib/Slottable.js';
import { useDualLayerScramble } from '../../utils/FlipIndicator.js';
import { cx, cva } from '../../utils/cx.js';

import { easings } from '../../utils/easings.js';

const buttonVariants = cva(
  [
    'group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
    'font-medium font-mono uppercase',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: { primary: [] },
      size: { xs: 'text-body-sm', sm: 'text-body-sm', default: 'text-body-sm lg:text-body', lg: 'text-body lg:text-body-lg', cta: 'text-body' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

const crossWrapVariants = cva(
  ['flex items-center justify-center', 'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'],
  {
    variants: {
      size: { xs: 'size-32', sm: 'size-32 lg:size-40', default: 'size-40 lg:size-48', lg: 'size-48 lg:size-56', cta: 'size-48' },
      position: { left: 'origin-left -rotate-45 scale-0', right: 'absolute right-0 z-10 origin-right rotate-0 scale-100' },
      theme: { light: 'bg-foreground text-background', dark: 'bg-foreground text-background', brand: 'bg-brand text-black' },
    },
    defaultVariants: { size: 'default', theme: 'light' },
  }
);

const labelWrapVariants = cva(
  ['flex w-full flex-1 items-center justify-center', 'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'],
  {
    variants: {
      size: {
        xs: 'h-32 -translate-x-[calc(32px+6px)] px-8',
        sm: 'h-32 -translate-x-[calc(32px+6px)] px-8 lg:h-40 lg:-translate-x-[calc(40px+6px)] lg:px-12',
        default: 'h-40 -translate-x-[calc(40px+6px)] px-12 lg:h-48 lg:-translate-x-[calc(48px+6px)] lg:px-16',
        lg: 'h-48 -translate-x-[calc(48px+6px)] px-16 lg:h-56 lg:-translate-x-[calc(56px+6px)] lg:px-24',
        cta: 'h-48 -translate-x-[calc(48px+6px)] px-16',
      },
      theme: { light: 'bg-foreground text-background', dark: 'bg-foreground text-background', brand: 'bg-brand text-black' },
    },
    defaultVariants: { size: 'default', theme: 'light' },
  }
);

function createCrossIcon(className) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', cx('size-[0.75em]', className));
  svg.setAttribute('viewBox', '0 0 12 12');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', 'M6 1v10M1 6h10');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'square');
  svg.appendChild(path);
  return svg;
}

export function initAnimatedButton(mountTarget, props = {}) {
  const { children, className, asChild, variant, size, theme, type, ...restProps } = props;
  const resolvedType = type === undefined ? (asChild ? undefined : 'button') : type; 

  const scrambleColors =
    theme === 'brand'
      ? { firstColorClass: 'scramble-white', secondColorClass: 'scramble-inherit' }
      : { firstColorClass: 'scramble-brand', secondColorClass: 'scramble-inherit' }; 
  const { firstColorClass, secondColorClass } = scrambleColors;

  let scrambleInstance = null; 

  let hasScrambled = false; 
  const handleMouseEnter = () => {
    if (!hasScrambled) {
      hasScrambled = true;
      scrambleInstance?.scramble();
    }
  }; 
  const handleMouseLeave = () => {
    hasScrambled = false;
  }; 

  const rootClassName = buttonVariants({ variant, size, className }); 

  function buildAnimatedContent(contentNodes) {
    const wrapperEl = document.createElement('span');
    wrapperEl.className = 'relative flex w-full items-center gap-6';

    const leftCrossWrapEl = document.createElement('span');
    leftCrossWrapEl.className = cx(crossWrapVariants({ size, theme, position: 'left' }), 'group-hover:rotate-0 group-hover:scale-100');
    leftCrossWrapEl.appendChild(createCrossIcon());
    wrapperEl.appendChild(leftCrossWrapEl);

    const labelWrapEl = document.createElement('span');
    labelWrapEl.className = cx(labelWrapVariants({ size, theme }), 'group-hover:translate-x-0');
    const labelInnerEl = document.createElement('span');
    const nodes = Array.isArray(contentNodes) ? contentNodes : [contentNodes];
    nodes.forEach((node) => {
      if (node instanceof Node) labelInnerEl.appendChild(node);
      else if (node != null) labelInnerEl.appendChild(document.createTextNode(String(node)));
    });
    
    scrambleInstance = useDualLayerScramble(labelInnerEl, {
      duration: 0.5,
      firstColorClass,
      secondColorClass,
    });
    labelWrapEl.appendChild(labelInnerEl);
    wrapperEl.appendChild(labelWrapEl);

    const rightCrossWrapEl = document.createElement('span');
    rightCrossWrapEl.className = cx(crossWrapVariants({ size, theme, position: 'right' }), 'group-hover:-rotate-45 group-hover:scale-0');
    rightCrossWrapEl.appendChild(createCrossIcon());
    wrapperEl.appendChild(rightCrossWrapEl);

    return wrapperEl;
  }

  let rootEl;
  if (asChild && children instanceof Node) {
    
    const slottedEl = Slottable({ asChild, child: children, children: buildAnimatedContent });
    rootEl = Slot(
      { type: resolvedType, className: rootClassName, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, ...restProps },
      slottedEl
    );
  } else {
    rootEl = document.createElement('button');
    if (resolvedType !== undefined) rootEl.setAttribute('type', resolvedType);
    rootEl.className = rootClassName;
    rootEl.addEventListener('mouseenter', handleMouseEnter);
    rootEl.addEventListener('mouseleave', handleMouseLeave);
    for (const [key, value] of Object.entries(restProps)) {
      if (key.startsWith('on') && typeof value === 'function') {
        rootEl.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value !== undefined) {
        rootEl.setAttribute(key, value);
      }
    }
    rootEl.appendChild(buildAnimatedContent(children));
  }

  if (mountTarget) mountTarget.appendChild(rootEl);

  function destroy() {
    rootEl.removeEventListener('mouseenter', handleMouseEnter);
    rootEl.removeEventListener('mouseleave', handleMouseLeave);
    scrambleInstance?.destroy();
  }

  return { el: rootEl, destroy };
}
