import { getPageTransitionState, subscribePageTransition } from '../lib/pageTransitionState.js';

function rectStyle(phase, index) {
  const delay = phase === 'entering' ? 650 + 60 * index : phase === 'exiting' ? 60 * index : 0;
  const transform =
    phase === 'entering' || phase === 'holding'
      ? 'translateY(0%)'
      : phase === 'exiting'
      ? 'translateY(-110%)'
      : 'translateY(110%)';
  const isAnimating = phase === 'entering' || phase === 'exiting';
  return {
    width: '16px',
    height: '16px',
    backgroundColor: '#141314',
    transform,
    transitionProperty: 'transform',
    transitionDuration: isAnimating ? '350ms' : '0ms',
    transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    transitionDelay: isAnimating ? `${delay}ms` : '0ms',
    willChange: isAnimating ? 'transform' : '',
  };
}

export function initPageTransitionRectangles() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    return function destroyPageTransitionRectangles() {};
  }

  const outer = document.createElement('div');
  Object.assign(outer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    zIndex: '10001',
    pointerEvents: 'none',
  });

  const inner = document.createElement('div');
  Object.assign(inner.style, { display: 'flex', gap: '2px', overflow: 'hidden' });

  const rectangles = ['r0', 'r1', 'r2', 'r3'].map((key, index) => {
    const rect = document.createElement('div');
    rect.dataset.key = key;
    Object.assign(rect.style, rectStyle('idle', index));
    inner.appendChild(rect);
    return rect;
  });
  outer.appendChild(inner);
  document.body.appendChild(outer);

  function applyPhase(phase) {
    outer.style.visibility = phase !== 'idle' ? 'visible' : 'hidden';
    rectangles.forEach((rect, index) => {
      Object.assign(rect.style, rectStyle(phase, index));
    });
  }

  applyPhase(getPageTransitionState().phase);
  const unsubscribe = subscribePageTransition(({ phase }) => applyPhase(phase));

  return function destroyPageTransitionRectangles() {
    unsubscribe();
    outer.remove();
  };
}
