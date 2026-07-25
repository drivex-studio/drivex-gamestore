import { SanityLink, initAnimatedButton } from '../shared.js';

import { AnimatedLink } from '../animations/AnimatedLink.js';

export function initSanityButton({ button = {}, className } = {}) {
  if (!button.link?.href) return null;

  const linkContent = SanityLink({ link: button.link, children: button.link.text });

  if (button.variant === 'link') {
    const isExternal = button.link.type === 'external';
    return AnimatedLink({
      asChild: true,
      indicator: isExternal,
      className,
      children: linkContent,
    });
  }

  const { el } = initAnimatedButton(null, {
    size: button.size,
    theme: button.theme,
    asChild: true,
    className,
    children: linkContent,
  });
  return el;
}