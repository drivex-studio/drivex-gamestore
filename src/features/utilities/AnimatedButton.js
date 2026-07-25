import { Slot } from '../../lib/SlotClone.js';
import { Slottable } from '../../lib/Slottable.js';
import { useDualLayerScramble } from '../../utils/FlipIndicator.js';
import { cx, cva } from '../../utils/cx.js';

import { easings } from '../../utils/easings.js';

const buttonVariants = cva(
  [
    'AnimatedButton-Root',
    'AnimatedButton-Typography',
    'AnimatedButton-FocusRing',
    'AnimatedButton-Disabled',
  ],
  {
    variants: {
      variant: { primary: [] },
      size: { xs: 'AnimatedButton-Root--xs', sm: 'AnimatedButton-Root--sm', default: 'AnimatedButton-Root--default', lg: 'AnimatedButton-Root--lg' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

const crossWrapVariants = cva(
  ['AnimatedButton-CrossWrap', 'AnimatedButton-TransformTransition'],
  {
    variants: {
      size: { xs: 'AnimatedButton-CrossWrap--xs', sm: 'AnimatedButton-CrossWrap--sm', default: 'AnimatedButton-CrossWrap--default', lg: 'AnimatedButton-CrossWrap--lg' },
      position: { left: 'AnimatedButton-CrossWrap--left', right: 'AnimatedButton-CrossWrap--right' },
      theme: { light: 'AnimatedButton-CrossWrap--light', dark: 'AnimatedButton-CrossWrap--dark', brand: 'AnimatedButton-CrossWrap--brand' },
    },
    defaultVariants: { size: 'default', theme: 'light' },
  }
);

const labelWrapVariants = cva(
  ['AnimatedButton-LabelWrap', 'AnimatedButton-TransformTransition'],
  {
    variants: {
      size: {
        xs: 'AnimatedButton-LabelWrap--xs',
        sm: 'AnimatedButton-LabelWrap--sm',
        default: 'AnimatedButton-LabelWrap--default',
        lg: 'AnimatedButton-LabelWrap--lg',
      },
      theme: { light: 'AnimatedButton-LabelWrap--light', dark: 'AnimatedButton-LabelWrap--dark', brand: 'AnimatedButton-LabelWrap--brand' },
    },
    defaultVariants: { size: 'default', theme: 'light' },
  }
);

function createCrossIcon(className) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', cx('AnimatedButton-CrossIcon', className));
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
    wrapperEl.className = 'AnimatedButton-Content';

    const leftCrossWrapEl = document.createElement('span');
    leftCrossWrapEl.className = cx(crossWrapVariants({ size, theme, position: 'left' }), 'AnimatedButton-LeftCrossHover');
    leftCrossWrapEl.appendChild(createCrossIcon());
    wrapperEl.appendChild(leftCrossWrapEl);

    const labelWrapEl = document.createElement('span');
    labelWrapEl.className = cx(labelWrapVariants({ size, theme }), 'AnimatedButton-LabelHover');
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
    rightCrossWrapEl.className = cx(crossWrapVariants({ size, theme, position: 'right' }), 'AnimatedButton-RightCrossHover');
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
