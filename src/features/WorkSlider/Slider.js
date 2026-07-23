
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { createMotionValue, animateMotionValue } from './motionValue.js';
import { cx } from '../../utils/cx.js';
import { createSliderSlideCard } from './SliderSlideCard.js';

gsap.registerPlugin(Draggable, InertiaPlugin);

const SLIDE_EASE = 'power4.inOut';

export function initSlider(parentEl, props = {}) {
  let { items = [], onIndexChange, className, scrambleKey } = props;

  let containerEl = null;
  let dragAnchorEl = null;
  let draggableInstanceRef = null;
  let dragStartXRef = 0;
  const scrambleTriggersRef = new Map();
  let hasTriggeredInitialScrambleRef = false;
  let isDraggingRef = { current: false };
  let hasDraggedRef = { current: false };
  let dragDistanceRef = 0;

  let dimensions = { containerWidth: 0, slideWidth: 0, wrapWidth: 0, centerOffset: 0 };

  const itemCount = items.length;
  
  const targetX = createMotionValue(0); 
  const displayX = createMotionValue(0); 
  let currentEmittedIndexRef = 0; 

  let extendedItems = []; 
  let cloneOffset = 0; 
  let totalWidth = 0; 

  let slideCardInstances = []; 
  let resizeObserver = null;
  let scrambleTimeoutId = null;
  let keydownHandler = null;
  let displayXUnsubscribe = null;
  let gsapContext = null;

  const rootEl = document.createElement('div');
  rootEl.className = cx('relative', className);

  dragAnchorEl = document.createElement('div');
  dragAnchorEl.className = 'pointer-events-none invisible absolute';
  dragAnchorEl.style.width = '1px';
  dragAnchorEl.style.height = '1px';
  rootEl.appendChild(dragAnchorEl);

  containerEl = document.createElement('div');
  containerEl.className = 'relative cursor-grab touch-pan-y overflow-x-clip active:cursor-grabbing';
  rootEl.appendChild(containerEl);

  parentEl.appendChild(rootEl);

  function wrapIndex(i) {
    return ((i % itemCount) + itemCount) % itemCount;
  }

  function goToPosition(x) {
    targetX.set(x);
    animateMotionValue(displayX, x, { duration: 0.8, ease: SLIDE_EASE });
    if (dragAnchorEl) gsap.set(dragAnchorEl, { x });
  }

  function goToPrev() {
    if (isDraggingRef.current || itemCount === 0 || dimensions.wrapWidth === 0) return;
    goToPosition(targetX.get() - dimensions.wrapWidth);
  }

  function goToNext() {
    if (isDraggingRef.current || itemCount === 0 || dimensions.wrapWidth === 0) return;
    goToPosition(targetX.get() + dimensions.wrapWidth);
  }

  function goToSlide(index) {
    if (isDraggingRef.current || itemCount === 0 || dimensions.wrapWidth === 0) return;
    const targetIndex = wrapIndex(index);
    const current = targetX.get();
    let steps = (targetIndex - wrapIndex(Math.round(-current / dimensions.wrapWidth)) + itemCount) % itemCount;
    if (steps === 0) steps = itemCount;
    goToPosition(current - steps * dimensions.wrapWidth);
  }

  function computeExtendedItems() {
    if (itemCount === 0) return { extendedItems: [], cloneOffset: 0 };
    return {
      extendedItems: [
        ...items.map((item, i) => ({ ...item, _id: `clone-before-${item._id}`, originalIndex: i, isClone: true })),
        ...items.map((item, i) => ({ ...item, originalIndex: i, isClone: false })),
        ...items.map((item, i) => ({ ...item, _id: `clone-after-${item._id}`, originalIndex: i, isClone: true })),
      ],
      cloneOffset: itemCount,
    };
  }

  function handleRegisterScramble(index, trigger) {
    scrambleTriggersRef.set(index, trigger);
  }

  function teardownSlideCards() {
    slideCardInstances.forEach((instance) => {
      instance.destroy();
      instance.rootEl.parentNode?.removeChild(instance.rootEl);
    });
    slideCardInstances = [];
  }

  function renderSlideCards() {
    teardownSlideCards();
    const hasReadyDimensions = itemCount > 0 && dimensions.containerWidth > 0;
    if (!hasReadyDimensions) return;

    const spacerOuter = document.createElement('div');
    spacerOuter.className = 'pointer-events-none invisible';
    spacerOuter.style.width = `${dimensions.slideWidth}px`;
    const spacerImage = document.createElement('div');
    spacerImage.className = 'relative w-full';
    spacerImage.style.paddingBottom = '66.67%';
    const spacerMeta = document.createElement('div');
    spacerMeta.className = 'mt-16 h-24';
    spacerOuter.append(spacerImage, spacerMeta);
    containerEl.appendChild(spacerOuter);

    extendedItems.forEach((item, index) => {
      const instance = createSliderSlideCard({
        item,
        index,
        springX: displayX,
        slideWidth: dimensions.slideWidth,
        wrapWidth: dimensions.wrapWidth,
        centerOffset: dimensions.centerOffset,
        totalWidth,
        containerWidth: dimensions.containerWidth,
        onRegisterScramble: handleRegisterScramble,
        isDraggingRef,
        hasDraggedRef,
      });
      slideCardInstances.push(instance);
      containerEl.appendChild(instance.rootEl);
    });
  }

  function recomputeAndRender() {
    const computed = computeExtendedItems();
    extendedItems = computed.extendedItems;
    cloneOffset = computed.cloneOffset;
    totalWidth = extendedItems.length * dimensions.wrapWidth;
    renderSlideCards();
  }

  let resizeRaf = null;
  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return;
    const width = entry.contentRect.width;
    if (width === 0) return;
    if (width === dimensions.containerWidth) return;
    // Defer to the next frame — recomputeAndRender() mutates the DOM inside
    // the observed container, and doing that synchronously in the callback
    // is what triggers "ResizeObserver loop completed with undelivered
    // notifications."
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      const slidesPerView = window.matchMedia('(max-width: 767px)').matches ? 1.1 : 2;
      const slideWidth = (width - 16 * (Math.ceil(slidesPerView) - 1)) / slidesPerView;
      dimensions = {
        containerWidth: width,
        slideWidth,
        wrapWidth: slideWidth + 16,
        centerOffset: (width - slideWidth) / 2,
      };
      recomputeAndRender();
      setupDraggable();
      resetToInitialPosition();
    });
  });
  resizeObserver.observe(containerEl);

  function resetToInitialPosition() {
    if (dimensions.wrapWidth === 0) return;
    const initial = -cloneOffset * dimensions.wrapWidth;
    targetX.set(initial);
    displayX.set(initial);
    if (dragAnchorEl) gsap.set(dragAnchorEl, { x: initial });
  }

  displayXUnsubscribe = displayX.on('change', (value) => {
    if (dimensions.wrapWidth === 0) return;
    const index = wrapIndex(Math.round(-value / dimensions.wrapWidth));
    if (index !== currentEmittedIndexRef) {
      currentEmittedIndexRef = index;
      onIndexChange?.(index);
    }
  });

  keydownHandler = (e) => {
    if (e.key === 'ArrowLeft') goToPrev();
    else if (e.key === 'ArrowRight') goToNext();
  };
  window.addEventListener('keydown', keydownHandler);

  gsapContext = gsap.context(() => {}, containerEl);
  function setupDraggable() {
    if (!dragAnchorEl || !containerEl || dimensions.wrapWidth === 0) return;
    const wrapWidth = dimensions.wrapWidth;

    if (draggableInstanceRef) {
      draggableInstanceRef.forEach((d) => d.kill());
      draggableInstanceRef = null;
    }

    const startX = targetX.get();
    gsap.set(dragAnchorEl, { x: startX });

    draggableInstanceRef = Draggable.create(dragAnchorEl, {
      type: 'x',
      trigger: containerEl,
      inertia: true,
      throwResistance: 1500,
      maxDuration: 1,
      minDuration: 0.2,
      overshootTolerance: 0,
      snap: { x: (x) => Math.round(x / wrapWidth) * wrapWidth },
      onPress() {
        hasDraggedRef.current = false;
        dragDistanceRef = 0;
      },
      onDragStart() {
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        dragStartXRef = this.x;
        dragDistanceRef = 0;
      },
      onDrag() {
        const distance = Math.abs(this.x - dragStartXRef);
        dragDistanceRef = distance;
        if (distance > 10) hasDraggedRef.current = true;
        targetX.set(this.x);
        displayX.set(this.x);
      },
      onThrowUpdate() {
        targetX.set(this.x);
        displayX.set(this.x);
      },
      onDragEnd() {
        if (this.tween === undefined) {
          setTimeout(() => {
            isDraggingRef.current = false;
            setTimeout(() => { hasDraggedRef.current = false; }, 100);
          }, 10);
        }
      },
      onThrowComplete() {
        targetX.set(this.x);
        displayX.set(this.x);
        isDraggingRef.current = false;
        setTimeout(() => { hasDraggedRef.current = false; }, 100);
      },
    });

    if (draggableInstanceRef[0]) draggableInstanceRef[0].update();
  }

  function scheduleScrambleStagger() {
    if (scrambleTimeoutId) clearTimeout(scrambleTimeoutId);
    if (scrambleKey === undefined) return;
    scrambleTimeoutId = setTimeout(() => {
      Array.from(scrambleTriggersRef.values()).forEach((trigger, i) => {
        setTimeout(() => trigger(), 80 * i);
      });
      hasTriggeredInitialScrambleRef = true;
    }, 100);
  }
  scheduleScrambleStagger();

  function update(nextProps = {}) {
    if ('items' in nextProps) items = nextProps.items ?? [];
    if ('className' in nextProps) rootEl.className = cx('relative', nextProps.className);
    if ('onIndexChange' in nextProps) onIndexChange = nextProps.onIndexChange;
    if ('scrambleKey' in nextProps && nextProps.scrambleKey !== scrambleKey) {
      scrambleKey = nextProps.scrambleKey;
      scrambleTriggersRef.clear();
      scheduleScrambleStagger();
    }
    recomputeAndRender();
  }

  function destroy() {
    resizeObserver?.disconnect();
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    window.removeEventListener('keydown', keydownHandler);
    displayXUnsubscribe?.();
    if (scrambleTimeoutId) clearTimeout(scrambleTimeoutId);
    draggableInstanceRef?.forEach((d) => d.kill());
    gsapContext?.revert();
    teardownSlideCards();
    rootEl.parentNode?.removeChild(rootEl);
  }

  return { rootEl, goToSlide, goToNext, goToPrev, update, destroy };
}
