import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroScrollPush({ children, className } = {}) {
  const containerEl = document.createElement('div');
  containerEl.className = className;
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child) containerEl.appendChild(child);
    });
  }

  let gsapContext = null;
  const timeoutId = setTimeout(() => {
    const sectionEl = containerEl.closest('section');
    if (!sectionEl) return;
    gsapContext = gsap.context(() => {
      gsap.to(containerEl, {
        yPercent: 35,
        ease: 'none',
        scrollTrigger: { trigger: sectionEl, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, containerEl);
  }, 0);

  function destroy() {
    clearTimeout(timeoutId);
    gsapContext?.revert();
  }

  return { element: containerEl, destroy };
}
