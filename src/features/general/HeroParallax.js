import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initAnimatedHeadline } from '../AnimatedHeadline.js';
import { initAnimatedSubtext } from '../AnimatedSubtext.js';
import { initButtonGroup } from '../ButtonGroup.js';
import { createImageElement } from '../../media/shared/imageElement.js'; 
import { usePageEnter } from '../../hooks/usePageEnter.js'; 
import { usePageEnterContext } from '../../hooks/usePageEnterContext.js'; 
import { initSanityMedia } from '../../media/SanityMedia.js'; 
import { HIGH_RES_SOURCE_WIDTHS } from '../../media/shared/mediaConstants.js'; 
import { getImageSrc, getImageSrcSet } from '../../media/shared/sanityImageUtils.js'; 
import { initGoodFellaWatermark } from '../../components/ui/GoodFellaWatermark.js'; 
import { cx } from '../../utils/cx.js'; 


gsap.registerPlugin(ScrollTrigger);

function initScrollCharText({ text, className }) {
  const measureEl = document.createElement('div'); 
  measureEl.className = `overflow-hidden ${className}`;

  const textEl = document.createElement('div'); 
  textEl.className = 'whitespace-nowrap font-bold tracking-tighter';
  textEl.style.lineHeight = '0.75em';

  text.split('').forEach((char) => {
    const span = document.createElement('span');
    span.dataset.scrollChar = 'true';
    span.className = 'inline-block';
    span.textContent = char === ' ' ? ' ' : char;
    textEl.appendChild(span);
  });

  measureEl.appendChild(textEl);

  function resize() {
    textEl.style.fontSize = '100px';
    textEl.style.width = 'max-content';
    const containerWidth = measureEl.offsetWidth;
    const textWidth = textEl.offsetWidth;
    textEl.style.width = '';
    if (textWidth > 0) textEl.style.fontSize = `${(100 * containerWidth) / textWidth}px`;
  }

  let resizeObserver = null;
  function mount() {
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(measureEl);
  }
  function destroy() {
    resizeObserver?.disconnect();
  }

  return { element: measureEl, mount, destroy };
}

export function initHeroParallax({
  media,
  mobileImage,
  headline,
  headlineLevel,
  headlineDisplay,
  subtext,
  ctas,
  scrollText,
  useWatermark,
  className,
} = {}) {
  const { prefersReducedMotion } = usePageEnterContext(); 
  let hasRevealed = false; 
  let headlineHandle = null; 
  let subtextHandle = null; 
  let scrollCharTextHandle = null;
  let ctx = null;

  const isVideo = media.type === 'video' || media.type === 'externalVideo'; 
  const highResOpts = media.highResolution ? { sourceWidths: HIGH_RES_SOURCE_WIDTHS } : {}; 
  const desktopImageSrc = media.type === 'image' && media.image ? getImageSrc(media.image, { width: 1920, ...highResOpts }) : null; 
  const desktopImageSrcSet = media.type === 'image' && media.image ? getImageSrcSet(media.image, highResOpts) : undefined; 
  const desktopImageAlt =
    media.type === 'image' && media.image ? media.image.altText ?? media.image.description ?? media.image.title ?? '' : ''; 
  const mobileImageSrc = mobileImage ? getImageSrc(mobileImage, { width: 720, quality: 80 }) : null; 
  const mobileImageSrcSet = mobileImage
    ? getImageSrcSet(mobileImage, { quality: 80, sourceWidths: [320, 480, 600, 720, 828, 960, 1080, 1200, 1440] })
    : undefined; 
  const mobileImageAlt = mobileImage ? mobileImage.altText ?? mobileImage.description ?? mobileImage.title ?? '' : ''; 

  const rootEl = document.createElement('div'); 
  rootEl.className = cx('relative h-svh lg:h-[150vh]', className);

  const mediaOuterEl = document.createElement('div');
  mediaOuterEl.className = 'pointer-events-none absolute inset-0 overflow-hidden';
  rootEl.appendChild(mediaOuterEl);

  if (mobileImageSrc) {
    const mobileWrapEl = document.createElement('div');
    mobileWrapEl.className = 'size-full lg:hidden';
    const mobileImgEl = createImageElement({
      src: mobileImageSrc,
      srcSet: mobileImageSrcSet,
      sizes: '100vw lg:0px',
      priority: true,
      alt: mobileImageAlt,
      className: 'size-full object-cover',
    });
    if (mobileImgEl) mobileWrapEl.appendChild(mobileImgEl);
    mediaOuterEl.appendChild(mobileWrapEl);
  }

  const mediaLayerEl = document.createElement('div'); 
  mediaLayerEl.className = cx('size-full', mobileImageSrc && 'hidden lg:block');
  mediaLayerEl.style.willChange = 'transform';
  if (isVideo) {
    const mediaEl = initSanityMedia({ media, className: 'size-full', autoPlay: true, loop: true, imageProps: { sizes: '100vw' } });
    if (mediaEl?.element) mediaLayerEl.appendChild(mediaEl.element);
  } else if (desktopImageSrc) {
    const desktopImgEl = createImageElement({
      src: desktopImageSrc,
      srcSet: desktopImageSrcSet,
      sizes: '100vw',
      priority: true,
      alt: desktopImageAlt,
      className: 'size-full object-cover',
    });
    if (desktopImgEl) mediaLayerEl.appendChild(desktopImgEl);
  }
  mediaOuterEl.appendChild(mediaLayerEl);

  const scrimEl = document.createElement('div');
  scrimEl.className = 'absolute inset-0 bg-background/10';
  mediaOuterEl.appendChild(scrimEl);

  const gradientEl = document.createElement('div');
  gradientEl.className = 'absolute inset-x-0 top-0 h-1/2';
  gradientEl.style.background = 'linear-gradient(to bottom, rgb(20 19 20 / 0.5), transparent)';
  mediaOuterEl.appendChild(gradientEl);

  const contentLayerEl = document.createElement('div'); 
  contentLayerEl.className = 'grid-container relative min-h-svh pt-80 lg:h-screen';
  rootEl.appendChild(contentLayerEl);

  const gridLayoutEl = document.createElement('div');
  gridLayoutEl.className = 'grid-layout';
  contentLayerEl.appendChild(gridLayoutEl);

  const gridSpanEl = document.createElement('div');
  gridSpanEl.className = 'grid-span-12 lg:grid-subgrid flex flex-col justify-center gap-16';
  gridLayoutEl.appendChild(gridSpanEl);

  let ctaWrapEl = null; 
  if (headline) {
    headlineHandle = initAnimatedHeadline({
      as: headlineLevel ?? 'h1',
      displayAs: headlineDisplay,
      className: 'lg:grid-span-12 lg:grid-subgrid text-foreground',
      skip: prefersReducedMotion,
      children: headline,
    });
    gridSpanEl.appendChild(headlineHandle.element);
  }
  if (subtext) {
    subtextHandle = initAnimatedSubtext({
      className: 'text-body lg:max-w-xl',
      skip: prefersReducedMotion,
      children: subtext,
    });
    gridSpanEl.appendChild(subtextHandle.element);
  }
  if (ctas) {
    ctaWrapEl = document.createElement('div');
    const buttonGroupEl = initButtonGroup({ buttonGroup: ctas });
    if (buttonGroupEl) ctaWrapEl.appendChild(buttonGroupEl);
    gridSpanEl.appendChild(ctaWrapEl);
  }

  let watermarkWrapEl = null; 
  if (scrollText || useWatermark) {
    watermarkWrapEl = document.createElement('div');
    watermarkWrapEl.className = 'absolute inset-x-0 bottom-0 overflow-hidden text-foreground/40';
    if (scrollText) {
      scrollCharTextHandle = initScrollCharText({ text: scrollText, className: 'w-full' });
      watermarkWrapEl.appendChild(scrollCharTextHandle.element);
    } else {
      const watermarkEl = initGoodFellaWatermark();
      if (watermarkEl) watermarkWrapEl.appendChild(watermarkEl);
    }
    rootEl.appendChild(watermarkWrapEl);
  }

  function setupParallax() {
    if (!rootEl || !mediaLayerEl) return;

    // gsap.context() scopes every tween/ScrollTrigger created inside the
    // callback to rootEl, so ctx.revert() in destroy() cleans everything up
    // (including killing the ScrollTriggers) without manually tracking them.
    ctx = gsap.context(() => {
      if (!prefersReducedMotion) {
        const initialHideTargets = [ctaWrapEl].filter(Boolean);
        if (initialHideTargets.length > 0) {
          gsap.set(initialHideTargets, { opacity: 0, y: 20 });
        }
      }

      if (!prefersReducedMotion) {
        gsap.set(mediaLayerEl, { clearProps: 'transform' });
        gsap.to(mediaLayerEl, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: { trigger: rootEl, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      }
      if (!prefersReducedMotion && contentLayerEl) {
        gsap.set(contentLayerEl, { clearProps: 'transform' });
        gsap.to(contentLayerEl, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: rootEl, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      }
      if (!prefersReducedMotion && watermarkWrapEl) {
        const isScrollCharMode = !!scrollText;
        const targets = watermarkWrapEl.querySelectorAll(isScrollCharMode ? '[data-scroll-char]' : 'svg > g');
        if (targets.length > 0) {
          gsap.set(targets, { clearProps: 'all' });
          const isMobileViewport = window.matchMedia('(max-width: 1023px)').matches;
          if (isScrollCharMode) {
            gsap.set(targets, { yPercent: 110 });
          } else {
            gsap.set(targets, { y: 345 });
          }
          gsap.to(targets, {
            y: 0,
            yPercent: 0,
            ease: 'power3.out',
            stagger: isMobileViewport ? 0.01 : 0.025,
            scrollTrigger: {
              trigger: rootEl,
              start: '10% top',
              end: isMobileViewport ? '30% top' : '80% top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      }
    }, rootEl);
  }

  function revealSequence(delay = 0) {
    if (hasRevealed) return;
    hasRevealed = true;
    const t = delay + 0.3;
    headlineHandle?.reveal?.(t);
    subtextHandle?.reveal?.(t + 0.15);

    // Add this tween to the existing context too, so it gets killed/reverted
    // by ctx.revert() if destroy() runs mid-animation.
    ctx?.add(() => {
      const tl = gsap.timeline({ delay: t + 0.2 });
      if (ctaWrapEl) tl.to(ctaWrapEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1);
    });
  }

  usePageEnter(revealSequence, { priority: 1, skip: prefersReducedMotion });

  function mount() {
    setupParallax();
    headlineHandle?.mount?.();
    subtextHandle?.mount?.();
    scrollCharTextHandle?.mount?.();
  }

  function destroy() {
    ctx?.revert();
    headlineHandle?.destroy?.();
    subtextHandle?.destroy?.();
    scrollCharTextHandle?.destroy?.();
  }

  return { element: rootEl, mount, destroy };
}
