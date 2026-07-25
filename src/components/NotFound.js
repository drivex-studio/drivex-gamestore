import { cx } from '../utils/cx.js'; // NOTE: org Module ID: 801335
// (converted from React hook: subscribeIdleGSAP)
import { watchIdleGSAP } from '../utils/idleGSAP.js'; // NOTE: org Module ID: 228744
// (converted from React hook: usePageEnter)
import { watchPageEnter } from '../utils/pageEnter.js'; // NOTE: org Module ID: 986950
// (converted from React hook: useHideFooter)
import { watchHideFooter } from '../utils/hideFooter.js'; // NOTE: org Module ID: 749978
// (converted from React hook: useMousePosition)
import { trackMousePosition } from '../utils/mousePosition.js'; // NOTE: org Module ID: 379215
// (converted from React hook: useIsTouchDevice)
import { isTouchDevice } from '../utils/isTouchDevice.js'; 
// (converted from React hook: useAsciiDelay)
import { getAsciiDelay } from '../utils/asciiDelay.js'; 

import { ASCII_GSAP_DURATION, ASCII_EASE, ASCII_COLOR_DELAY } from '../constants/ascii.js'; // NOTE: org Module ID: 399179

// EXTERNAL COMPONENT
import { initAsciiTypewriter } from '../components/AsciiTypewriter.js'; // NOTE: org Module ID: 387835
// EXTERNAL COMPONENT
import { initAnimatedButton } from '../components/AnimatedButton.js'; // NOTE: org Module ID: 411602

// -- Third-Party Libraries -----------------------------------------
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ---- AnimatedHeadline ----
const HEADING_CLASSES = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  h5: "text-h5",
  h6: "text-h6"
};

export function initAnimatedHeadline(parentElement, props = {}) {
  const {
    children,
    as = "h1",
    displayAs,
    className,
    skip,
    trigger = "manual",
    wrapperClassName,
    ...restProps
  } = props;

  // 1. Instance-scoped state
  let isRevealed = false;
  let scrollTriggerInstance = null;
  let idleGSAPObserver = null;
  const skipMotion = skip ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 2. DOM root setup
  const headingEl = document.createElement(as);
  const headingClassStr = cx(HEADING_CLASSES[displayAs ?? as], className);
  if (headingClassStr) headingEl.className = headingClassStr;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') headingEl.setAttribute(k, v);
  });

  let wrapperEl = null;
  let rootEl = headingEl;

  if (trigger === "scroll") {
    wrapperEl = document.createElement('div');
    if (wrapperClassName) wrapperEl.className = wrapperClassName;
    wrapperEl.appendChild(headingEl);
    rootEl = wrapperEl;
  }

  if (parentElement) parentElement.appendChild(rootEl);

  // 3. Text Splitting & Layout Measurement
  const textContent = String(children || "");
  const explicitLines = textContent.split("\n");

  explicitLines.forEach((line, r) => {
    if (r > 0) headingEl.appendChild(document.createElement("br"));
    const words = line.split(/\s+/).filter(Boolean);
    words.forEach((word, s) => {
      if (s > 0) headingEl.appendChild(document.createTextNode(" "));
      const span = document.createElement("span");
      span.setAttribute("data-word", "true");
      span.setAttribute("data-explicit-line", r);
      span.textContent = word;
      headingEl.appendChild(span);
    });
  });

  const wordNodes = headingEl.querySelectorAll("[data-word]");
  const measuredLines = [];
  let currentLineWords = [];
  let previousTop = -Infinity;
  let previousExplicitLine = -1;

  for (const node of wordNodes) {
    const top = node.getBoundingClientRect().top;
    const explicitLineIdx = Number(node.dataset.explicitLine ?? -1);
    const isNewExplicitLine = (explicitLineIdx !== previousExplicitLine) && (-1 !== previousExplicitLine);

    if ((previousTop > -Infinity && top - previousTop > 2) || isNewExplicitLine) {
      measuredLines.push(currentLineWords.join(" "));
      currentLineWords = [];
    }
    currentLineWords.push(node.textContent || "");
    previousTop = top;
    previousExplicitLine = explicitLineIdx;
  }
  if (currentLineWords.length > 0) {
    measuredLines.push(currentLineWords.join(" "));
  }

  headingEl.innerHTML = "";
  measuredLines.forEach((lineText, r) => {
    if (r > 0) headingEl.appendChild(document.createElement("br"));

    const lineDiv = document.createElement("div");
    lineDiv.setAttribute("data-line", r);
    lineDiv.className = "relative inline-block";

    const innerSpan = document.createElement("span");
    innerSpan.setAttribute("data-line-inner", "true");
    innerSpan.className = "block whitespace-nowrap";
    innerSpan.textContent = lineText;
    lineDiv.appendChild(innerSpan);

    if (!skipMotion) {
      const brandRect = document.createElement("div");
      brandRect.setAttribute("data-brand-rect", "true");
      brandRect.className = "absolute -inset-x-[0.1em] -inset-y-[0.1em] bg-brand";
      lineDiv.appendChild(brandRect);

      const fgRect = document.createElement("div");
      fgRect.setAttribute("data-fg-rect", "true");
      fgRect.className = "absolute -inset-x-[0.1em] -inset-y-[0.1em] bg-foreground";
      lineDiv.appendChild(fgRect);
    }

    headingEl.appendChild(lineDiv);
  });

  if (!skipMotion && measuredLines.length > 0) {
    gsap.set(headingEl.querySelectorAll("[data-line-inner]"), { opacity: 0 });
    gsap.set(headingEl.querySelectorAll("[data-brand-rect], [data-fg-rect]"), { scaleX: 0, transformOrigin: "left" });
  }

  if (trigger === "scroll" && !skipMotion && measuredLines.length > 0) {
    idleGSAPObserver = watchIdleGSAP(() => {
      const triggerTarget = wrapperEl || headingEl;
      if (triggerTarget) {
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: triggerTarget,
          start: "top bottom",
          once: true,
          onEnter: () => reveal()
        });
      }
    });
  }

  function reveal(delay = 0) {
    if (isRevealed || skipMotion || !headingEl) return;
    isRevealed = true;
    
    const lines = headingEl.querySelectorAll("[data-line]");
    for (let r = 0; r < lines.length; r++) {
      const lineEl = lines[r];
      if (!lineEl) continue;
      
      const tlDelay = delay + 0.15 * r;
      const innerText = lineEl.querySelector("[data-line-inner]");
      const brandRect = lineEl.querySelector("[data-brand-rect]");
      const fgRect = lineEl.querySelector("[data-fg-rect]");
      
      if (!innerText || !brandRect || !fgRect) continue;

      const rects = [brandRect, fgRect];
      const tl = gsap.timeline({ delay: tlDelay });
      
      tl.to(brandRect, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, 0);
      tl.to(fgRect, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, 0.1);
      tl.set(innerText, { opacity: 1 }, 0.5);
      tl.set(rects, { transformOrigin: "right" }, 0.5);
      tl.to(fgRect, { scaleX: 0, duration: 0.45, ease: "power3.inOut" }, 0.5);
      tl.to(brandRect, { scaleX: 0, duration: 0.45, ease: "power3.inOut" }, 0.6);
    }
  }

  function reset() {
    isRevealed = false;
    if (!headingEl) return;
    gsap.set(headingEl.querySelectorAll("[data-line-inner]"), { opacity: 0 });
    gsap.set(headingEl.querySelectorAll("[data-brand-rect], [data-fg-rect]"), { scaleX: 0, transformOrigin: "left" });
  }

  function destroy() {
    if (scrollTriggerInstance) scrollTriggerInstance.kill();
    if (idleGSAPObserver && typeof idleGSAPObserver.destroy === 'function') idleGSAPObserver.destroy();
    gsap.killTweensOf(headingEl.querySelectorAll('*'));
    gsap.killTweensOf(headingEl);
    rootEl.remove();
  }

  return { el: rootEl, reveal, reset, destroy };
}

// ---- NotFoundPage ----
export function initNotFoundPage(parentElement, props = {}) {
  const {
    headline = "Seems like you're lost.",
    description = "Looks like this page was moved or the link is broken.",
    imageSrc = "/The_Great_Wave_off_Kanagawa_edited.png",
    mobileImageSrc,
    depthMapSrc = "/The_Great_Wave_off_Kanagawa_edited_depth.png",
    color = "#ff6b4a",
    colorDark = "#1a0a2e",
    cellSize = 10,
    parallaxIntensity = 0.12,
    revealOriginX,
    revealOriginY,
    ...restProps
  } = props;

  // 1. Instance-scoped state
  let isMounted = true; 
  let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = isTouchDevice();
  const asciiDelay = getAsciiDelay();
  const progressRef = { progress: 0, colorProgress: 0 };
  const childInstances = [];

  // 2. DOM Root setup
  const rootEl = document.createElement('div');
  rootEl.setAttribute('data-theme', 'dark');
  rootEl.className = "relative flex h-svh flex-col bg-background";
  
  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') rootEl.setAttribute(k, v);
  });

  // Background layer
  const bgWrapper = document.createElement('div');
  bgWrapper.className = "absolute inset-0 overflow-hidden";
  const bgInner = document.createElement('div');
  bgInner.className = "absolute inset-x-0 top-0 h-[115%] w-full";
  const containerRefEl = document.createElement('div');
  containerRefEl.className = "relative size-full";
  bgInner.appendChild(containerRefEl);
  bgWrapper.appendChild(bgInner);
  rootEl.appendChild(bgWrapper);

  // Foreground layer
  const fgWrapper = document.createElement('div');
  fgWrapper.className = "pointer-events-none relative z-10 mb-[10vh] flex flex-1 flex-col items-center justify-center px-16";
  const fgInner = document.createElement('div');
  fgInner.className = "flex flex-col items-center gap-36 text-center";
  const textContainer = document.createElement('div');
  textContainer.className = "flex flex-col items-center gap-4";
  
  const headlineInstance = initAnimatedHeadline(textContainer, {
    as: "h1",
    className: "text-foreground text-h3",
    skip: prefersReducedMotion,
    children: headline
  });
  childInstances.push(headlineInstance);

  const descriptionEl = document.createElement('p');
  descriptionEl.className = "-mb-[0.1em] overflow-hidden pb-[0.1em] text-body text-foreground-muted";
  const descriptionInner = document.createElement('span');
  descriptionInner.setAttribute('data-line-inner', 'true');
  descriptionInner.className = "block";
  descriptionInner.textContent = description;
  descriptionEl.appendChild(descriptionInner);
  textContainer.appendChild(descriptionEl);
  
  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = "pointer-events-auto opacity-0";

  // EXTERNAL COMPONENT: next/link reconstructed natively
  const linkEl = document.createElement('a');
  linkEl.href = "/";
  linkEl.textContent = "Back to homepage";
  
  const buttonInstance = initAnimatedButton(buttonWrapper, {
    asChild: true,
    children: linkEl
  });
  if (buttonInstance) childInstances.push(buttonInstance);

  fgInner.appendChild(textContainer);
  fgInner.appendChild(buttonWrapper);
  fgWrapper.appendChild(fgInner);
  rootEl.appendChild(fgWrapper);

  // 3. Feature Setup (Background ASCII or Image fallback)
  let asciiInstance = null;
  const enableAscii = isMounted && !prefersReducedMotion;
  const enableImageFallback = isMounted && prefersReducedMotion && !isTouch;

  const mouseTrackerObserver = trackMousePosition(
    { enabled: enableAscii && !isTouch, containerRef: { current: containerRefEl } },
    (pos) => {
      if (asciiInstance && typeof asciiInstance.update === 'function') {
        asciiInstance.update({ mouseX: pos.mouseX, mouseY: pos.mouseY, isHovering: pos.isHovering });
      }
    }
  );

  if (enableAscii) {
    asciiInstance = initAsciiTypewriter(containerRefEl, {
      imageSrc: isTouch ? (mobileImageSrc ?? imageSrc) : imageSrc,
      alignX: "center",
      alignY: "bottom",
      fit: "contain",
      mobileFit: "cover",
      enableGooeyReveal: !isTouch,
      gooeyRadius: 0.035,
      gooeySoftness: 0.04,
      gooeyNoiseIntensity: 0.02,
      color: color,
      colorDark: colorDark,
      cellSize: cellSize,
      depthMapSrc: isTouch ? undefined : depthMapSrc,
      enableDepthParallax: !isTouch && !!depthMapSrc,
      parallaxIntensity: parallaxIntensity,
      externalProgress: 0,
      externalColorProgress: 0,
      disableInternalAnimation: true,
      ...(revealOriginX != null && revealOriginY != null ? { revealOrigin: { x: revealOriginX, y: revealOriginY } } : {})
    });
    childInstances.push(asciiInstance);
  } else if (enableImageFallback && (mobileImageSrc || imageSrc)) {
    const imgWrapper = document.createElement('div');
    imgWrapper.className = "absolute inset-0 flex animate-fade-in items-end justify-end";
    const imgEl = document.createElement('img');
    imgEl.src = mobileImageSrc || imageSrc;
    imgEl.alt = "";
    imgEl.className = "h-full";
    imgWrapper.appendChild(imgEl);
    containerRefEl.appendChild(imgWrapper);
  }

  // Initial GSAP Set state
  if (!prefersReducedMotion) {
    gsap.set(descriptionInner, { yPercent: 110 });
  }

  // 4. Behavioral event wiring
  function handlePageEnter(delay = 0) {
    if (prefersReducedMotion) {
      if (asciiInstance?.update) asciiInstance.update({ externalProgress: 1, externalColorProgress: 1 });
      headlineInstance.reveal();
      gsap.set(descriptionInner, { yPercent: 0 });
      gsap.set(buttonWrapper, { opacity: 1 });
      return;
    }

    gsap.to(progressRef, {
      progress: 1,
      duration: ASCII_GSAP_DURATION,
      delay: delay,
      ease: ASCII_EASE,
      onUpdate: () => {
        if (asciiInstance?.update) asciiInstance.update({ externalProgress: progressRef.progress });
      }
    });

    gsap.to(progressRef, {
      colorProgress: 1,
      duration: ASCII_GSAP_DURATION,
      delay: delay + ASCII_COLOR_DELAY,
      ease: ASCII_EASE,
      onUpdate: () => {
        if (asciiInstance?.update) asciiInstance.update({ externalColorProgress: progressRef.colorProgress });
      }
    });

    const t = delay + (asciiDelay || 0);

    headlineInstance.reveal(t);

    gsap.to(descriptionInner, {
      yPercent: 0,
      duration: 0.8,
      ease: "expo.out",
      delay: t + 0.15
    });

    gsap.to(buttonWrapper, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
      delay: t + 0.3
    });
  }

  const pageEnterObserver = watchPageEnter(handlePageEnter, { priority: 0 });
  const hideFooterObserver = watchHideFooter();

  const prefersMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function handleMotionChange(e) {
    prefersReducedMotion = e.matches;
  }
  prefersMotionQuery.addEventListener("change", handleMotionChange);

  // 5. Teardown
  function destroy() {
    prefersMotionQuery.removeEventListener("change", handleMotionChange);
    if (pageEnterObserver && typeof pageEnterObserver.destroy === 'function') pageEnterObserver.destroy();
    if (hideFooterObserver && typeof hideFooterObserver.destroy === 'function') hideFooterObserver.destroy();
    if (mouseTrackerObserver && typeof mouseTrackerObserver.destroy === 'function') mouseTrackerObserver.destroy();
    childInstances.forEach(inst => inst?.destroy?.());
    
    gsap.killTweensOf(progressRef);
    gsap.killTweensOf(descriptionInner);
    gsap.killTweensOf(buttonWrapper);
    
    rootEl.remove();
  }

  if (parentElement) parentElement.appendChild(rootEl);
  return { el: rootEl, destroy };
}
