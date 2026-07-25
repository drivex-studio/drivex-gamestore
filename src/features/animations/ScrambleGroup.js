'use strict';

import { gsap, ScrollTrigger, ScrambleTextPlugin } from '../../vendor.js';


// -- Shared Constants -----------------------------------------
const DEFAULT_SCRAMBLE_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

const runIdleTask = typeof window !== 'undefined' && 'requestIdleCallback' in window
  ? (fn) => window.requestIdleCallback(fn)
  : (fn) => setTimeout(fn, 1);

// (converted from inline scramble-string helper used inside ScrambleText's runScramble)
function scrambleString(text, chars) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ' || ch === '\n' || ch === '\r') result += ch;
    else result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// -- DOM-Ancestor Context Helpers -----------------------------------------
// (converted from React Context: ScrambleGroupContext)
// React context resolves to the nearest ancestor Provider in the component tree. The vanilla
// equivalent is walking up the real DOM tree for the nearest element carrying a ScrambleGroup
// instance. This preserves the original per-subtree scoping -- multiple independent
// ScrambleGroup instances on one page won't interfere with each other -- which a single
// module-level singleton (as used for Preloader's app-wide context) would not.
const SCRAMBLE_GROUP_REF = Symbol('scrambleGroupInstance');

// (converted from React hook: useScrambleGroup)
function getScrambleGroupContext(el) {
  let node = el;
  while (node) {
    if (node[SCRAMBLE_GROUP_REF]) return node[SCRAMBLE_GROUP_REF];
    node = node.parentElement;
  }
  return null;
}

// ---- ScrambleGroup ----
export class ScrambleGroup {
  constructor(parentElement, props = {}) {
    const {
      children,
      stagger = 0.1,
      start = 'top 80%',
      markers = false,
      manual = false,
      className
    } = props;

    this.stagger = stagger;
    this.start = start;
    this.markers = markers;
    this.manual = manual;

    // 1. Instance-scoped state
    this.registry = new Map();        // id -> registered runScramble fn
    this.hasTriggered = false;        // (converted from React state: hasTriggered)
    this._triggerGuard = false;       // (converted from React ref: hasTriggeredRef)
    this._scrollTrigger = null;       // (converted from React ref: scrollTriggerRef)
    this._tween = null;
    this._scrollTriggerCleanup = null;
    this._idleHandle = null;

    // 2. DOM root setup
    this.el = document.createElement('div');
    if (className) this.el.className = className;
    this.el[SCRAMBLE_GROUP_REF] = this; // exposes this group to descendant ScrambleText lookups

    if (children) {
      const list = Array.isArray(children) ? children : [children];
      list.forEach((child) => { if (child instanceof Node) this.el.appendChild(child); });
    }

    if (parentElement) parentElement.appendChild(this.el);

    // 3. register / unregister -- the public context API
    this.register = (id, fn) => { this.registry.set(id, fn); };
    this.unregister = (id) => { this.registry.delete(id); };

    // 4. triggerAll -- staggers a delayedCall per registered ScrambleText instance
    this.triggerAll = (startDelayOverride) => {
      if (this._triggerGuard) return;
      this._triggerGuard = true;
      const fns = Array.from(this.registry.values());
      const delayStep = startDelayOverride ?? this.stagger;
      fns.forEach((fn, idx) => {
        gsap.delayedCall(idx * delayStep, () => { fn(); });
      });
      this.hasTriggered = true;
    };

    // 5. (converted from React hook: subscribeIdleGSAP) -- ScrollTrigger setup, deferred to idle time
    // to mirror the original hook's "idle" naming. The wrapper hook's own implementation
    // (Module ID 228744) wasn't part of this batch, so only the callback it invoked at the
    // call site is reconstructed here; the idle-defer wrapper itself is inferred from the name.
    this._idleHandle = runIdleTask(() => {
      this._scrollTriggerCleanup = this._setupScrollTrigger();
    });
  }

  _setupScrollTrigger() {
    if (this.manual || !this.el) return null;
    this._triggerGuard = false;
    this._tween = gsap.to(this.el, {
      scrollTrigger: {
        trigger: this.el,
        start: this.start,
        markers: this.markers,
        toggleActions: 'play none none none'
      },
      onStart: () => { this.triggerAll(); },
      duration: 0.001
    });
    this._scrollTrigger = this._tween.scrollTrigger ?? null;
    return () => {
      this._tween.kill();
      this._scrollTrigger?.kill();
    };
  }

  destroy() {
    if (this._idleHandle && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
      window.cancelIdleCallback(this._idleHandle);
    }
    this._scrollTriggerCleanup?.();
    this.registry.clear();
    if (this.el) {
      delete this.el[SCRAMBLE_GROUP_REF];
      this.el.remove();
    }
  }
}

// ---- ScrambleText ----
export class ScrambleText {
  constructor(parentElement, props = {}) {
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
      multiLine = false
    } = props;

    this.duration = duration;
    this.chars = chars;
    this.dualLayer = dualLayer;
    this.triggerOnHover = triggerOnHover;
    this.revealMode = revealMode;
    this.multiLine = multiLine;
    this.onComplete = onComplete;

    // 1. Instance-scoped state
    this._timeline = null;      // (converted from React ref: timelineRef)
    this._hasCompleted = false; // (converted from React ref: hasCompletedRef)
    this._id = `scramble-${Math.random().toString(36).slice(2, 9)}`;

    const themeColors = theme === 'brand'
      ? { firstColorClass: 'scramble-white', secondColorClass: 'scramble-foreground' }
      : { firstColorClass: 'scramble-brand', secondColorClass: 'scramble-foreground' };

    this.firstColorClass = firstColorClass ?? themeColors.firstColorClass;
    this.secondColorClass = secondColorClass ?? themeColors.secondColorClass;

    // resolvedChildren -- mirrors the original string/number/else('') narrowing
    let resolvedChildren;
    if (typeof children === 'string') resolvedChildren = children;
    else if (typeof children === 'number') resolvedChildren = String(children);
    else resolvedChildren = '';
    this.textValue = resolvedChildren; // (converted from React ref: textValueRef)

    const whiteSpaceMode = this.multiLine ? 'normal' : 'nowrap';
    const displayText = this.revealMode ? resolvedChildren.replace(/[^\s\n\r]/g, ' ') : resolvedChildren;

    // 2. DOM root setup
    this.el = document.createElement('span');
    if (className) this.el.className = className;
    Object.assign(this.el.style, {
      position: 'relative',
      display: this.multiLine ? 'inline' : 'inline-block',
      whiteSpace: whiteSpaceMode
    });

    // sr-only span (accessible text)
    const srOnly = document.createElement('span');
    srOnly.className = 'sr-only';
    srOnly.textContent = resolvedChildren;

    // invisible layout-reserving span
    const reserved = document.createElement('span');
    reserved.setAttribute('aria-hidden', 'true');
    Object.assign(reserved.style, { visibility: 'hidden', whiteSpace: whiteSpaceMode });
    reserved.textContent = resolvedChildren;

    // visible scrambling target
    this.textEl = document.createElement('span'); // (converted from React ref: textRef)
    this.textEl.setAttribute('aria-hidden', 'true');
    Object.assign(this.textEl.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      whiteSpace: whiteSpaceMode,
      ...(this.multiLine ? { width: '100%' } : {})
    });
    this.textEl.textContent = displayText;

    this.el.appendChild(srOnly);
    this.el.appendChild(reserved);
    this.el.appendChild(this.textEl);

    // 3. Behavioral event wiring
    this.handleMouseEnter = () => {
      if (this.triggerOnHover) this.runScramble();
    };
    if (this.triggerOnHover) {
      this.el.addEventListener('mouseenter', this.handleMouseEnter);
    }

    if (parentElement) parentElement.appendChild(this.el);

    // 4. Register with nearest ScrambleGroup, if any
    // (converted from React hook: useScrambleGroup + register effect)
    this.group = getScrambleGroupContext(parentElement);
    if (this.group) {
      this.group.register(this._id, this.runScramble);
    }

    // 5. onReady fires once with the trigger function (converted from React effect: onReady)
    onReady?.(this.runScramble);
  }

  killTimeline() {
    if (this._timeline) {
      this._timeline.kill();
      this._timeline = null;
    }
  }

  // Bound as a class field so the same reference can be passed to group.register / onReady / hover
  runScramble = () => {
    const target = this.textEl;
    if (!target) return null;

    const text = this.textValue || '';
    if (!text || text.length === 0) return null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.textContent = text;
      target.className = target.className.replace(/\bscramble-\w+\b/g, '');
      this._hasCompleted = true;
      this.onComplete?.();
      return null;
    }

    this.killTimeline();
    this._timeline = gsap.timeline({
      onComplete: () => {
        this._timeline = null;
        this._hasCompleted = true;
        this.onComplete?.();
      }
    });

    if (this.dualLayer) {
      const scrambledPlaceholder = scrambleString(text, this.chars);
      const nonWhitespaceLength = text.replace(/\s/g, '').length;
      const revealPosition = nonWhitespaceLength > 0 ? this.duration / nonWhitespaceLength : 0;

      if (this.revealMode && !this._hasCompleted) {
        target.textContent = text.replace(/[^\s\n\r]/g, ' ');
        this._timeline.to(target, {
          duration: this.duration,
          scrambleText: {
            text: scrambledPlaceholder,
            chars: this.chars,
            speed: 1,
            revealDelay: 0.1,
            oldClass: this.firstColorClass,
            newClass: this.firstColorClass
          },
          ease: 'none'
        });
      } else {
        this._timeline.to(target, {
          duration: this.duration,
          scrambleText: {
            text: scrambledPlaceholder,
            chars: this.chars,
            speed: 1,
            revealDelay: 0.1,
            oldClass: this.secondColorClass,
            newClass: this.firstColorClass
          },
          ease: 'none'
        });
      }

      this._timeline.to(target, {
        duration: this.duration,
        scrambleText: {
          text,
          chars: this.chars,
          speed: 1,
          revealDelay: 0.1,
          oldClass: this.firstColorClass,
          newClass: this.secondColorClass
        },
        ease: 'none'
      }, revealPosition);
    } else {
      this._timeline.to(target, {
        duration: this.duration,
        scrambleText: { text, chars: this.chars, speed: 1, revealDelay: 0.2 },
        ease: 'none'
      });
    }

    return this._timeline;
  };

  // 6. Teardown
  destroy() {
    if (this.triggerOnHover) {
      this.el.removeEventListener('mouseenter', this.handleMouseEnter);
    }
    if (this.group) {
      this.group.unregister(this._id);
    }
    this.killTimeline();
    gsap.killTweensOf(this.textEl);
    this.el.remove();
  }
}
