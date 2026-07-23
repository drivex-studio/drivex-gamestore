import gsap from 'gsap'; 
import { cx } from '../utils/cx.js'; 
import { initScrambleText } from '../utils/ScrambleText.js'; 
import { subscribePreloaderState, setPhase } from '../lib/preloaderState.js'; 

export function initPreloader(parentElement, props = {}) {

  let phase = "loading";
  let isInitialLoad = true;
  
  let timeline = null;
  let timeoutId = null;
  let animationStarted = false;
  let scrambleTriggerReady = null;

  const childInstances = [];

  const el = document.createElement('div');
  el.dataset.theme = "brand";

  const container = document.createElement('div');
  container.className = "flex flex-col items-center gap-4";

  const blocksContainer = document.createElement('div');
  blocksContainer.className = "relative overflow-x-clip overflow-y-visible";
  blocksContainer.style.width = "70px";
  blocksContainer.style.height = "16px";

  const blocks = [];
  for (let i = 0; i < 4; i++) {
    const block = document.createElement('div');
    block.className = "absolute top-0 left-0 bg-foreground";
    block.style.width = "16px";
    block.style.height = "16px";
    block.style.transform = "translateX(-16px)";
    block.style.transformOrigin = "bottom right";
    blocksContainer.appendChild(block);
    blocks.push(block);
  }

  const textContainer = document.createElement('div');
  textContainer.className = "overflow-hidden";

  const scrambleInst = initScrambleText(textContainer, {
    revealMode: true,
    duration: 1,
    onReady: (trigger) => {
      scrambleTriggerReady = trigger;
    },
    children: "LOADING"
  });
  if (scrambleInst) childInstances.push(scrambleInst);

  container.appendChild(blocksContainer);
  container.appendChild(textContainer);
  el.appendChild(container);

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let prefersReducedMotion = mediaQuery.matches;
  const handleMotionChange = (e) => {
    prefersReducedMotion = e.matches;
  };
  mediaQuery.addEventListener("change", handleMotionChange);

  function render() {
    if (!isInitialLoad || phase === "hidden") {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }

    el.className = cx(
      "fixed inset-0 z-[10000] flex items-center justify-center bg-background",
      phase === "complete" && "pointer-events-none"
    );
  }

  function checkAnimation() {
    if (!isInitialLoad || phase !== "loading" || animationStarted) return;

    if (prefersReducedMotion) {
      setPhase("complete"); 
      return;
    }

    if (blocks.length === 0) return;

    animationStarted = true;

    const run = () => {
      if (!scrambleTriggerReady) {
        requestAnimationFrame(run);
        return;
      }

      timeline = gsap.timeline();
      scrambleTriggerReady();

      blocks.forEach((block, t) => {
        timeline.fromTo(block, {
          x: t === 0 ? -16 : (t - 1) * 18,
          rotate: 0
        }, {
          x: 18 * t - 16,
          rotate: 90,
          duration: 0.7,
          ease: "expo.inOut",
          immediateRender: false
        }, t === 0 ? 0 : ">-25%");
      });

      const timelineOffset = 2.2749999999999995;
      
      timeline.to(container, {
        opacity: 0,
        duration: 0.4,
        ease: "power3.out"
      }, timelineOffset + 0.2);

      const dummy = { value: 0 };
      let revealingTriggered = false;

      timeline.to(dummy, {
        value: 1,
        duration: 1.5,
        ease: "expo.inOut",
        onUpdate: () => {
          let e = dummy.value;
          if (e <= 0) {
            el.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
          } else if (e >= 1) {
            el.style.clipPath = "polygon(0% 100%, 0% 100%, 0% 100%)";
          } else if (e <= 0.5) {
            el.style.clipPath = `polygon(0% 100%, ${2 * e * 100}% 0%, 100% 0%, 100% 100%)`;
          } else {
            el.style.clipPath = `polygon(0% 100%, 100% ${(e - 0.5) * 200}%, 100% 100%)`;
          }

          if (!revealingTriggered && dummy.value >= 0.9) {
            revealingTriggered = true;
            setPhase("revealing"); 
          }
        }
      }, timelineOffset);
    };

    timeoutId = setTimeout(run, 100);
  }

  const unsubscribe = subscribePreloaderState((state) => {
    phase = state.phase;
    isInitialLoad = state.isInitialLoad;
    
    render();
    checkAnimation();
  });

  function destroy() {
    if (unsubscribe) unsubscribe(); 
    mediaQuery.removeEventListener("change", handleMotionChange);
    clearTimeout(timeoutId);
    if (timeline) timeline.kill();
    childInstances.forEach(inst => inst?.destroy?.());
    gsap.killTweensOf(el);
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy };
}
