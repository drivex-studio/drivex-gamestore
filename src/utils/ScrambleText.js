import { gsap, ScrambleTextPlugin } from '../vendor.js';
import { useScrambleGroup } from '../hooks/useScrambleGroup.js';
import { DEFAULT_SCRAMBLE_CHARS } from './scrambleChars.js';

function buildScrambledPlaceholder(text, charSet = DEFAULT_SCRAMBLE_CHARS) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    result += ch === ' ' || ch === '\n' || ch === '\r' ? ch : charSet[Math.floor(Math.random() * charSet.length)];
  }
  return result;
}

export function initScrambleText(parentElement, props) {
  const {
    children,
    className,
    duration = 0.6,
    chars = DEFAULT_SCRAMBLE_CHARS,
    dualLayer = true,
    triggerOnHover = false,
    revealMode = false,
    theme = 'dark',
    firstColorClass,
    secondColorClass,
    onComplete,
    onReady,
    multiLine = false,
  } = props;

  const uniqueId = `scramble-${Math.random().toString(36).slice(2, 9)}`; 

  const themeColorClasses =
    theme === 'brand'
      ? { firstColorClass: 'scramble-white', secondColorClass: 'scramble-foreground' }
      : { firstColorClass: 'scramble-brand', secondColorClass: 'scramble-foreground' }; 
  const firstColor = firstColorClass ?? themeColorClasses.firstColorClass; 
  const secondColor = secondColorClass ?? themeColorClasses.secondColorClass; 

  const scrambleGroupContext = useScrambleGroup(); 

  const textContent = typeof children === 'string' ? children : typeof children === 'number' ? String(children) : ''; 

  let lastRenderedText = textContent; 
  let timelineRef = null; 
  let hasCompletedFlag = false; 

  function killTimeline() {
    if (timelineRef) {
      timelineRef.kill();
      timelineRef = null;
    }
  }

  let rootEl; 
  let scrambleTargetEl; 

  function triggerScramble() {
    
    if (!scrambleTargetEl) return null;
    const el = scrambleTargetEl;
    const text = lastRenderedText || textContent;
    if (!text || text.length === 0) return null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text;
      el.className = el.className.replace(/\bscramble-\w+\b/g, '');
      hasCompletedFlag = true;
      onComplete?.();
      return null;
    }

    killTimeline();
    timelineRef = gsap.timeline({
      onComplete: () => {
        timelineRef = null;
        hasCompletedFlag = true;
        onComplete?.();
      },
    });

    if (dualLayer) {
      const scrambledPlaceholder = buildScrambledPlaceholder(text, chars);
      const nonWhitespaceCount = text.replace(/\s/g, '').length;
      const perCharOffset = nonWhitespaceCount > 0 ? duration / nonWhitespaceCount : 0;

      if (revealMode && !hasCompletedFlag) {
        el.textContent = text.replace(/[^\s\n\r]/g, ' ');
        timelineRef.to(el, {
          duration,
          scrambleText: { text: scrambledPlaceholder, chars, speed: 1, revealDelay: 0.1, oldClass: firstColor, newClass: firstColor },
          ease: 'none',
        });
      } else {
        timelineRef.to(el, {
          duration,
          scrambleText: { text: scrambledPlaceholder, chars, speed: 1, revealDelay: 0.1, oldClass: secondColor, newClass: firstColor },
          ease: 'none',
        });
      }
      timelineRef.to(
        el,
        {
          duration,
          scrambleText: { text, chars, speed: 1, revealDelay: 0.1, oldClass: firstColor, newClass: secondColor },
          ease: 'none',
        },
        perCharOffset
      );
    } else {
      timelineRef.to(el, {
        duration,
        scrambleText: { text, chars, speed: 1, revealDelay: 0.2 },
        ease: 'none',
      });
    }
    return timelineRef;
  }

  function handleMouseEnter() {
    
    if (triggerOnHover) triggerScramble();
  }

  const whiteSpaceValue = multiLine ? 'normal' : 'nowrap';  
const displayValue = multiLine ? 'inline-block' : 'inline-block';

  rootEl = document.createElement('span'); 
  rootEl.className = className || '';
  rootEl.style.position = 'relative';
  rootEl.style.display = displayValue;
  rootEl.style.whiteSpace = whiteSpaceValue;
  if (triggerOnHover) rootEl.addEventListener('mouseenter', handleMouseEnter);

  const srOnlySpan = document.createElement('span'); 
  srOnlySpan.className = 'sr-only';
  srOnlySpan.textContent = textContent;

  const sizerSpan = document.createElement('span'); 
  sizerSpan.setAttribute('aria-hidden', 'true');
  sizerSpan.style.visibility = 'hidden';
  sizerSpan.style.whiteSpace = whiteSpaceValue;
  sizerSpan.textContent = textContent;

  const initialSpanText = revealMode ? textContent.replace(/[^\s\n\r]/g, ' ') : textContent; 
  scrambleTargetEl = document.createElement('span'); 
  scrambleTargetEl.setAttribute('aria-hidden', 'true');
  scrambleTargetEl.style.position = 'absolute';
  scrambleTargetEl.style.top = '0';
  scrambleTargetEl.style.left = '0';
  scrambleTargetEl.style.whiteSpace = whiteSpaceValue;
  if (multiLine) scrambleTargetEl.style.width = '100%';
  scrambleTargetEl.textContent = initialSpanText;

  rootEl.appendChild(srOnlySpan);
  rootEl.appendChild(sizerSpan);
  rootEl.appendChild(scrambleTargetEl);
  parentElement.appendChild(rootEl);

  let unregisterFromGroup = null;
  if (scrambleGroupContext) {
    scrambleGroupContext.register(uniqueId, triggerScramble);
    unregisterFromGroup = () => scrambleGroupContext.unregister(uniqueId);
  }

  onReady?.(triggerScramble);

  return {
    scramble: triggerScramble,
    update(nextChildren) {
      lastRenderedText = typeof nextChildren === 'string' ? nextChildren : String(nextChildren ?? '');
    },
    destroy() {
      killTimeline();
      unregisterFromGroup?.();
      if (triggerOnHover) rootEl.removeEventListener('mouseenter', handleMouseEnter);
      rootEl.remove();
    },
  };
}
