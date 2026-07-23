'use strict';

import { createResponsiveRatios } from './shared/responsiveRatios.js'; 
import { setStyles, applyRestProps } from './shared/dom.js';
import { cx } from '../utils/cx.js'; 

export function initExternalVideo(parentElement, props = {}) {
  const {
    src,
    aspectRatio,
    width,
    height,
    style,
    className,
    loop,
    autoPlay,
    muted,
    controls,
    objectFit,
    objectPosition,
    ...restProps
  } = props;

  if (!src) return null;

  let visible = false;
  let observer = null;
  const videoRef = { current: null };
  const wrapperRef = { current: null };

  const controlsEnabled = controls !== undefined && controls;
  const resolvedObjectFit = objectFit === undefined ? 'cover' : objectFit;
  const resolvedObjectPosition = objectPosition === undefined ? 'center' : objectPosition;
  const ratio = aspectRatio ?? 1.7777777777777777;
  const responsive = createResponsiveRatios(ratio);
  const wrapperStyle = {
    ...responsive.styles,
    '--desired-width': height ? 'auto' : width ? `${width}px` : 'auto',
    '--desired-height': height ? `${height}px` : 'auto',
    ...style
  };

  const el = document.createElement('div');
  wrapperRef.current = el;
  el.className = cx(
    'relative isolate h-(--desired-height,auto) w-(--desired-width,auto) max-w-full overflow-hidden',
    responsive.className,
    className
  );
  setStyles(el, wrapperStyle);

  function mountVideo() {
    if (visible || !wrapperRef.current) return;
    visible = true;
    const video = document.createElement('video');
    videoRef.current = video;
    applyRestProps(video, restProps);
    video.src = src;
    video.loop = loop !== false;
    video.muted = muted !== false;
    video.autoplay = autoPlay !== false;
    video.controls = controlsEnabled === true;
    video.playsInline = true;
    video.preload = 'auto';
    video.className = 'absolute inset-0 size-full';
    setStyles(video, { objectFit: resolvedObjectFit, objectPosition: resolvedObjectPosition });
    wrapperRef.current.appendChild(video);
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        mountVideo();
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
  } else {
    mountVideo();
  }

  function destroy() {
    if (observer) observer.disconnect();
    videoRef.current = null;
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}
