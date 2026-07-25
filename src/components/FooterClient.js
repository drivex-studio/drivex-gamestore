
import { initAsciiRevealImage } from '../features/ascii/AsciiRevealImage.js';

import { initGameOrderForm } from './GameOrderForm.js';

import { initScrambleText as ScrambleText } from '../utils/ScrambleText.js';

import { cx } from '../utils/cx.js';

import { SanityImage, SanityLink, getImageSrc } from '../media/index.js';

import { initSanityRichText as SanityRichText } from './ui/SanityRichText.js';

import { useMousePosition } from '../hooks/useMousePosition.js';
import { SpotsBadge } from './ui/SpotsBadge.js';

import { initGoodFellaWatermark as GoodFellaWatermark } from './ui/GoodFellaWatermark.js';
import { useIsTouchDevice } from '../hooks/useBreakpoint.js';

const DEFAULT_ASCII_COLOR = '#FB460D';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function easeOutSine(value) {
  return Math.sin(value * Math.PI / 2);
}

function dispatchColorShortcut() {
  return window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true }));
}

function dispatchGridShortcut() {
  return window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', metaKey: true, bubbles: true }));
}

function renderNavItem(item) {
  const li = document.createElement('li');
  if (item.link && item.text) {
    const link = SanityLink({
      link: item.link,
      className: 'text-accent text-foreground-muted',
      'aria-label': item.text,
    });
    
    li.appendChild(link);
    ScrambleText(link, {
      triggerOnHover: true,
      secondColorClass: 'scramble-inherit',
      children: item.text,
    });
  }
  return li;
}

export function initFooterClient(parentElement, props = {}) {
  const {
    navigation,
    contactInformation,
    copyrightNotice,
    asciiImageLeft,
    asciiDepthMapLeft,
    asciiColorLeft,
    asciiColorDarkLeft,
    asciiCellSizeLeft,
    asciiParallaxIntensityLeft,
    asciiRevealOriginXLeft,
    asciiRevealOriginYLeft,
    asciiMobileFallbackLeft,
    asciiImage,
    asciiDepthMap,
    asciiColor,
    asciiColorDark,
    asciiCellSize,
    asciiParallaxIntensity,
    asciiRevealOriginX,
    asciiRevealOriginY,
    asciiMobileFallback,
    showWatermark,
    spotsRemaining,
  } = props;

  const outerWrapperRef = { current: null };   
  const footerRef = { current: null };         
  const contentWrapperRef = { current: null }; 
  const revealRafRef = { current: null };      
  const parallaxRafRef = { current: null };    
  const leftMouseContainerRef = { current: null };  
  const rightMouseContainerRef = { current: null }; 
  const hasIntersectedRef = { current: false };     

  let isMounted = false;          
  let hasStartedAnimating = false; 
  let prefersReducedMotion = false; 
  const isTouch = useIsTouchDevice(); 
  let scrollLockCleared = false;  

  const leftProgressRef = { current: { progress: 0, colorProgress: 0 } }; 
  const rightProgressRef = { current: { progress: 0, colorProgress: 0 } }; 
  let progressState = { left: 0, leftColor: 0, right: 0, rightColor: 0 }; 

  const leftImageSrc = asciiImageLeft ? getImageSrc(asciiImageLeft, isTouch ? { width: 400 } : undefined) : null; 
  const leftDepthMapSrc = isTouch ? null : (asciiDepthMapLeft ? getImageSrc(asciiDepthMapLeft) : null); 
  const rightImageSrc = asciiImage ? getImageSrc(asciiImage, isTouch ? { width: 400 } : undefined) : null; 
  const rightDepthMapSrc = isTouch ? null : (asciiDepthMap ? getImageSrc(asciiDepthMap) : null); 

  const outerWrapper = document.createElement('div');
  outerWrapperRef.current = outerWrapper;

  const footer = document.createElement('footer');
  footer.dataset.theme = 'dark';
  footer.className = 'relative h-auto min-h-svh overflow-hidden bg-background pt-48 lg:h-svh';
  footerRef.current = footer;
  outerWrapper.appendChild(footer);
  parentElement.appendChild(outerWrapper);

  const leftAsciiContainer = document.createElement('div');
  leftAsciiContainer.className = 'pointer-events-none absolute top-[12.5%] bottom-0 left-0 z-20 w-1/2';
  leftMouseContainerRef.current = leftAsciiContainer;

  const leftFallback = document.createElement('div');
  leftFallback.className = 'pointer-events-none absolute top-1/5 -left-1/3 flex w-3/4 items-end lg:hidden';

  const rightAsciiContainer = document.createElement('div');
  rightAsciiContainer.className = 'pointer-events-none absolute top-[12.5%] right-0 bottom-0 z-20 w-1/2';
  rightMouseContainerRef.current = rightAsciiContainer;

  const rightFallback = document.createElement('div');
  rightFallback.className = 'pointer-events-none absolute top-1/5 -right-1/3 flex w-3/4 items-end lg:hidden';

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'grid-container pointer-events-none relative z-30 flex h-full flex-col';
  contentWrapperRef.current = contentWrapper;

  footer.appendChild(leftAsciiContainer);
  footer.appendChild(leftFallback);
  footer.appendChild(rightAsciiContainer);
  footer.appendChild(rightFallback);
  footer.appendChild(contentWrapper);

  let leftIsHovering = false, leftMouseRef = { current: null };
  let rightIsHovering = false, rightMouseRef = { current: null };

  function isRevealActive() {
    return isMounted && !prefersReducedMotion;
  }

  function refreshMousePositionTracking() {
    const leftEnabled = isRevealActive() && !isTouch;
    const rightEnabled = isRevealActive() && !isTouch;
    ({ isHovering: leftIsHovering, mouseRef: leftMouseRef } = useMousePosition({
      enabled: leftEnabled, containerRef: leftMouseContainerRef, refOnly: true,
    }));
    ({ isHovering: rightIsHovering, mouseRef: rightMouseRef } = useMousePosition({
      enabled: rightEnabled, containerRef: rightMouseContainerRef, refOnly: true,
    }));
  }

  function setupRevealAnimation() {
    if (!footerRef.current) return undefined;

    if (prefersReducedMotion) {
      hasStartedAnimating = true;
      leftProgressRef.current = { progress: 1, colorProgress: 1 };
      rightProgressRef.current = { progress: 1, colorProgress: 1 };
      progressState = { left: 1, leftColor: 1, right: 1, rightColor: 1 };
      renderAsciiLayers();
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && !hasIntersectedRef.current) {
        hasIntersectedRef.current = true;
        hasStartedAnimating = true;
        renderAsciiLayers();
        const start = performance.now();
        const ease = easeOutSine;
        const clamp = clamp01;
        const step = (now) => {
          const elapsed = now - start;
          const progress = ease(clamp(elapsed / 3000));
          const colorProgress = ease(clamp((elapsed - 500) / 3000));
          if (leftImageSrc) leftProgressRef.current = { progress, colorProgress };
          if (rightImageSrc) rightProgressRef.current = { progress, colorProgress };
          progressState = {
            left: leftProgressRef.current.progress,
            leftColor: leftProgressRef.current.colorProgress,
            right: rightProgressRef.current.progress,
            rightColor: rightProgressRef.current.colorProgress,
          };
          renderAsciiLayers();
          if (elapsed < 3500) {
            revealRafRef.current = requestAnimationFrame(step);
            return;
          }
          revealRafRef.current = null;
          progressState = { left: 1, leftColor: 1, right: 1, rightColor: 1 };
          renderAsciiLayers();
        };
        if (revealRafRef.current) cancelAnimationFrame(revealRafRef.current);
        revealRafRef.current = requestAnimationFrame(step);
      }
    }, { threshold: 0.2 });

    observer.observe(footerRef.current);
    return () => {
      observer.disconnect();
      if (revealRafRef.current) {
        cancelAnimationFrame(revealRafRef.current);
        revealRafRef.current = null;
      }
    };
  }
  let disposeRevealAnimation = null;

  function setupParallax() {
    if (!footerRef.current || !outerWrapperRef.current || !scrollLockCleared || prefersReducedMotion) return undefined;
    const footerEl = footerRef.current;
    const wrapperEl = outerWrapperRef.current;
    const contentEl = contentWrapperRef.current;

    const update = () => {
      parallaxRafRef.current = null;
      const rect = wrapperEl.getBoundingClientRect();
      const progress = clamp01((window.innerHeight - rect.top) / Math.max(rect.height, 1));
      footerEl.style.transform = `translate3d(0, ${-20 + 20 * progress}%, 0)`;
      if (contentEl) contentEl.style.opacity = String(progress);
    };
    const requestUpdate = () => {
      if (parallaxRafRef.current == null) {
        parallaxRafRef.current = requestAnimationFrame(update);
      }
    };
    const onScroll = () => requestUpdate();
    const onResize = () => requestUpdate();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const resizeObserver = new ResizeObserver(() => requestUpdate());
    resizeObserver.observe(document.body);
    requestUpdate();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
        parallaxRafRef.current = null;
      }
      footerEl.style.transform = '';
      if (contentEl) contentEl.style.opacity = '';
    };
  }
  let disposeParallax = null;

  function markMounted() {
    isMounted = true;
    disposeRevealAnimation = setupRevealAnimation();
    renderAsciiLayers();
  }

  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reducedMotionMedia.matches;
  function onReducedMotionChange(e) {
    prefersReducedMotion = e.matches;
  }
  reducedMotionMedia.addEventListener('change', onReducedMotionChange);

  function watchScrollLock() {
    if (!document.documentElement.classList.contains('scroll-locked')) {
      const raf = requestAnimationFrame(() => {
        scrollLockCleared = true;
        disposeParallax = setupParallax();
      });
      return () => cancelAnimationFrame(raf);
    }
    const observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('scroll-locked')) {
        observer.disconnect();
        requestAnimationFrame(() => {
          scrollLockCleared = true;
          disposeParallax = setupParallax();
        });
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }
  const disposeScrollLockWatch = watchScrollLock();

  requestAnimationFrame(markMounted);

  let leftAsciiInstance = null;
  let rightAsciiInstance = null;

  function renderAsciiLayers() {
    refreshMousePositionTracking();
    const active = isRevealActive();

    leftAsciiContainer.innerHTML = '';
    if (leftImageSrc && active) {
      initAsciiRevealImage(leftAsciiContainer, {
        imageSrc: leftImageSrc,
        color: asciiColorLeft ?? DEFAULT_ASCII_COLOR,
        colorDark: asciiColorDarkLeft ?? undefined,
        cellSize: asciiCellSizeLeft ?? 20,
        alignX: 'left',
        mobileFit: 'contain',
        externalProgress: progressState.left,
        externalColorProgress: progressState.leftColor,
        depthMapSrc: isTouch ? undefined : (leftDepthMapSrc ?? undefined),
        parallaxIntensity: asciiParallaxIntensityLeft ?? 0.02,
        mouseRef: isTouch ? undefined : leftMouseRef,
        isHovering: !isTouch && leftIsHovering,
        isTouch,
        revealOriginX: asciiRevealOriginXLeft ?? undefined,
        revealOriginY: asciiRevealOriginYLeft ?? undefined,
        frameloop: 'demand',
        dpr: [1, 1.5],
      });
    }

    leftFallback.innerHTML = '';
    if (asciiMobileFallbackLeft && isMounted && !active) {
      SanityImage(leftFallback, {
        image: asciiMobileFallbackLeft,
        className: 'h-full w-full',
        style: { objectFit: 'contain', objectPosition: 'left bottom' },
      });
    }

    rightAsciiContainer.innerHTML = '';
    if (rightImageSrc && active) {
      initAsciiRevealImage(rightAsciiContainer, {
        imageSrc: rightImageSrc,
        color: asciiColor ?? DEFAULT_ASCII_COLOR,
        colorDark: asciiColorDark ?? undefined,
        cellSize: asciiCellSize ?? 20,
        alignX: 'right',
        mobileFit: 'contain',
        externalProgress: progressState.right,
        externalColorProgress: progressState.rightColor,
        depthMapSrc: isTouch ? undefined : (rightDepthMapSrc ?? undefined),
        parallaxIntensity: asciiParallaxIntensity ?? 0.02,
        mouseRef: isTouch ? undefined : rightMouseRef,
        isHovering: !isTouch && rightIsHovering,
        isTouch,
        revealOriginX: asciiRevealOriginX ?? undefined,
        revealOriginY: asciiRevealOriginY ?? undefined,
        frameloop: 'demand',
        dpr: [1, 1.5],
      });
    }

    rightFallback.innerHTML = '';
    if (asciiMobileFallback && isMounted && !active) {
      SanityImage(rightFallback, {
        image: asciiMobileFallback,
        className: 'h-full w-full',
        style: { objectFit: 'contain', objectPosition: 'right bottom' },
      });
    }
  }

  const newsletterAvailabilityCol = document.createElement('div');
  newsletterAvailabilityCol.className = 'grid-span-12 lg:grid-span-3 lg:grid-start-1 pointer-events-auto flex flex-col gap-16';
  initGameOrderForm(newsletterAvailabilityCol, {
    heading: "Don't miss out on future updates.",
    buttonText: 'Subscribe',
    buttonTheme: 'light',
  });
  if (navigation?.availability?.isAvailable && navigation.availability.text) {
    const availabilityWrap = document.createElement('div');
    availabilityWrap.className = 'flex flex-col items-start gap-4';
    const availabilityRow = document.createElement('p');
    availabilityRow.className = 'flex items-center gap-8 text-accent-sm text-foreground-muted';
    const dot = document.createElement('span');
    dot.className = 'inline-block size-8 shrink-0 animate-pulse bg-brand';
    const label = document.createElement('span');
    label.textContent = navigation.availability.text;
    availabilityRow.appendChild(dot);
    availabilityRow.appendChild(label);
    availabilityWrap.appendChild(availabilityRow);
    const spotsBadgeContainer = document.createElement('div');
    SpotsBadge(spotsBadgeContainer, { className: 'tex-foreground-muted', spots: spotsRemaining });
    availabilityWrap.appendChild(spotsBadgeContainer.firstChild ?? spotsBadgeContainer);
    newsletterAvailabilityCol.appendChild(availabilityWrap);
  }

  const navItemsCol = document.createElement('div');
  navItemsCol.className = 'grid-span-12 lg:grid-span-2 lg:grid-start-6 pointer-events-auto';
  if (navigation?.items && navigation.items.length > 0) {
    const ul = document.createElement('ul');
    ul.className = 'flex flex-col items-start gap-4 space-y-4 lg:items-center';
    navigation.items.forEach((item) => ul.appendChild(renderNavItem(item)));
    navItemsCol.appendChild(ul);
  }

  const contactDevToolsCol = document.createElement('div');
  contactDevToolsCol.className = 'grid-span-12 lg:grid-span-3 lg:grid-start-10 pointer-events-auto flex flex-col gap-16';
  if (contactInformation) {
    const contactWrap = document.createElement('div');
    contactWrap.className = 'prose prose-sm text-foreground-muted';
    SanityRichText(contactWrap, { value: contactInformation });
    contactDevToolsCol.appendChild(contactWrap);
  }
  const devToolsWrap = document.createElement('div');
  devToolsWrap.className = 'flex flex-col gap-4 text-accent-sm text-foreground-muted opacity-40';
  const gridButton = document.createElement('button');
  gridButton.type = 'button';
  gridButton.className = 'flex cursor-pointer items-center gap-6';
  gridButton.addEventListener('click', dispatchGridShortcut);
  gridButton.innerHTML = '<kbd class="bg-surface px-4 py-2">\u2318G</kbd> grid';
  const colorButton = document.createElement('button');
  colorButton.type = 'button';
  colorButton.className = 'flex cursor-pointer items-center gap-6';
  colorButton.addEventListener('click', dispatchColorShortcut);
  colorButton.innerHTML = '<kbd class="bg-surface px-4 py-2">C</kbd> change color';
  devToolsWrap.appendChild(gridButton);
  devToolsWrap.appendChild(colorButton);
  contactDevToolsCol.appendChild(devToolsWrap);

  const navGrid = document.createElement('div');
  navGrid.className = 'grid-layout !gap-y-48 lg:gap-y-0';
  navGrid.appendChild(newsletterAvailabilityCol);
  navGrid.appendChild(navItemsCol);
  navGrid.appendChild(contactDevToolsCol);

  const copyrightRow = document.createElement('div');
  copyrightRow.className = 'pointer-events-auto pt-[12.5%] text-center text-body text-foreground-muted';
  const copyrightSpan = document.createElement('span');
  copyrightSpan.append('\u00A9 ', String(new Date().getFullYear()));
  copyrightRow.appendChild(copyrightSpan);
  if (copyrightNotice) {
    const noticeSpan = document.createElement('span');
    noticeSpan.className = 'prose prose-sm inline';
    noticeSpan.append(' ');
    SanityRichText(noticeSpan, { value: copyrightNotice });
    copyrightRow.appendChild(noticeSpan);
  }

  const watermarkOuter = document.createElement('div');
  watermarkOuter.className = 'mt-auto flex flex-col';
  if (showWatermark) {
    const watermarkWrap = document.createElement('div');
    watermarkWrap.className = 'mt-auto overflow-hidden';
    const shouldAnimateWatermark = hasStartedAnimating && !prefersReducedMotion;
    GoodFellaWatermark(watermarkWrap, {
      className: cx('text-foreground opacity-10', shouldAnimateWatermark && 'animate-watermark'),
      animate: shouldAnimateWatermark,
    });
    watermarkOuter.appendChild(watermarkWrap);
  }

  contentWrapper.appendChild(navGrid);
  contentWrapper.appendChild(copyrightRow);
  contentWrapper.appendChild(watermarkOuter);

  function destroyFooterClient() {
    reducedMotionMedia.removeEventListener('change', onReducedMotionChange);
    disposeScrollLockWatch?.();
    disposeRevealAnimation?.();
    disposeParallax?.();
  }

  return { element: outerWrapper, destroy: destroyFooterClient };
}
