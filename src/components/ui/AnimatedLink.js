
import { cx } from '../../utils/cx.js';

export function AnimatedLink(props = {}) {
  const { children, className, asChild, indicator, ...rest } = props;

  if (asChild) {
    throw new Error("AnimatedLink(): 'asChild' is not supported in this vanilla conversion (see TODO in source file).");
  }

  const wrapperClass = indicator ? 'inline-flex items-center' : 'inline-block';
  const linkClass = cx(
    'group relative w-fit cursor-pointer',
    wrapperClass,
    'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    className
  );

  const a = document.createElement('a');
  a.className = linkClass;
  Object.entries(rest).forEach(([key, value]) => {
    if (key === 'href') a.href = value; else a.setAttribute(key, value);
  });

  if (indicator) {
    const dot = document.createElement('span');
    dot.className = cx(
      'absolute left-0 size-8 bg-brand lg:size-12',
      '-rotate-90 scale-0',
      'transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
      'group-hover:rotate-0 group-hover:scale-100',
      'group-focus-visible:rotate-0 group-focus-visible:scale-100'
    );
    dot.setAttribute('aria-hidden', 'true');
    a.appendChild(dot);

    const textSpan = document.createElement('span');
    textSpan.className = cx(
      'transition-transform duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]',
      'group-hover:translate-x-24',
      'group-focus-visible:translate-x-24'
    );
    if (typeof children === 'string') textSpan.textContent = children;
    else if (children instanceof Node) textSpan.appendChild(children);
    a.appendChild(textSpan);
  } else if (typeof children === 'string') {
    a.appendChild(document.createTextNode(children));
  } else if (children instanceof Node) {
    a.appendChild(children);
  }

  const underlineWrap = document.createElement('span');
  underlineWrap.className = cx(
    'pointer-events-none absolute inset-x-0 -bottom-1',
    indicator && ['transition-transform duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]', 'group-hover:translate-x-24 group-focus-visible:translate-x-24']
  );
  underlineWrap.setAttribute('aria-hidden', 'true');

  const lineTop = document.createElement('span');
  lineTop.className = cx(
    'absolute inset-x-0 top-0 h-px bg-current',
    'origin-left scale-x-100',
    'transition-transform duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)]',
    'delay-300 group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0',
    'group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0'
  );
  const lineBottom = document.createElement('span');
  lineBottom.className = cx(
    'absolute inset-x-0 top-0 h-px bg-current',
    'origin-right scale-x-0',
    'transition-transform duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)]',
    'delay-0 group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300',
    'group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300'
  );
  underlineWrap.appendChild(lineTop);
  underlineWrap.appendChild(lineBottom);
  a.appendChild(underlineWrap);

  return a;
}
