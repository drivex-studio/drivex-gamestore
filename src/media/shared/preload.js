'use strict';

const preloadedHrefs = new Set();

export function preload(href, options = {}) {
  if (!href || preloadedHrefs.has(href)) return;
  preloadedHrefs.add(href);

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  if (options.as) link.as = options.as;
  if (options.fetchPriority) link.setAttribute('fetchpriority', options.fetchPriority);
  if (options.imageSrcSet) link.setAttribute('imagesrcset', options.imageSrcSet);
  if (options.imageSizes) link.setAttribute('imagesizes', options.imageSizes);
  if (options.crossOrigin) link.crossOrigin = options.crossOrigin;

  document.head.appendChild(link);
}
