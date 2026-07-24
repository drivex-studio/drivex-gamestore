
import { initAnimatedHeadline } from './AnimatedHeadline.js';
import { cx } from '../shared.js'; 

export function initScrollAnimatedHeadline({ headline, displayAs, className, headlineClassName } = {}) {
  if (!headline?.text || !headline?.level) return null;
  const level = headline.level;
  const resolvedHeadlineClassName = cx(headlineClassName);
  return initAnimatedHeadline({
    trigger: 'scroll',
    as: level,
    displayAs,
    className: resolvedHeadlineClassName,
    wrapperClassName: className,
    children: headline.text,
  });
}
