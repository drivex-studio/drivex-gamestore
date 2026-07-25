import { cx } from '../../utils/cx.js';
import { Slot } from '../../lib/SlotClone.js';
import { Slottable } from '../../lib/Slottable.js';

function buildIndicatorDot() {
  const dot = document.createElement('span');
  dot.className = cx(
    'absolute left-0 size-8 bg-brand lg:size-12',
    '-rotate-90 scale-0',
    'transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
    'group-hover:rotate-0 group-hover:scale-100',
    'group-focus-visible:rotate-0 group-focus-visible:scale-100'
  );
  dot.setAttribute('aria-hidden', 'true');
  return dot;
}

function buildUnderline(indicator) {
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
  return underlineWrap;
}

// Builds the dot/text-span/underline markup around whatever content nodes are
// given, returned as an array so it works both for a plain `children` value
// and for the original childNodes of an asChild target (via Slottable).
function buildContent(contentNodes, indicator) {
  const nodes = [];
  const items = Array.isArray(contentNodes) ? contentNodes : [contentNodes];

  if (indicator) {
    nodes.push(buildIndicatorDot());
    const textSpan = document.createElement('span');
    textSpan.className = cx(
      'transition-transform duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]',
      'group-hover:translate-x-24',
      'group-focus-visible:translate-x-24'
    );
    items.forEach((node) => {
      if (node instanceof Node) textSpan.appendChild(node);
      else if (node != null) textSpan.appendChild(document.createTextNode(String(node)));
    });
    nodes.push(textSpan);
  } else {
    items.forEach((node) => {
      if (node instanceof Node) nodes.push(node);
      else if (node != null) nodes.push(document.createTextNode(String(node)));
    });
  }

  nodes.push(buildUnderline(indicator));
  return nodes;
}

export function AnimatedLink(props = {}) {
  const { children, className, asChild, indicator, ...rest } = props;

  const wrapperClass = indicator ? 'inline-flex items-center' : 'inline-block';
  const linkClass = cx(
    'group relative w-fit cursor-pointer',
    wrapperClass,
    'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    className
  );

  if (asChild && children instanceof Node) {
    // Reuse the child element (e.g. SanityLink's rendered <a>/<button>) as the
    // root instead of wrapping it in a second interactive element.
    const slottedEl = Slottable({
      asChild,
      child: children,
      children: (contentNodes) => buildContent(contentNodes, indicator),
    });
    return Slot({ className: linkClass, ...rest }, slottedEl);
  }

  const a = document.createElement('a');
  a.className = linkClass;
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === 'href') a.href = value; else a.setAttribute(key, value);
  });

  buildContent(children, indicator).forEach((node) => a.appendChild(node));

  return a;
}