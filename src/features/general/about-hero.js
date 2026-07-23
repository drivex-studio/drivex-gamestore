import { initAnimatedHeadline } from '../AnimatedHeadline.js';
import { initAnimatedSubtext } from '../AnimatedSubtext.js';
import { initButtonGroup } from '../ButtonGroup.js';

import { initSanityMedia } from '../../media/SanityMedia.js'; 

import { initGoodFellaWatermark } from '../../components/ui/GoodFellaWatermark.js'; 

// -- Shared Utilities & Context ---------------------------------
import { cx } from '../../utils/cx.js'; 
import { getImageSrc, getImageSrcSet } from '../../media/shared/sanityImageUtils.js'; 
import { HIGH_RES_SOURCE_WIDTHS } from '../../media/shared/mediaConstants.js'; 


import { usePageEnterContext } from '../../hooks/usePageEnterContext.js'; 
import { usePageEnter } from '../../hooks/usePageEnter.js'; 

import gsap from 'gsap'; 
import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
gsap.registerPlugin(ScrollTrigger);


function initFittedText(parentElement, props = {}) {
  const { text = '', className = '' } = props;

  const el = document.createElement('div');
  el.className = `overflow-hidden ${className}`.trim();

  const innerContainer = document.createElement('div');
  innerContainer.className = 'whitespace-nowrap font-bold tracking-tighter';
  innerContainer.style.lineHeight = '0.75em';

  // Build character spans
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.setAttribute('data-scroll-char', 'true');
    span.className = 'inline-block';
    // Maintain single spaces as literal spaces
    span.textContent = char === " " ? " " : char; 
    innerContainer.appendChild(span);
  });

  el.appendChild(innerContainer);

  // ResizeObserver mimicking the original React useLayoutEffect logic
  const resizeObserver = new ResizeObserver(() => {
    innerContainer.style.fontSize = "100px";
    innerContainer.style.width = "max-content";
    
    const outerWidth = el.offsetWidth;
    const innerWidth = innerContainer.offsetWidth;
    
    innerContainer.style.width = "";
    if (innerWidth > 0) {
      innerContainer.style.fontSize = `${100 * outerWidth / innerWidth}px`;
    }
  });

  resizeObserver.observe(el);

  function destroy() {
    resizeObserver.disconnect();
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}

// ---- HeroParallax ----
export function initHeroParallax(parentElement, props = {}) {
  const {
    media,
    mobileImage,
    headline,
    headlineLevel,
    headlineDisplay,
    subtext,
    ctas,
    scrollText,
    useWatermark,
    className
  } = props;

  // 1. Instance-scoped state
  let isRevealed = false;
  let pageEnterUnsubscribe = null;
  const childInstances = [];
  
  // Element References
  let bgContainer;
  let textGridContainer;
  let ctaContainer;
  let watermarkContainer;
  
  // Computed Image/Video Properties
  const { prefersReducedMotion } = usePageEnterContext();
  const isVideo = media.type === "video" || media.type === "externalVideo";
  const highResOpts = media.highResolution ? { sourceWidths: HIGH_RES_SOURCE_WIDTHS } : {};
  
  const desktopSrc = media.type === "image" && media.image ? getImageSrc(media.image, { width: 1920, ...highResOpts }) : null;
  const desktopSrcSet = media.type === "image" && media.image ? getImageSrcSet(media.image, highResOpts) : undefined;
  const desktopAlt = media.type === "image" && media.image ? (media.image.altText ?? media.image.description ?? media.image.title ?? "") : "";

  const mobileSrc = mobileImage ? getImageSrc(mobileImage, { width: 720, quality: 80 }) : null;
  const mobileSrcSet = mobileImage ? getImageSrcSet(mobileImage, { quality: 80, sourceWidths: [320, 480, 600, 720, 828, 960, 1080, 1200, 1440] }) : undefined;
  const mobileAlt = mobileImage ? (mobileImage.altText ?? mobileImage.description ?? mobileImage.title ?? "") : "";

  // 2. DOM root setup
  const el = document.createElement('div');
  el.className = cx("relative h-svh lg:h-[150vh]", className);

  // --- Background Layer ---
  const bgWrapper = document.createElement('div');
  bgWrapper.className = "pointer-events-none absolute inset-0 overflow-hidden";

  if (mobileSrc) {
    const mobileDiv = document.createElement('div');
    mobileDiv.className = "size-full lg:hidden";
    
    // EXTERNAL COMPONENT: next/image translated to native <img>
    const mobileImg = document.createElement('img');
    mobileImg.src = mobileSrc;
    if (mobileSrcSet) mobileImg.srcset = mobileSrcSet;
    mobileImg.sizes = "100vw lg:0px";
    mobileImg.alt = mobileAlt;
    mobileImg.className = "size-full object-cover";
    mobileImg.loading = "eager";
    mobileImg.fetchPriority = "high";
    mobileDiv.appendChild(mobileImg);
    
    bgWrapper.appendChild(mobileDiv);
  }

  bgContainer = document.createElement('div');
  bgContainer.className = cx("size-full", mobileSrc && "hidden lg:block");
  bgContainer.style.willChange = "transform";

  if (isVideo) {
    const mediaInst = initSanityMedia(bgContainer, {
      media: media,
      className: "size-full",
      autoPlay: true,
      loop: true,
      imageProps: { sizes: "100vw" }
    });
    if (mediaInst) childInstances.push(mediaInst);
  } else if (desktopSrc) {
    // EXTERNAL COMPONENT: next/image translated to native <img>
    const desktopImg = document.createElement('img');
    desktopImg.src = desktopSrc;
    if (desktopSrcSet) desktopImg.srcset = desktopSrcSet;
    desktopImg.sizes = "100vw";
    desktopImg.alt = desktopAlt;
    desktopImg.className = "size-full object-cover";
    desktopImg.loading = "eager";
    desktopImg.fetchPriority = "high";
    bgContainer.appendChild(desktopImg);
  }
  
  bgWrapper.appendChild(bgContainer);

  const overlay1 = document.createElement('div');
  overlay1.className = "absolute inset-0 bg-background/10";
  bgWrapper.appendChild(overlay1);

  const overlay2 = document.createElement('div');
  overlay2.className = "absolute inset-x-0 top-0 h-1/2";
  overlay2.style.background = "linear-gradient(to bottom, rgb(20 19 20 / 0.5), transparent)";
  bgWrapper.appendChild(overlay2);

  el.appendChild(bgWrapper);

  // --- Content Grid Layer ---
  textGridContainer = document.createElement('div');
  textGridContainer.className = "grid-container relative min-h-svh pt-80 lg:h-screen";

  const gridLayout = document.createElement('div');
  gridLayout.className = "grid-layout";

  const innerContent = document.createElement('div');
  innerContent.className = "grid-span-12 lg:grid-subgrid flex flex-col justify-center gap-16";

  let headlineInst = null;
  if (headline) {
    headlineInst = initAnimatedHeadline(innerContent, {
      as: headlineLevel ?? 'h1',
      displayAs: headlineDisplay ?? undefined,
      className: "lg:grid-span-12 lg:grid-subgrid text-foreground",
      skip: prefersReducedMotion,
      children: headline
    });
    if (headlineInst) childInstances.push(headlineInst);
  }

  let subtextInst = null;
  if (subtext) {
    subtextInst = initAnimatedSubtext(innerContent, {
      className: "text-body lg:max-w-xl",
      skip: prefersReducedMotion,
      children: subtext
    });
    if (subtextInst) childInstances.push(subtextInst);
  }

  if (ctas) {
    ctaContainer = document.createElement('div');
    const ctasInst = initButtonGroup(ctaContainer, { buttonGroup: ctas });
    if (ctasInst) childInstances.push(ctasInst);
    innerContent.appendChild(ctaContainer);
  }

  gridLayout.appendChild(innerContent);
  textGridContainer.appendChild(gridLayout);
  el.appendChild(textGridContainer);

  // --- Watermark / Scroll Text Layer ---
  if (scrollText || useWatermark) {
    watermarkContainer = document.createElement('div');
    watermarkContainer.className = "absolute inset-x-0 bottom-0 overflow-hidden text-foreground/40";

    if (scrollText) {
      const fittedTextInst = initFittedText(watermarkContainer, {
        text: scrollText,
        className: "w-full"
      });
      if (fittedTextInst) childInstances.push(fittedTextInst);
    } else {
      const watermarkInst = initGoodFellaWatermark(watermarkContainer, {});
      if (watermarkInst) childInstances.push(watermarkInst);
    }
    
    el.appendChild(watermarkContainer);
  }

  // 3. Page Enter Animation Wiring
  function handlePageEnter(eTime) {
    if (isRevealed) return;
    isRevealed = true;
    
    const t = eTime + 0.3;
    if (headlineInst && typeof headlineInst.reveal === 'function') headlineInst.reveal(t);
    if (subtextInst && typeof subtextInst.reveal === 'function') subtextInst.reveal(t + 0.15);

    const timeline = gsap.timeline({ delay: t + 0.2 });
    if (ctaContainer) {
      timeline.to(ctaContainer, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.1);
    }
  }

  pageEnterUnsubscribe = usePageEnter(handlePageEnter, { priority: 1, skip: prefersReducedMotion });

  // 4. Scroll GSAP Animations
  let gsapContext = gsap.context(() => {
    if (!prefersReducedMotion && ctaContainer) {
      gsap.set(ctaContainer, { opacity: 0, y: 20 });
    }

    if (!prefersReducedMotion) {
      if (bgContainer) {
        gsap.set(bgContainer, { clearProps: "transform" });
        gsap.to(bgContainer, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      }

      if (textGridContainer) {
        gsap.set(textGridContainer, { clearProps: "transform" });
        gsap.to(textGridContainer, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      }

      if (watermarkContainer) {
        const hasScrollText = !!scrollText;
        const targets = watermarkContainer.querySelectorAll(hasScrollText ? "[data-scroll-char]" : "svg > g");
        
        if (targets.length > 0) {
          gsap.set(targets, { clearProps: "all" });
          const isMobile = window.matchMedia("(max-width: 1023px)").matches;
          
          if (hasScrollText) {
            gsap.set(targets, { yPercent: 110 });
          } else {
            gsap.set(targets, { y: 345 });
          }
          
          gsap.to(targets, {
            y: 0,
            yPercent: 0,
            ease: "power3.out",
            stagger: isMobile ? 0.01 : 0.025,
            scrollTrigger: {
              trigger: el,
              start: "10% top",
              end: isMobile ? "30% top" : "80% top",
              scrub: 1,
              invalidateOnRefresh: true
            }
          });
        }
      }
    }
  }, el);

  // 5. Teardown
  function destroy() {
    if (typeof pageEnterUnsubscribe === 'function') {
      pageEnterUnsubscribe();
    }
    gsapContext.revert();
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}
