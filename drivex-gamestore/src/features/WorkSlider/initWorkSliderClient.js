
import { initFilterDropdown } from './FilterDropdown.js';
import { initSlideIndicator } from './SlideIndicator.js';
import { initViewModeSwitcher } from './ViewModeSwitcher.js';
import { createSliderNav } from './SliderNav.js';
import { initSlider } from './Slider.js';
import { createCaseStudyGridDuo } from './CaseStudyGridDuo.js';
import { createCaseStudyGrid } from './CaseStudyGrid.js';
import { createListView } from './ListView.js';
import { incrementScrambleKey, incrementRotationCount, toCompactItem, toFullItem } from './helpers.js';

import { initScrambleGroup } from '../../utils/ScrambleGroup.js';

export function initWorkSliderClient(parentEl, props = {}) {
  const { section } = props;
  const content = section?.content ?? {};
  const { filterLabel, caseStudies } = content;

  if (!caseStudies || caseStudies.length === 0) return null;

  let selectedFilter = null;
  let currentIndex = 0;
  let rotationCount = 0;
  let viewMode = 'slider';
  let containerHeight = 'auto';
  let scrambleKey = 0;
  let shouldFadeThrough = false;

  let sliderInstance = null; 
  let contentContainerEl = null; 
  let resizeObserver = null;

  const rootEl = document.createElement('div');

  function computeTagOptions() {
    const tagSet = new Set();
    for (const cs of caseStudies) {
      if (cs.tags) for (const tag of cs.tags) tagSet.add(tag);
    }
    return Array.from(tagSet).sort();
  }
  const tagOptions = computeTagOptions(); 

  function computeFilteredCaseStudies() {
    if (!selectedFilter) return caseStudies;
    return caseStudies.filter((cs) => cs.tags?.includes(selectedFilter));
  }

  const headerOuterEl = document.createElement('div');
  headerOuterEl.className = 'grid-container';
  const headerRowEl = document.createElement('div');
  headerRowEl.className = 'mb-16 flex items-end justify-between lg:grid lg:grid-cols-12 lg:items-center';
  headerOuterEl.appendChild(headerRowEl);

  const filterDropdown = initFilterDropdown(headerRowEl, {
    label: filterLabel ?? 'FILTER',
    options: tagOptions,
    value: selectedFilter,
    onChange: handleFilterChange,
    className: 'lg:col-span-4',
  });

  const indicatorTopWrapEl = document.createElement('div');
  indicatorTopWrapEl.className = 'hidden justify-center md:flex lg:col-span-4 transition-opacity duration-300';
  headerRowEl.appendChild(indicatorTopWrapEl);
  const indicatorTop = initSlideIndicator(indicatorTopWrapEl, {
    items: caseStudies.map(toCompactItem),
    currentIndex,
    onSelect: handleSelectSlide,
    rotationCount,
  });

  const viewSwitcherAndNavEl = document.createElement('div');
  viewSwitcherAndNavEl.className = 'flex items-center lg:col-span-4 lg:justify-end';
  headerRowEl.appendChild(viewSwitcherAndNavEl);

  const viewModeSwitcher = initViewModeSwitcher(viewSwitcherAndNavEl, {
    value: viewMode,
    onChange: handleViewModeChange,
  });

  const navCollapseEl = document.createElement('div');
  navCollapseEl.className = 'grid transition-[grid-template-columns] duration-300 ease-in-out';
  const navInnerEl = document.createElement('div');
  navInnerEl.className = 'overflow-hidden';
  const navPadEl = document.createElement('div');
  navPadEl.className = 'pl-16';
  const sliderNavEl = createSliderNav(handlePrev, handleNext);
  navPadEl.appendChild(sliderNavEl);
  navInnerEl.appendChild(navPadEl);
  navCollapseEl.appendChild(navInnerEl);
  viewSwitcherAndNavEl.appendChild(navCollapseEl);

  rootEl.appendChild(headerOuterEl);

  const heightWrapEl = document.createElement('div');
  heightWrapEl.className = 'overflow-hidden transition-[height] duration-400 [transition-timing-function:var(--ease-power4-in-out)]';
  contentContainerEl = document.createElement('div');
  heightWrapEl.appendChild(contentContainerEl);
  rootEl.appendChild(heightWrapEl);

  parentEl.appendChild(rootEl);

  let heightRaf = null;
  resizeObserver = new ResizeObserver((entries) => {
    const [entry] = entries;
    if (!entry) return;
    // Defer the DOM write to the next frame so we never mutate layout
    // synchronously inside the observer callback — doing so on an ancestor
    // of the observed element is what causes the browser to report
    // "ResizeObserver loop completed with undelivered notifications."
    if (heightRaf) cancelAnimationFrame(heightRaf);
    heightRaf = requestAnimationFrame(() => {
      heightRaf = null;
      const nextHeight = entry.contentRect.height;
      if (nextHeight === containerHeight) return;
      containerHeight = nextHeight;
      heightWrapEl.style.height = `${containerHeight}px`;
    });
  });
  resizeObserver.observe(contentContainerEl);

  currentIndex = 0;
  rotationCount = 0;

  let activeViewEl = null; 
  let activeScrambleGroup = null; 

  function destroyActiveView() {
    if (sliderInstance) {
      sliderInstance.destroy();
      sliderInstance = null;
    }
    activeScrambleGroup?.destroy?.();
    activeScrambleGroup = null;
    if (activeViewEl) {
      activeViewEl.parentNode?.removeChild(activeViewEl);
      activeViewEl = null;
    }
  }

  function renderActiveView() {
    
    destroyActiveView();

    const filteredCaseStudies = computeFilteredCaseStudies();

    if (viewMode === 'slider') {
      const sliderItems = filteredCaseStudies.map(toFullItem);
      const indicatorItems = filteredCaseStudies.map(toCompactItem);

      activeViewEl = document.createElement('div');
      activeViewEl.className = 'flex flex-col gap-32';

      sliderInstance = initSlider(activeViewEl, {
        items: sliderItems,
        onIndexChange: handleSlideIndexChange,
        className: 'page-enter-fade',
        scrambleKey,
      });

      const mobileIndicatorWrap = document.createElement('div');
      mobileIndicatorWrap.className = 'grid-container';
      activeViewEl.appendChild(mobileIndicatorWrap);
      initSlideIndicator(mobileIndicatorWrap, {
        items: indicatorItems,
        currentIndex,
        onSelect: handleSelectSlide,
        rotationCount,
        gap: 8,
        className: 'mt-32 md:hidden',
      });
    } else if (viewMode === 'duo') {
      
      activeViewEl = document.createElement('div');
      const groupResult = initScrambleGroup(activeViewEl, { stagger: 0.08, start: 'top 85%' });
      activeScrambleGroup = groupResult?.destroy ? groupResult : null;
      const targetEl = groupResult?.rootEl ?? activeViewEl;
      targetEl.appendChild(createCaseStudyGridDuo(filteredCaseStudies));
    } else if (viewMode === 'grid') {
      activeViewEl = document.createElement('div');
      const groupResult = initScrambleGroup(activeViewEl, { stagger: 0.08, start: 'top 85%' });
      activeScrambleGroup = groupResult?.destroy ? groupResult : null;
      const targetEl = groupResult?.rootEl ?? activeViewEl;
      targetEl.appendChild(createCaseStudyGrid(filteredCaseStudies));
    } else if (viewMode === 'list') {
      activeViewEl = document.createElement('div');
      activeViewEl.appendChild(createListView(filteredCaseStudies));
    }

    if (activeViewEl) {
      contentContainerEl.appendChild(activeViewEl);
      // Mirror the original's AnimatePresence behavior: only fade in when
      // entering or leaving slider mode. Switching directly between
      // duo/grid/list appears instantly, same as upstream (exit:undefined,
      // initial:false in that case).
      if (shouldFadeThrough) {
        activeViewEl.style.opacity = '0';
        activeViewEl.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (activeViewEl) activeViewEl.style.opacity = '1';
          });
        });
      }
    }
  }

  renderActiveView();

  function handlePrev() {
    sliderInstance?.goToPrev();
  }
  
  function handleNext() {
    sliderInstance?.goToNext();
  }
  
  function handleSelectSlide(index) {
    sliderInstance?.goToSlide(index);
  }
  
  function handleSlideIndexChange(index) {
    currentIndex = index;
    rotationCount = incrementRotationCount(rotationCount);
    indicatorTop?.update({ currentIndex, rotationCount });
  }

  function handleFilterChange(nextFilter) {
    selectedFilter = nextFilter;
    currentIndex = 0;
    rotationCount = 0;
    filterDropdown.update({ value: selectedFilter });
    indicatorTop?.update({ items: computeFilteredCaseStudies().map(toCompactItem), currentIndex, rotationCount });
    renderActiveView();
  }

  function handleViewModeChange(nextMode) {
    shouldFadeThrough = viewMode === 'slider' || nextMode === 'slider';
    viewMode = nextMode;
    currentIndex = 0;
    rotationCount = 0;
    scrambleKey = incrementScrambleKey(scrambleKey);

    viewModeSwitcher.update({ value: viewMode });
    
    const isSliderMode = viewMode === 'slider';
    indicatorTopWrapEl.style.opacity = isSliderMode ? '1' : '0';
    indicatorTopWrapEl.style.pointerEvents = isSliderMode ? 'auto' : 'none';
    navCollapseEl.style.gridTemplateColumns = isSliderMode ? '1fr' : '0fr';

    indicatorTop?.update({
      items: computeFilteredCaseStudies().map(toCompactItem),
      currentIndex,
      rotationCount,
    });
    renderActiveView();
  }

  function destroy() {
    resizeObserver?.disconnect();
    if (heightRaf) cancelAnimationFrame(heightRaf);
    destroyActiveView();
    filterDropdown.destroy();
    indicatorTop?.destroy();
    rootEl.parentNode?.removeChild(rootEl);
  }

  return { rootEl, destroy };
}
