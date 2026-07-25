import { startTransition, usePageTransition } from '../hooks/usePageTransition.js';
import { useRouter } from '../hooks/useRouter.js';

function isModifiedOrNewTabClick(event) {
  const { nodeName } = event.currentTarget;
  if (nodeName.toUpperCase() !== 'A') return false;
  const target = event.currentTarget.getAttribute('target');
  return (
    (!!target && target !== '_self') ||
    !!event.metaKey ||
    !!event.ctrlKey ||
    !!event.shiftKey ||
    !!event.altKey ||
    event.button === 1
  );
}

function navigate(router, url, replace, scroll) {
  if (replace) {
    router.replace(url, { scroll: scroll ?? true });
  } else {
    router.push(url, { scroll: scroll ?? true });
  }
}

export function initLink(parentElement, { href, as, replace, scroll, onClick, router, ...attrs } = {}) {
  const target = as || href;
  const url = typeof target === 'string' ? target : target.toString();

  const resolvedRouter = router ?? useRouter();

  const anchor = document.createElement('a');
  const addedListeners = [];
  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null) return;
    const eventMatch = key.match(/^on([A-Z]\w*)/);
    if (eventMatch && typeof value === 'function') {

      const domEvent = eventMatch[1].toLowerCase();
      anchor.addEventListener(domEvent, value);
      addedListeners.push([domEvent, value]);
      return;
    }

    const attrName = /^data[A-Z]/.test(key)
      ? key.replace(/([A-Z])/g, '-$1').toLowerCase()
      : key;
    anchor.setAttribute(attrName, value);
  });
  anchor.setAttribute('href', url);

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const { isTransitioning } = usePageTransition();
    if (isTransitioning || isModifiedOrNewTabClick(event)) return;
    event.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(resolvedRouter, url, replace, scroll);
    } else {
      startTransition(() => navigate(resolvedRouter, url, replace, scroll));
    }
  };
  anchor.addEventListener('click', handleClick);
  parentElement?.appendChild(anchor);
  anchor.destroy = function () {
    anchor.removeEventListener('click', handleClick);
    addedListeners.forEach(([domEvent, fn]) => anchor.removeEventListener(domEvent, fn));
    anchor.remove();
  };
  return anchor;
}
