
import { initAsciiEffectCanvas as AsciiTypewriter } from './AsciiTypewriter.js';

export function initAsciiRevealImage(parentElement, props = {}) {
  const {
    imageSrc,
    color,
    colorDark,
    cellSize,
    alignX,
    externalProgress,
    externalColorProgress,
    depthMapSrc,
    parallaxIntensity,
    mouseRef,
    isHovering,
    isTouch,
    mobileFit,
    revealOriginX,
    revealOriginY,
    frameloop,
    dpr,
  } = props;

  const resolvedAlignX = alignX === undefined ? 'center' : alignX;
  const resolvedParallaxIntensity = parallaxIntensity === undefined ? 0.02 : parallaxIntensity;
  const resolvedIsHovering = isHovering !== undefined && isHovering;
  const resolvedIsTouch = isTouch !== undefined && isTouch;
  const hasExternalProgress = externalProgress !== undefined;
  const hasDepthMap = !!depthMapSrc;
  const enableDepthParallax = !resolvedIsTouch && hasDepthMap;
  const enableGooeyReveal = !resolvedIsTouch && hasDepthMap;

  const revealOrigin = (revealOriginX != null && revealOriginY != null)
    ? { x: revealOriginX, y: revealOriginY }
    : undefined;

  return AsciiTypewriter(parentElement, {
    imageSrc,
    color,
    colorDark,
    cellSize,
    alignX: resolvedAlignX,
    alignY: 'center',
    fit: 'contain',
    mobileFit,
    className: 'size-full',
    externalProgress: hasExternalProgress ? externalProgress : undefined,
    externalColorProgress: hasExternalProgress ? externalColorProgress : undefined,
    disableInternalAnimation: hasExternalProgress,
    enableDepthParallax,
    depthMapSrc,
    parallaxIntensity: resolvedParallaxIntensity,
    mouseRef,
    enableGooeyReveal,
    isHovering: resolvedIsHovering,
    gooeyRadius: 0.035,
    gooeySoftness: 0.04,
    gooeyNoiseIntensity: 0.02,
    revealOrigin,
    frameloop,
    dpr,
    skipContentBounds: true,
  });
}