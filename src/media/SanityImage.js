'use strict';

import { composeRefs } from '../lib/composeRefs.js'; 
import { createImageElement, createResponsiveSizes } from './shared/imageElement.js'; 
import { parseResponsiveValues } from './shared/responsiveValues.js'; 
import { parseAspectRatio } from './shared/responsiveRatios.js'; 
import { run } from './shared/run.js'; 
import { getImageDimensions, getImageSrc, getImageSrcSet, getLqipBackgroundStyle } from './shared/sanityImageUtils.js'; 
import { cx } from '../utils/cx.js'; 
import { setStyles, applyRestProps } from './shared/dom.js';

const loadedImageIds = new Set();

function setupImageVisibility(imageId, priority) {
  const alreadyLoaded = !!imageId && loadedImageIds.has(imageId);
  const initialVisible = priority || alreadyLoaded;
  let visible = initialVisible;
  let observer = null;
  const ref = { current: null };
  const callbacks = new Set();

  function emit() {
    callbacks.forEach(callback => callback(visible));
  }

  function onLoad() {
    if (visible) return; 
    visible = true;
    if (imageId) loadedImageIds.add(imageId);
    emit();
  }

  function observe() {
    if (priority) return;
    const target = ref.current;
    if (!target || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        visible = true;
        if (imageId) loadedImageIds.add(imageId);
        emit();
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -100px 0px' });
    observer.observe(target);
  }

  return {
    ref,
    get visible() { return visible; },
    onLoad,
    observe,
    subscribe(callback) { callbacks.add(callback); return () => callbacks.delete(callback); },
    destroy() { if (observer) observer.disconnect(); callbacks.clear(); }
  };
}

export function SanityImage(parentElement, props = {}) {
  const {
    image,
    aspectRatio,
    builderOptions,
    style,
    alt,
    sizes,
    onLoad,
    width,
    height,
    noPlaceholder,
    priority,
    className,
    ref,
    ...restProps
  } = props;

  if (!image?.asset) return null;

  const visibility = setupImageVisibility(image?._id ?? undefined, priority);
  const picture = document.createElement('picture');
  picture.className = cx('relative flex items-center justify-center', className);

  const responsiveSources = run(() => {
    if (aspectRatio) {
      return Object.entries(parseResponsiveValues(String(aspectRatio))).map(([bp, { value, resolvedWidth }]) => {
        if (!resolvedWidth) return null;
        const options = {
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          aspectRatio: value ? parseAspectRatio(value) : undefined,
          ...builderOptions
        };
        const dimensions = getImageDimensions(image, options);
        return {
          bp,
          srcSet: getImageSrcSet(image, options),
          sizes: sizes ? createResponsiveSizes(sizes) : undefined,
          width: dimensions.width,
          height: dimensions.height,
          media: `(min-width: ${resolvedWidth})`
        };
      }).filter(entry => !!entry);
    }
  });

  const defaultAspectRatio = run(() => {
    if (aspectRatio) {
      const value = parseResponsiveValues(String(aspectRatio)).DEFAULT.value;
      return value ? parseAspectRatio(value) : undefined;
    }
  });

  const options = { width: width ? Number(width) : undefined, height: height ? Number(height) : undefined, aspectRatio: defaultAspectRatio, ...builderOptions };
  const dimensions = getImageDimensions(image, options);
const src = getImageSrc(image, options);

const srcSet = getImageSrcSet(image, options);
  const placeholderStyle = visibility.visible || noPlaceholder ? undefined : getLqipBackgroundStyle(image);
  const resolvedAlt = alt ?? image.altText ?? image.description ?? image.title ?? '';
  const imageStyle = {
    ...(width ? { '--desired-width': `${width}px` } : {}),
    ...(height ? { '--desired-height': `${height}px` } : {}),
    ...placeholderStyle,
    ...style
  };

  responsiveSources?.forEach(({ bp, ...sourceProps }) => {
    const source = document.createElement('source');
    applyRestProps(source, sourceProps);
    picture.appendChild(source);
  });

  const img = createImageElement({
    ...restProps,
    priority,
    src,
    sizes,
    srcSet,
    alt: resolvedAlt,
    width: dimensions.width,
    height: dimensions.height,
    className: cx('h-(--desired-height,100%) w-(--desired-width,100%) max-w-full transition-opacity duration-700 ease-in-out', visibility.visible ? 'opacity-100' : 'opacity-0')
  });
  setStyles(img, imageStyle);
  visibility.ref.current = img;
  if (ref) composeRefs(visibility.ref, ref)(img);

  const span = document.createElement('span');
  span.className = cx('pointer-events-none absolute inset-0 bg-brand/[0.06] transition-opacity duration-700 ease-in-out', visibility.visible ? 'opacity-0' : 'opacity-100');
  span.setAttribute('aria-hidden', 'true');

  const unsubscribe = visibility.subscribe(visible => {
    img.className = cx('h-(--desired-height,100%) w-(--desired-width,100%) max-w-full transition-opacity duration-700 ease-in-out', visible ? 'opacity-100' : 'opacity-0');
    span.className = cx('pointer-events-none absolute inset-0 bg-brand/[0.06] transition-opacity duration-700 ease-in-out', visible ? 'opacity-0' : 'opacity-100');
  });

  function handleLoad(event) {
    visibility.onLoad();
    onLoad?.(event);
  }

  img.addEventListener('load', handleLoad);
  if (img.complete) visibility.onLoad();
  visibility.observe();

  picture.appendChild(img);
  picture.appendChild(span);

  function destroy() {
    img.removeEventListener('load', handleLoad);
    unsubscribe();
    visibility.destroy();
    picture.remove();
  }

  if (parentElement) parentElement.appendChild(picture);
  return { el: picture, destroy };
}
