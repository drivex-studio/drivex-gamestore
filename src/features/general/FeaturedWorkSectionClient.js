
import { gsap, ScrollTrigger } from '../../vendor.js';

import { getLenis } from '../../lib/lenisState.js';
import { useDualLayerScramble } from '../../utils/FlipIndicator.js';
import { useIdleGSAP } from '../../hooks/useIdleGSAP.js';
import { cx } from '../../utils/cx.js';

import { initScrollAnimatedHeadline } from '../ScrollAnimatedHeadline.js';
import { initFlipIndicator } from '../../utils/FlipIndicator.js';
import { initSanityButton } from '../SanityButton.js';

import { initSanityImage, initSanityMedia } from '../shared.js';

function easingOutCubic(e) {
  return 1 - (1 - e) ** 3;
}

function incrementRotation(e) {
  return e + 1;
}

function appendDesktopTags(container, tags) {
  tags.forEach((tag, idx) => {
    if (idx > 0) {
      const sep = document.createElement('span');
      sep.className = 'text-foreground-muted';
      sep.textContent = '--';
      container.appendChild(sep);
    }
    const tEl = document.createElement('span');
    tEl.className = 'text-accent-sm uppercase';
    tEl.textContent = `[${tag}]`;
    container.appendChild(tEl);
  });
}

function appendMobileTags(container, tags) {
  tags.forEach((tag, idx) => {
    if (idx > 0) {
      const sep = document.createElement('span');
      sep.className = 'text-foreground-muted';
      sep.textContent = '--';
      container.appendChild(sep);
    }
    const tEl = document.createElement('span');
    tEl.textContent = `[${tag}]`;
    container.appendChild(tEl);
  });
}

export function initMobileCaseStudyCard(parentElement, props = {}) {
  const { study, index } = props;
  const childInstances = [];

  const el = document.createElement('div');
  el.className = 'flex flex-col';

  const link = document.createElement('a');
  link.href = study.uri ?? '#';
  link.className = 'group relative block aspect-[16/10] overflow-hidden';
  link.setAttribute('data-cursor-text', 'VIEW PROJECT');
  el.appendChild(link);

  if (study.featuredMedia) {
    const mediaInst = initSanityMedia(link, {
      media: study.featuredMedia,
      className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
      imageProps: index === 0 ? { priority: true } : undefined
    });
    if (mediaInst) childInstances.push(mediaInst);
  }

  const infoWrap = document.createElement('div');
  infoWrap.className = 'mt-16 flex flex-col gap-8';
  el.appendChild(infoWrap);

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-h5';
  titleEl.textContent = study.title || '';
  infoWrap.appendChild(titleEl);

  if (study.tags && study.tags.length > 0) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'flex flex-wrap items-center gap-8 text-accent-sm text-foreground-muted';
    appendMobileTags(tagsWrap, study.tags);
    infoWrap.appendChild(tagsWrap);
  }

  function destroy() {
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}

export function initScrambleTitle(parentElement, props = {}) {
  const { title, onRegisterScramble } = props;

  const el = document.createElement('h3');
  el.className = 'text-accent-lg';
  el.textContent = title || '';

  let hasTriggered = false;

  const { scramble } = useDualLayerScramble(el, { duration: 0.5 });

  if (onRegisterScramble) {
    onRegisterScramble(scramble);
  }

  function setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      onEnter: () => {
        if (!hasTriggered) {
          hasTriggered = true;
          scramble();
        }
      }
    });
  }

  useIdleGSAP(setupScrollTrigger, { dependencies: [scramble] });

  function destroy() {
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}

export function initFeaturedWorkSectionClient(parentElement, props = {}) {
  const { section } = props;
  const content = section?.content ?? {};
  const { headline, text, viewAllButton, caseStudies } = content;

  if (!caseStudies || !caseStudies.length) {
    return { els: [], destroy: () => {} };
  }

  let activeCaseStudyIndex = 0;
  let flipIndicatorRotation = 0;
  let isScrolling = false;

  const sectionRefs = [];
  const mediaRefs = [];
  const scrambleFns = [];
  const navButtonData = [];
  const observers = [];
  const childInstances = [];

  const lenis = getLenis();

  function updateActiveState(newIndex, newRotation = flipIndicatorRotation) {
    activeCaseStudyIndex = newIndex;
    flipIndicatorRotation = newRotation;

    navButtonData.forEach((nav, idx) => {
      const isActive = idx === activeCaseStudyIndex;

      if (isActive) {
        nav.btn.setAttribute('aria-current', 'true');
      } else {
        nav.btn.removeAttribute('aria-current');
      }

      nav.imgContainer.className = cx(
        'relative aspect-[16/9] w-128 overflow-hidden transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-40'
      );

      if (isActive) {
        if (nav.indicatorInst) {
          nav.indicatorInst.destroy?.();
        }
        nav.indicatorInst = initFlipIndicator(nav.btn, {
          layoutId: 'featured-work-indicator',
          className: 'h-8 w-8 bg-brand',
          rotate: 90 * flipIndicatorRotation
        });
        childInstances.push(nav.indicatorInst);
      } else {
        if (nav.indicatorInst) {
          nav.indicatorInst.destroy?.();
          nav.indicatorInst = null;
        }
      }
    });
  }

  const desktopContainer = document.createElement('div');
  desktopContainer.className = 'hidden py-128 lg:block';

  const desktopGrid = document.createElement('div');
  desktopGrid.className = 'grid-container';
  desktopContainer.appendChild(desktopGrid);

  const desktopLayout = document.createElement('div');
  desktopLayout.className = 'grid-layout';
  desktopGrid.appendChild(desktopLayout);

  const leftSidebar = document.createElement('div');
  leftSidebar.className = 'grid-span-3';
  desktopLayout.appendChild(leftSidebar);

  const stickyWrap = document.createElement('div');
  stickyWrap.className = 'sticky top-header flex h-[calc(100vh-var(--site-header-height))] flex-col justify-between py-32 align-start';
  leftSidebar.appendChild(stickyWrap);

  const textWrap = document.createElement('div');
  stickyWrap.appendChild(textWrap);

if (headline && headline.text) {
  const hlInst = initScrollAnimatedHeadline({
    headline: { text: headline.text, level: headline.level ?? 'h2' },
    className: 'mb-24'
  });
  if (hlInst && hlInst.element) {
    textWrap.appendChild(hlInst.element);
  }
  childInstances.push(hlInst);
}

  if (text) {
    const pEl = document.createElement('p');
    pEl.className = 'whitespace-pre-line text-body text-foreground-muted';
    pEl.textContent = text;
    textWrap.appendChild(pEl);
  }

  const navEl = document.createElement('nav');
  navEl.className = 'flex flex-col items-start gap-8';
  stickyWrap.appendChild(navEl);

  const rightList = document.createElement('div');
  rightList.className = 'grid-span-8 grid-start-5 flex flex-col gap-64 py-32';
  desktopLayout.appendChild(rightList);

  caseStudies.forEach((study, idx) => {
    
    const itemWrap = document.createElement('div');
    itemWrap.className = 'flex flex-col';
    sectionRefs[idx] = itemWrap;
    rightList.appendChild(itemWrap);

    const linkEl = document.createElement('a');
    linkEl.href = study.uri ?? '#';
    linkEl.className = 'group relative block aspect-[16/10] overflow-hidden';
    linkEl.setAttribute('data-cursor-text', 'VIEW PROJECT');

    linkEl.addEventListener('mouseenter', () => {
      if (scrambleFns[idx]) scrambleFns[idx]();
    });
    itemWrap.appendChild(linkEl);

    if (study.featuredMedia) {
      const mediaWrap = document.createElement('div');
      mediaWrap.className = 'h-full w-full';
      mediaWrap.style.willChange = 'transform';
      mediaRefs[idx] = mediaWrap;
      linkEl.appendChild(mediaWrap);

      const mediaInst = initSanityMedia(mediaWrap, {
        media: study.featuredMedia,
        className: 'zoom-in-image h-full w-full object-cover',
        imageProps: idx === 0 ? { priority: true } : undefined
      });
      childInstances.push(mediaInst);
    }

    const infoWrap = document.createElement('div');
    infoWrap.className = 'mt-16 flex items-start justify-between gap-16';
    itemWrap.appendChild(infoWrap);

    const scrambleInst = initScrambleTitle(infoWrap, {
      title: study.title,
      onRegisterScramble: (fn) => { scrambleFns[idx] = fn; }
    });
    childInstances.push(scrambleInst);

    if (study.tags && study.tags.length > 0) {
      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'flex items-center gap-8 text-body text-foreground-muted';
      appendDesktopTags(tagsWrap, study.tags);
      infoWrap.appendChild(tagsWrap);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'group relative flex cursor-pointer items-center gap-12';
    btn.setAttribute('aria-label', `Go to ${study.title ?? `case study ${idx + 1}`}`);

    btn.addEventListener('mouseenter', () => {
      if (scrambleFns[idx]) scrambleFns[idx]();
    });

    btn.addEventListener('click', () => {
      const targetEl = sectionRefs[idx];
      if (!targetEl || !lenis || activeCaseStudyIndex === idx) return;

      isScrolling = true;
      updateActiveState(idx, incrementRotation(flipIndicatorRotation));

      const rect = targetEl.getBoundingClientRect();
      const targetScrollY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;

      lenis.scrollTo(targetScrollY, {
        duration: 0.8,
        easing: easingOutCubic,
        onComplete: () => { isScrolling = false; }
      });
    });

    const imgContainer = document.createElement('div');
    btn.appendChild(imgContainer);

    if (study.thumbnail) {
      const thumbInst = initSanityImage(imgContainer, {
        image: study.thumbnail,
        alt: study.title ?? 'Case study thumbnail',
        className: 'h-full w-full object-cover'
      });
      childInstances.push(thumbInst);
    }

    navEl.appendChild(btn);

    navButtonData.push({
      btn,
      imgContainer,
      indicatorInst: null
    });
  });

  if (viewAllButton) {
    const btnWrap = document.createElement('div');
    stickyWrap.appendChild(btnWrap);
    const btnEl = initSanityButton({ button: viewAllButton });
    if (btnEl) {
      btnWrap.appendChild(btnEl);
      childInstances.push({ destroy: () => btnEl.remove() });
    }
  }

  const mobileContainer = document.createElement('div');
  mobileContainer.className = 'grid-container py-32 lg:hidden';

  const mobileTextWrap = document.createElement('div');
  mobileTextWrap.className = 'mb-32';
  mobileContainer.appendChild(mobileTextWrap);

if (headline && headline.text) {
  const hlInst = initScrollAnimatedHeadline({
    headline: { text: headline.text, level: headline.level ?? 'h2' },
    className: 'mb-16'
  });
  if (hlInst && hlInst.element) {
    mobileTextWrap.appendChild(hlInst.element);
  }
  childInstances.push(hlInst);
}

  if (text) {
    const mobilePEl = document.createElement('p');
    mobilePEl.className = 'whitespace-pre-line text-body text-foreground-muted';
    mobilePEl.textContent = text;
    mobileTextWrap.appendChild(mobilePEl);
  }

  const mobileList = document.createElement('div');
  mobileList.className = 'flex flex-col gap-32';
  mobileContainer.appendChild(mobileList);

  caseStudies.forEach((study, idx) => {
    const cardInst = initMobileCaseStudyCard(mobileList, { study, index: idx });
    childInstances.push(cardInst);
  });

  if (viewAllButton) {
    const mobileBtnWrap = document.createElement('div');
    mobileBtnWrap.className = 'mt-32';
    mobileContainer.appendChild(mobileBtnWrap);
    const mBtnEl = initSanityButton({ button: viewAllButton });
    if (mBtnEl) {
      mobileBtnWrap.appendChild(mBtnEl);
      childInstances.push({ destroy: () => mBtnEl.remove() });
    }
  }

  function setupIntersectionObserver() {
    sectionRefs.forEach((refEl, idx) => {
      if (!refEl) return;
      const observer = new IntersectionObserver((entries) => {
        if (!isScrolling) {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && activeCaseStudyIndex !== idx) {
              updateActiveState(idx, flipIndicatorRotation);
            }
          });
        }
      }, { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' });

      observer.observe(refEl);
      observers.push(observer);
    });
  }
  setupIntersectionObserver();

  function setupGSAP() {
    if (!window.matchMedia('(max-width: 1023px)').matches) {
      mediaRefs.forEach(mediaEl => {
        if (mediaEl) {
          gsap.set(mediaEl, { scale: 1.3 });
          gsap.fromTo(mediaEl,
            { yPercent: -15 },
            {
              yPercent: 15,
              ease: 'none',
              scrollTrigger: {
                trigger: mediaEl.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true
              }
            }
          );
        }
      });
    }
  }
  useIdleGSAP(setupGSAP, { dependencies: [caseStudies?.length] });

  updateActiveState(0, 0);

  if (parentElement) {
    parentElement.appendChild(desktopContainer);
    parentElement.appendChild(mobileContainer);
  }

  function destroy() {
    observers.forEach(obs => obs.disconnect());
    childInstances.forEach(inst => inst?.destroy?.());
    navButtonData.forEach(nav => nav.indicatorInst?.destroy?.());
    mediaRefs.forEach(mediaEl => {
      if (mediaEl) gsap.killTweensOf(mediaEl);
    });
    desktopContainer.remove();
    mobileContainer.remove();
  }

return { 
  els: [desktopContainer, mobileContainer], 
  mount: () => {
    childInstances.forEach(inst => inst?.mount?.());
  },
  destroy 
};
}