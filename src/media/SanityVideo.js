'use strict';

import { DEFAULT_MAX_WIDTH } from './shared/mediaConstants.js'; 
import { createResponsiveRatios } from './shared/responsiveRatios.js'; 
import { run } from './shared/run.js'; 
import { cx } from '../utils/cx.js'; 
import { setStyles, applyRestProps } from './shared/dom.js';

function getMuxPosterDimension(value) {
  const ratio = Math.min(value / DEFAULT_MAX_WIDTH, 1);
  return Math.min(value, Math.round(300 + 300 * ratio ** 0.5));
}

function createMuxPosterUrl({ playbackId, width, height, animated, time = 1, fitMode = 'preserve' }) {
  let url = `https://image.mux.com/${playbackId}/${animated ? 'animated.gif' : 'thumbnail.webp'}?time=${time}&fit_mode=${fitMode}`;
  if (width) url += `&width=${width}`;
  if (height) url += `&height=${height}`;
  return url;
}

export function initSanityVideo(parentElement, props = {}) {
  const {
    video,
    aspectRatio,
    width,
    height,
    style,
    className,
    thumbnailTime,
    poster,
    animatedPoster,
    disablePoster,
    hoverPlayback,
    objectFit,
    objectPosition,
    ...restProps
  } = props;

  const disabledPoster = disablePoster !== undefined && disablePoster;
  const shouldHoverPlayback = hoverPlayback !== undefined && hoverPlayback;
  const resolvedObjectFit = objectFit === undefined ? 'cover' : objectFit;
  const resolvedObjectPosition = objectPosition === undefined ? 'center' : objectPosition;
  const { playbackId, dimensions, thumbTime } = video ?? {};

  if (!playbackId) return null;

  const resolvedWidth = width ?? dimensions?.width;
  const resolvedHeight = height ?? dimensions?.height;
  const resolvedAspectRatio = (width && height ? width / height : undefined) ?? aspectRatio ?? dimensions?.aspectRatio ?? 1.7777777777777777;
  const responsive = createResponsiveRatios(resolvedAspectRatio);
  const posterUrl = run(() => disabledPoster || !playbackId ? null : poster || createMuxPosterUrl({
    playbackId,
    time: thumbnailTime ?? undefined,
    animated: animatedPoster,
    height: resolvedHeight ? getMuxPosterDimension(resolvedHeight) : undefined,
    width: resolvedWidth ? getMuxPosterDimension(resolvedWidth) : undefined
  }));

  const muxPoster = disabledPoster ? '' : posterUrl ?? undefined;
  const showBlur = !disabledPoster && !!posterUrl;
  const wrapperStyle = {
    ...responsive.styles,
    '--desired-width': resolvedHeight ? 'auto' : resolvedWidth ? `${resolvedWidth}px` : 'auto',
    '--desired-height': resolvedHeight ? `${resolvedHeight}px` : 'auto',
    ...style
  };
  const blurStyle = {
    filter: 'blur(20px)',
    backgroundImage: `url(${posterUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: resolvedObjectFit,
    backgroundPosition: resolvedObjectPosition
  };

  const el = document.createElement('div');
  el.className = cx('relative isolate h-(--desired-height,auto) w-(--desired-width,auto) max-w-full overflow-hidden', responsive.className, className);
  setStyles(el, wrapperStyle);

  let blurEl = null;
  if (showBlur) {
    blurEl = document.createElement('div');
    blurEl.className = 'pointer-events-none absolute inset-0 -z-1 size-full';
    setStyles(blurEl, blurStyle);
    el.appendChild(blurEl);
  }

  const muxPlayer = document.createElement('mux-player');
  muxPlayer.className = 'absolute inset-0 z-10 size-full';
  if (muxPoster !== undefined) muxPlayer.setAttribute('poster', muxPoster);
  muxPlayer.setAttribute('playback-id', playbackId);
  const resolvedThumbnailTime = thumbTime ?? undefined;
  if (resolvedThumbnailTime !== undefined) muxPlayer.setAttribute('thumbnail-time', String(resolvedThumbnailTime));
  muxPlayer.setAttribute('object-fit', resolvedObjectFit);
  muxPlayer.setAttribute('object-position', resolvedObjectPosition);
  applyRestProps(muxPlayer, restProps);
  el.appendChild(muxPlayer);

  function handlePointerEnter() {
    if (shouldHoverPlayback && muxPlayer.play) muxPlayer.play();
  }

  function handlePointerLeave() {
    if (shouldHoverPlayback && muxPlayer.pause) muxPlayer.pause();
  }

  if (shouldHoverPlayback) {
    el.addEventListener('pointerenter', handlePointerEnter);
    el.addEventListener('pointerleave', handlePointerLeave);
  }

  function destroy() {
    el.removeEventListener('pointerenter', handlePointerEnter);
    el.removeEventListener('pointerleave', handlePointerLeave);
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}
