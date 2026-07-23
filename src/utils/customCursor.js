
import { gsap } from '../vendor.js';
import { 
  getPageTransitionState, 
  subscribePageTransition 
} from '../lib/pageTransitionState.js';
import { cx } from './cx.js';


function buildStripesHTML(count) {
  return count <= 0
    ? ''
    : Array.from({ length: count }, () => '<div class="h-full w-[6px] bg-brand"></div>').join('');
}

export function initCustomCursor(children, options = {}) {
  const {
    speed = 0.7,
    ease = 'expo.out',
    maxRotation = 35,
    rotationDecay = 0.92,
    velocityMultiplier = 0.5,
  } = options;

  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none)').matches;

  const containerEl = document.createElement('div');
  containerEl.setAttribute('data-custom-cursor', '');
  if (children) containerEl.appendChild(children);

  let cursorEl = null;
  let rotationWrapperEl = null;
  let textEl = null;
  let leftStripesEl = null;
  let rightStripesEl = null;

  if (!isTouchDevice) {
    cursorEl = document.createElement('div');
    cursorEl.className = cx(
      'pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform',
      'opacity-0 transition-opacity duration-300 ease-out-expo'
    );
    rotationWrapperEl = document.createElement('div');
    rotationWrapperEl.className =
      'pointer-events-none absolute top-[-32px] left-0 flex origin-bottom -translate-x-1/2 -translate-y-full items-stretch gap-[2px]';
    leftStripesEl = document.createElement('div');
    leftStripesEl.className = 'flex items-stretch gap-[2px]';
    textEl = document.createElement('div');
    textEl.className = 'whitespace-nowrap bg-brand px-8 py-4 text-center text-accent-sm text-black';
    rightStripesEl = document.createElement('div');
    rightStripesEl.className = 'flex items-stretch gap-[2px]';

    rotationWrapperEl.append(leftStripesEl, textEl, rightStripesEl);
    cursorEl.appendChild(rotationWrapperEl);
    document.body.appendChild(cursorEl);
  }

  const mousePos = { x: 0, y: 0 };
  const lastMousePos = { x: 0, y: 0 };
  const velocity = { x: 0, y: 0 };
  let rotation = 0;
  let targetRotation = 0;
  let rafId = null;
  let lastTime = 0;
  let isVisible = false;
  let isHoveringTarget = false;
  let leaveTimeoutId = null;

  function moveCursor(x, y, immediate = false) {
    if (cursorEl) {
      gsap.to(cursorEl, { x, y, force3D: true, overwrite: true, ease, duration: immediate ? 0 : speed });
    }
  }

  function showCursorFlag() {
    if (!isVisible) {
      isVisible = true;
      cursorEl?.classList.add('opacity-100');
    }
  }

  function hideCursorFlag() {
    if (isVisible) {
      isVisible = false;
      cursorEl?.classList.remove('opacity-100');
    }
  }

  const contextSafeContext = gsap.context(() => {}, containerEl);

  const showCursorText = contextSafeContext.add((text, bg, color, leftCount = 0, rightCount = 0) => {
    if (!textEl) return;
    gsap.killTweensOf(textEl);
    if (leftStripesEl) gsap.killTweensOf(leftStripesEl);
    if (rightStripesEl) gsap.killTweensOf(rightStripesEl);
    textEl.innerHTML = text;
    isHoveringTarget = true;
    textEl.style.backgroundColor = bg || '';
    textEl.style.color = color || '';
    if (leftStripesEl) {
      leftStripesEl.innerHTML = buildStripesHTML(leftCount);
      gsap.fromTo(leftStripesEl, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(1.7)', force3D: true });
    }
    if (rightStripesEl) {
      rightStripesEl.innerHTML = buildStripesHTML(rightCount);
      gsap.fromTo(rightStripesEl, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(1.7)', force3D: true });
    }
    gsap.fromTo(textEl, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(1.7)', force3D: true });
  });

  const hideCursorText = contextSafeContext.add(() => {
    if (!textEl) return;
    gsap.killTweensOf(textEl);
    if (leftStripesEl) gsap.killTweensOf(leftStripesEl);
    if (rightStripesEl) gsap.killTweensOf(rightStripesEl);
    isHoveringTarget = false;
    if (leftStripesEl) {
      gsap.to(leftStripesEl, {
        scale: 0, duration: 0.25, ease: 'power2.inOut', force3D: true,
        onComplete: () => { if (leftStripesEl) leftStripesEl.innerHTML = ''; },
      });
    }
    if (rightStripesEl) {
      gsap.to(rightStripesEl, {
        scale: 0, duration: 0.25, ease: 'power2.inOut', force3D: true,
        onComplete: () => { if (rightStripesEl) rightStripesEl.innerHTML = ''; },
      });
    }
    gsap.to(textEl, {
      scale: 0, duration: 0.25, ease: 'power2.inOut', force3D: true,
      onComplete: () => {
        if (!isHoveringTarget && textEl) {
          textEl.innerHTML = '';
          textEl.style.backgroundColor = '';
          textEl.style.color = '';
        }
      },
    });
  });

  function handlePhaseEnterOrHold(phase) {
    if (phase === 'entering' || phase === 'holding') hideCursorText();
  }

  let mainContext = null;
  let mainCleanup = null;

  function runMainEffect(phase) {
    mainCleanup?.();
    mainCleanup = null;
    mainContext?.revert();
    mainContext = null;

    if (
      isTouchDevice ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !cursorEl || !textEl || !containerEl ||
      phase !== 'idle'
    ) {
      return;
    }

    mainContext = gsap.context(() => {
      gsap.set(textEl, { scale: 0, force3D: true });
      moveCursor(-window.innerWidth, -window.innerHeight, true);

      const cursorTextEls = containerEl.querySelectorAll('[data-cursor-text]');
      const cursorTextCleanups = [];
      cursorTextEls.forEach((el) => {
        const text = el.getAttribute('data-cursor-text');
        if (!text) return;
        const handleEnter = () => {
          showCursorText(
            text,
            el.getAttribute('data-cursor-bg'),
            el.getAttribute('data-cursor-color'),
            Number.parseInt(el.getAttribute('data-cursor-stripes-left') ?? '0', 10) || 0,
            Number.parseInt(el.getAttribute('data-cursor-stripes-right') ?? '0', 10) || 0
          );
        };
        const handleLeave = () => { hideCursorText(); };
        el.addEventListener('mouseenter', handleEnter);
        el.addEventListener('mouseleave', handleLeave);
        cursorTextCleanups.push({ element: el, handleEnter, handleLeave });
      });

      const handleMouseMove = (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
        moveCursor(mousePos.x, mousePos.y);
        showCursorFlag();
      };
      const handleDocMouseEnter = () => {
        if (leaveTimeoutId) clearTimeout(leaveTimeoutId);
        showCursorFlag();
      };
      const handleDocMouseLeave = () => {
        leaveTimeoutId = setTimeout(() => { hideCursorFlag(); }, 300);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseenter', handleDocMouseEnter);
      document.addEventListener('mouseleave', handleDocMouseLeave);

      const rafLoop = (time) => {
        if (!lastTime) lastTime = time;
        const dt = time - lastTime;
        lastTime = time;
        const deltaX = mousePos.x - lastMousePos.x;
        if (dt > 0) velocity.x = 0.7 * velocity.x + 0.3 * deltaX;
        lastMousePos.x = mousePos.x;
        lastMousePos.y = mousePos.y;
        targetRotation = Math.max(-maxRotation, Math.min(maxRotation, velocity.x * velocityMultiplier));
        if (isHoveringTarget) rotation += (targetRotation - rotation) * 0.2;
        else rotation *= rotationDecay;
        if (rotationWrapperEl) gsap.set(rotationWrapperEl, { rotation, force3D: true });
        rafId = requestAnimationFrame(rafLoop);
      };
      rafId = requestAnimationFrame(rafLoop);

      mainCleanup = () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (leaveTimeoutId) clearTimeout(leaveTimeoutId);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseenter', handleDocMouseEnter);
        document.removeEventListener('mouseleave', handleDocMouseLeave);
        cursorTextCleanups.forEach(({ element, handleEnter, handleLeave }) => {
          element.removeEventListener('mouseenter', handleEnter);
          element.removeEventListener('mouseleave', handleLeave);
        });
        if (cursorEl) gsap.killTweensOf(cursorEl);
        if (rotationWrapperEl) gsap.killTweensOf(rotationWrapperEl);
        if (textEl) gsap.killTweensOf(textEl);
      };
    }, containerEl);
  }

  const { phase: initialPhase } = getPageTransitionState();
  runMainEffect(initialPhase);

  const unsubscribe = subscribePageTransition(({ phase }) => {
    handlePhaseEnterOrHold(phase);
    runMainEffect(phase);
  });

  return {
    element: containerEl,
    destroy: function destroyCustomCursor() {
      unsubscribe();
      mainCleanup?.();
      mainContext?.revert();
      contextSafeContext.revert();
      cursorEl?.remove();
    },
  };
}
