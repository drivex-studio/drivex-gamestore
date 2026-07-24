'use strict';

import { preload } from './preload.js'; 
import { parseResponsiveValues } from './responsiveValues.js'; 

export function createResponsiveSizes(sizes) {
  let fallback = '100vw';
  const entries = Object.entries(parseResponsiveValues(sizes))
    .map(([key, { value, resolvedWidth }]) => {
      if (key === 'DEFAULT') {
        fallback = value;
        return null;
      }
      return `(min-width: ${resolvedWidth}) ${value}`;
    })
    .filter(Boolean);

  return entries.length ? `${entries.join(', ')}, ${fallback}` : fallback;
}

export function createImageElement(props = {}) {
  const {
    sizes,
    src,
    srcSet,
    priority,
    alt = '',
    loading = priority ? 'eager' : 'lazy',
    decoding = loading === 'lazy' ? 'async' : 'auto',
    ...restProps
  } = props;

  if (priority) {
    preload(src, { as: 'image', fetchPriority: 'high', imageSrcSet: srcSet, imageSizes: sizes ? createResponsiveSizes(sizes) : undefined });
  }

  const img = document.createElement('img');
  img.loading = loading;
  if (priority) img.fetchPriority = 'high';
  img.decoding = decoding;
  img.alt = alt;
  img.src = src;
  if (srcSet) img.srcset = srcSet;
  if (sizes) img.sizes = createResponsiveSizes(sizes);
  Object.entries(restProps).forEach(([key, value]) => {
    if (value == null || typeof value === 'function') return;
    if (key === 'className') img.className = value;
    else if (key === 'style') Object.assign(img.style, value);
    else img.setAttribute(key, value === true ? '' : String(value));
  });
  return img;
}
