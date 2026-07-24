'use strict';

import { createImageUrlBuilder, getAssetIdFromSource, parseAssetId } from './sanityUrlBuilder.js'; 
import { env } from './env.js'; 
import { run } from './run.js'; 
import { DEFAULT_MAX_HEIGHT, DEFAULT_MAX_WIDTH, DEFAULT_SOURCE_WIDTHS } from './mediaConstants.js'; 

function resolveImageDimensions(image) {
  if (image?.dimensions?.width && image?.dimensions?.height) return image.dimensions;
  const assetId = getAssetIdFromSource(image);
  const parsed = assetId ? parseAssetId(assetId) : null;
  return parsed?.width && parsed?.height ? { width: parsed.width, height: parsed.height } : undefined;
}

const builder = createImageUrlBuilder({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET });
const defaultOptions = { auto: 'format', quality: 90 };

export function getLqipBackgroundStyle({ lqip }) {
  return lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: 'cover' } : null;
}

function clampDimensions({ width, height }, options = {}) {
  const { maxWidth = DEFAULT_MAX_WIDTH, maxHeight = DEFAULT_MAX_HEIGHT } = options;
  let nextWidth = width;
  let nextHeight = height;
  if (maxWidth && nextWidth > maxWidth) {
    const ratio = maxWidth / nextWidth;
    nextWidth = maxWidth;
    nextHeight = Math.round(nextHeight * ratio);
  }
  if (maxHeight && nextHeight > maxHeight) {
    const ratio = maxHeight / nextHeight;
    nextHeight = maxHeight;
    nextWidth = Math.round(nextWidth * ratio);
  }
  return { width: nextWidth, height: nextHeight };
}

function getCroppedDimensions(source, options = {}) {
  const { crop } = options;
  const { width, height } = source;
  if (!width || !height) return { width: undefined, height: undefined };
  if (!crop) return { width, height };
  const { left = 0, top = 0, right = 0, bottom = 0 } = crop;
  const croppedWidth = width - left * width - right * width;
  const croppedHeight = height - top * height - bottom * height;
  return { width: croppedWidth > 0 ? croppedWidth : width, height: croppedHeight > 0 ? croppedHeight : height };
}

function getAspectRatio(source, options = {}) {
  const dimensions = resolveImageDimensions(source);
  if (!dimensions) throw Error('Dimensions are missing');
  const { width, height } = getCroppedDimensions(dimensions, options);
  return width && height ? width / height : undefined;
}

function resolveDimensions({ width, height }, ratio, fallbackSize) {
  if (width && height) return { width, height };
  if (width && !height) return ratio ? { width, height: Math.round(width / ratio) } : { width, height: width };
  if (height && !width) return ratio ? { width: Math.round(height * ratio), height } : { width: height, height };
  if (!fallbackSize) throw Error('Unable to calculate dimensions. Provide a fallbackSize.');
  return resolveDimensions(fallbackSize, ratio);
}

function getInitialDimensions(source, options = {}) {
  const { crop, aspectRatio, height, width } = options;
  const ratio = getAspectRatio(source, { crop });
  const originalWidth = resolveImageDimensions(source)?.width ?? Infinity;
  return resolveDimensions({ width, height }, aspectRatio ?? ratio, { width: Math.min(DEFAULT_SOURCE_WIDTHS[DEFAULT_SOURCE_WIDTHS.length - 1], originalWidth) });
}

export function getImageDimensions(image, options = {}) {
  const { width, height, aspectRatio, maxWidth, maxHeight } = options;
  return clampDimensions(getInitialDimensions(image, { width, height, aspectRatio, crop: image.crop }), { maxWidth, maxHeight });
}

function getBuiltImageUrl(image, options = {}) {
  const idImage = { ...image, _id: image._id ?? undefined };
  return builder.withOptions({ ...defaultOptions, ...options }).image(idImage).url();
}

export function getImageSrc(image, options = {}) {
  const { width, height, aspectRatio, ...restOptions } = options;
  const fit = run(() => image?.crop ? 'crop' : options.fit ? options.fit : width && height || aspectRatio ? 'crop' : undefined);
  const size = getImageDimensions(image, { width, height, aspectRatio });
  return getBuiltImageUrl(image, { ...restOptions, fit, width: size.width, height: size.height });
}

export function getImageSrcSet(image, options = {}) {
  const { sourceWidths = DEFAULT_SOURCE_WIDTHS, ...restOptions } = options;
  const intrinsicWidth = resolveImageDimensions(image)?.width;

  return run(() => {
    if (restOptions.width || restOptions.height || intrinsicWidth && intrinsicWidth < sourceWidths[0]) {
      return [2, 3].map(dpr => {
        const url = getImageSrc(image, { ...restOptions, dpr });
        return `${url} ${dpr}x`;
      });
    }
    const list = sourceWidths.map(sourceWidth => {
      if (intrinsicWidth && intrinsicWidth < sourceWidth) return null;
      const url = getImageSrc(image, { ...restOptions, height: undefined, width: sourceWidth });
      return `${url} ${sourceWidth}w`;
    });
    if (intrinsicWidth && !sourceWidths.includes(intrinsicWidth)) {
      const previous = sourceWidths.filter(sourceWidth => intrinsicWidth >= sourceWidth).at(-1);
      if (previous && intrinsicWidth > previous) {
        const url = getImageSrc(image, { ...restOptions, height: undefined, width: intrinsicWidth });
        list.push(`${url} ${intrinsicWidth}w`);
      }
    }
    return list;
  }).filter(Boolean).join(', ');
}
