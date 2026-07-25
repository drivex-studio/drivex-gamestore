function clamp(min, value, max) {
  return Math.max(min, Math.min(max, value));
}

const LINE_HEIGHT = 100 / 6;
const PASSIVE = { passive: false };



function defaultEasing(t) {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
}


class Animate {
  isRunning = false;
  value = 0;
  from = 0;
  to = 0;
  currentTime = 0;
  lerp;
  duration;
  easing;
  onUpdate;

  advance(deltaTime) {
    if (!this.isRunning) return;
    let completed = false;

    if (this.duration && this.easing) {
      this.currentTime += deltaTime;
      const linearProgress = clamp(0, this.currentTime / this.duration, 1);
      completed = linearProgress >= 1;
      const easedProgress = completed ? 1 : this.easing(linearProgress);
      this.value = this.from + (this.to - this.from) * easedProgress;
    } else if (this.lerp) {
      const factor = 1 - Math.exp(-60 * this.lerp * deltaTime);
      this.value = (1 - factor) * this.value + factor * this.to;
      if (Math.round(this.value) === this.to) {
        this.value = this.to;
        completed = true;
      }
    } else {
      this.value = this.to;
      completed = true;
    }

    if (completed) this.stop();
    this.onUpdate?.(this.value, completed);
  }

  stop() {
    this.isRunning = false;
  }

  fromTo(from, to, { lerp, duration, easing, onStart, onUpdate }) {
    this.from = this.value = from;
    this.to = to;
    this.lerp = lerp;
    this.duration = duration;
    this.easing = easing;
    this.currentTime = 0;
    this.isRunning = true;
    onStart?.();
    this.onUpdate = onUpdate;
  }
}


class Dimensions {
  width = 0;
  height = 0;
  scrollHeight = 0;
  scrollWidth = 0;
  debouncedResize;
  wrapperResizeObserver;
  contentResizeObserver;

  constructor(wrapper, content, { autoResize = true, debounce = 250 } = {}) {
    this.wrapper = wrapper;
    this.content = content;

    if (autoResize) {
      this.debouncedResize = debounceFn(this.resize, debounce);

      if (this.wrapper instanceof Window) {
        window.addEventListener('resize', this.debouncedResize, false);
      } else {
        this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
        this.wrapperResizeObserver.observe(this.wrapper);
      }

      this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
      this.contentResizeObserver.observe(this.content);
    }

    this.resize();
  }

  destroy() {
    this.wrapperResizeObserver?.disconnect();
    this.contentResizeObserver?.disconnect();
    if (this.wrapper === window && this.debouncedResize) {
      window.removeEventListener('resize', this.debouncedResize, false);
    }
  }

  resize = () => {
    this.onWrapperResize();
    this.onContentResize();
  };

  onWrapperResize = () => {
    if (this.wrapper instanceof Window) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else {
      this.width = this.wrapper.clientWidth;
      this.height = this.wrapper.clientHeight;
    }
  };

  onContentResize = () => {
    if (this.wrapper instanceof Window) {
      this.scrollHeight = this.content.scrollHeight;
      this.scrollWidth = this.content.scrollWidth;
    } else {
      this.scrollHeight = this.wrapper.scrollHeight;
      this.scrollWidth = this.wrapper.scrollWidth;
    }
  };

  get limit() {
    return { x: this.scrollWidth - this.width, y: this.scrollHeight - this.height };
  }
}

function debounceFn(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn.apply(this, args);
    }, delay);
  };
}


class Emitter {
  events = {};

  emit(event, ...args) {
    const handlers = this.events[event] || [];
    for (let i = 0, len = handlers.length; i < len; i++) handlers[i]?.(...args);
  }

  on(event, handler) {
    (this.events[event] ??= []).push(handler);
    return () => {
      this.events[event] = this.events[event]?.filter((h) => h !== handler);
    };
  }

  off(event, handler) {
    this.events[event] = this.events[event]?.filter((h) => h !== handler);
  }

  destroy() {
    this.events = {};
  }
}


class VirtualScroll {
  touchStart = { x: 0, y: 0 };
  lastDelta = { x: 0, y: 0 };
  window = { width: 0, height: 0 };
  emitter = new Emitter();

  constructor(element, options = { wheelMultiplier: 1, touchMultiplier: 1 }) {
    this.element = element;
    this.options = options;
    window.addEventListener('resize', this.onWindowResize, false);
    this.onWindowResize();
    this.element.addEventListener('wheel', this.onWheel, PASSIVE);
    this.element.addEventListener('touchstart', this.onTouchStart, PASSIVE);
    this.element.addEventListener('touchmove', this.onTouchMove, PASSIVE);
    this.element.addEventListener('touchend', this.onTouchEnd, PASSIVE);
  }

  on(event, handler) {
    return this.emitter.on(event, handler);
  }

  destroy() {
    this.emitter.destroy();
    window.removeEventListener('resize', this.onWindowResize, false);
    this.element.removeEventListener('wheel', this.onWheel, PASSIVE);
    this.element.removeEventListener('touchstart', this.onTouchStart, PASSIVE);
    this.element.removeEventListener('touchmove', this.onTouchMove, PASSIVE);
    this.element.removeEventListener('touchend', this.onTouchEnd, PASSIVE);
  }

  onTouchStart = (e) => {
    const { clientX, clientY } = e.targetTouches ? e.targetTouches[0] : e;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = { x: 0, y: 0 };
    this.emitter.emit('scroll', { deltaX: 0, deltaY: 0, event: e });
  };

  onTouchMove = (e) => {
    const { clientX, clientY } = e.targetTouches ? e.targetTouches[0] : e;
    const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
    const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
    this.touchStart.x = clientX;
    this.touchStart.y = clientY;
    this.lastDelta = { x: deltaX, y: deltaY };
    this.emitter.emit('scroll', { deltaX, deltaY, event: e });
  };

  onTouchEnd = (e) => {
    this.emitter.emit('scroll', { deltaX: this.lastDelta.x, deltaY: this.lastDelta.y, event: e });
  };

  onWheel = (e) => {
    let { deltaX, deltaY, deltaMode } = e;
    const modeX = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.width : 1;
    const modeY = deltaMode === 1 ? LINE_HEIGHT : deltaMode === 2 ? this.window.height : 1;
    deltaX *= modeX * this.options.wheelMultiplier;
    deltaY *= modeY * this.options.wheelMultiplier;
    this.emitter.emit('scroll', { deltaX, deltaY, event: e });
  };

  onWindowResize = () => {
    this.window = { width: window.innerWidth, height: window.innerHeight };
  };
}


class Lenis {
  _isScrolling = false;
  _isStopped = false;
  _isLocked = false;
  _preventNextNativeScrollEvent = false;
  _resetVelocityTimeout = null;
  __rafID = null;
  isTouching;
  time = 0;
  userData = {};
  lastVelocity = 0;
  velocity = 0;
  direction = 0;
  animate = new Animate();
  emitter = new Emitter();

  constructor({
    wrapper = window,
    content = document.documentElement,
    eventsTarget = wrapper,
    smoothWheel = true,
    syncTouch = false,
    syncTouchLerp = 0.075,
    touchInertiaExponent = 1.7,
    duration,
    easing,
    lerp = 0.1,
    infinite = false,
    orientation = 'vertical',
    gestureOrientation = orientation === 'horizontal' ? 'both' : 'vertical',
    touchMultiplier = 1,
    wheelMultiplier = 1,
    autoResize = true,
    prevent,
    virtualScroll,
    overscroll = true,
    autoRaf = false,
    anchors = false,
    autoToggle = false,
    allowNestedScroll = false,
    __experimental__naiveDimensions = false,
  } = {}) {
    window.lenisVersion = '1.3.16';
    if (!wrapper || wrapper === document.documentElement) wrapper = window;

    if (typeof duration === 'number' && typeof easing !== 'function') easing = defaultEasing;
    else if (typeof easing === 'function' && typeof duration !== 'number') duration = 1;

    this.options = {
      wrapper, content, eventsTarget, smoothWheel, syncTouch, syncTouchLerp,
      touchInertiaExponent, duration, easing, lerp, infinite, gestureOrientation,
      orientation, touchMultiplier, wheelMultiplier, autoResize, prevent,
      virtualScroll, overscroll, autoRaf, anchors, autoToggle, allowNestedScroll,
      __experimental__naiveDimensions,
    };

    this.dimensions = new Dimensions(wrapper, content, { autoResize });
    this.updateClassName();
    this.targetScroll = this.animatedScroll = this.actualScroll;

    this.options.wrapper.addEventListener('scroll', this.onNativeScroll, false);
    this.options.wrapper.addEventListener('scrollend', this.onScrollEnd, { capture: true });
    if (this.options.anchors && this.options.wrapper === window) {
      this.options.wrapper.addEventListener('click', this.onClick, false);
    }
    this.options.wrapper.addEventListener('pointerdown', this.onPointerDown, false);

    this.virtualScroll = new VirtualScroll(eventsTarget, { touchMultiplier, wheelMultiplier });
    this.virtualScroll.on('scroll', this.onVirtualScroll);

    if (this.options.autoToggle) {
      this.checkOverflow();
      this.rootElement.addEventListener('transitionend', this.onTransitionEnd, { passive: true });
    }

    if (this.options.autoRaf) this.__rafID = requestAnimationFrame(this.raf);
  }

  destroy() {
    this.emitter.destroy();
    this.options.wrapper.removeEventListener('scroll', this.onNativeScroll, false);
    this.options.wrapper.removeEventListener('scrollend', this.onScrollEnd, { capture: true });
    this.options.wrapper.removeEventListener('pointerdown', this.onPointerDown, false);
    if (this.options.anchors && this.options.wrapper === window) {
      this.options.wrapper.removeEventListener('click', this.onClick, false);
    }
    this.virtualScroll.destroy();
    this.dimensions.destroy();
    this.cleanUpClassName();
    if (this.__rafID) cancelAnimationFrame(this.__rafID);
  }

  on(event, handler) { return this.emitter.on(event, handler); }
  off(event, handler) { return this.emitter.off(event, handler); }

  onScrollEnd = (e) => {
    if (e instanceof CustomEvent) return;
    if (this.isScrolling === 'smooth' || this.isScrolling === false) e.stopPropagation();
  };

  dispatchScrollendEvent = () => {
    this.options.wrapper.dispatchEvent(
      new CustomEvent('scrollend', { bubbles: this.options.wrapper === window, detail: { lenisScrollEnd: true } })
    );
  };

  get overflow() {
    const prop = this.isHorizontal ? 'overflow-x' : 'overflow-y';
    return getComputedStyle(this.rootElement)[prop];
  }

  checkOverflow() {
    ['hidden', 'clip'].includes(this.overflow) ? this.internalStop() : this.internalStart();
  }

  onTransitionEnd = (e) => {
    if (e.propertyName.includes('overflow')) this.checkOverflow();
  };

  setScroll(value) {
    this.isHorizontal
      ? this.options.wrapper.scrollTo({ left: value, behavior: 'instant' })
      : this.options.wrapper.scrollTo({ top: value, behavior: 'instant' });
  }

  onClick = (e) => {
    const anchor = e.composedPath().find((el) => el instanceof HTMLAnchorElement && el.getAttribute('href')?.includes('#'));
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;
    const opts = typeof this.options.anchors === 'object' && this.options.anchors ? this.options.anchors : undefined;
    this.scrollTo(`#${href.split('#')[1]}`, opts);
  };

  onPointerDown = (e) => {
    if (e.button === 1) this.reset();
  };

  onVirtualScroll = (payload) => {
    if (typeof this.options.virtualScroll === 'function' && this.options.virtualScroll(payload) === false) return;
    const { deltaX, deltaY, event } = payload;
    this.emitter.emit('virtual-scroll', { deltaX, deltaY, event });
    if (event.ctrlKey || event.lenisStopPropagation) return;

    const isTouch = event.type.includes('touch');
    const isWheel = event.type.includes('wheel');
    this.isTouching = event.type === 'touchstart' || event.type === 'touchmove';
    const isZeroDelta = deltaX === 0 && deltaY === 0;

    if (this.options.syncTouch && isTouch && event.type === 'touchstart' && isZeroDelta && !this.isStopped && !this.isLocked) {
      return this.reset();
    }

    const wrongOrientation =
      (this.options.gestureOrientation === 'vertical' && deltaY === 0) ||
      (this.options.gestureOrientation === 'horizontal' && deltaX === 0);
    if (isZeroDelta || wrongOrientation) return;

    let path = event.composedPath();
    path = path.slice(0, path.indexOf(this.rootElement));
    const prevent = this.options.prevent;
    if (
      path.find(
        (el) =>
          el instanceof HTMLElement &&
          ((typeof prevent === 'function' && prevent?.(el)) ||
            el.hasAttribute?.('data-lenis-prevent') ||
            (isTouch && el.hasAttribute?.('data-lenis-prevent-touch')) ||
            (isWheel && el.hasAttribute?.('data-lenis-prevent-wheel')) ||
            (this.options.allowNestedScroll && this.checkNestedScroll(el, { deltaX, deltaY })))
      )
    ) return;

    if (this.isStopped || this.isLocked) {
      if (event.cancelable) event.preventDefault();
      return;
    }

    if (!((this.options.syncTouch && isTouch) || (this.options.smoothWheel && isWheel))) {
      this.isScrolling = 'native';
      this.animate.stop();
      event.lenisStopPropagation = true;
      return;
    }

    let delta = deltaY;
    if (this.options.gestureOrientation === 'both') delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    else if (this.options.gestureOrientation === 'horizontal') delta = deltaX;

    if (
      !this.options.overscroll ||
      this.options.infinite ||
      (this.options.wrapper !== window &&
        this.limit > 0 &&
        ((this.animatedScroll > 0 && this.animatedScroll < this.limit) ||
          (this.animatedScroll === 0 && deltaY > 0) ||
          (this.animatedScroll === this.limit && deltaY < 0)))
    ) {
      event.lenisStopPropagation = true;
    }
    if (event.cancelable) event.preventDefault();

    const syncingTouch = isTouch && this.options.syncTouch;
    const isTouchEnd = isTouch && event.type === 'touchend';
    if (isTouchEnd) delta = Math.sign(this.velocity) * Math.pow(Math.abs(this.velocity), this.options.touchInertiaExponent);

    this.scrollTo(this.targetScroll + delta, {
      programmatic: false,
      ...(syncingTouch
        ? { lerp: isTouchEnd ? this.options.syncTouchLerp : 1 }
        : { lerp: this.options.lerp, duration: this.options.duration, easing: this.options.easing }),
    });
  };

  resize() {
    this.dimensions.resize();
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.emit();
  }

  emit() { this.emitter.emit('scroll', this); }

  onNativeScroll = () => {
    if (this._resetVelocityTimeout !== null) {
      clearTimeout(this._resetVelocityTimeout);
      this._resetVelocityTimeout = null;
    }
    if (this._preventNextNativeScrollEvent) {
      this._preventNextNativeScrollEvent = false;
      return;
    }
    if (this.isScrolling === false || this.isScrolling === 'native') {
      const prev = this.animatedScroll;
      this.animatedScroll = this.targetScroll = this.actualScroll;
      this.lastVelocity = this.velocity;
      this.velocity = this.animatedScroll - prev;
      this.direction = Math.sign(this.animatedScroll - prev);
      if (!this.isStopped) this.isScrolling = 'native';
      this.emit();
      if (this.velocity !== 0) {
        this._resetVelocityTimeout = setTimeout(() => {
          this.lastVelocity = this.velocity;
          this.velocity = 0;
          this.isScrolling = false;
          this.emit();
        }, 400);
      }
    }
  };

  reset() {
    this.isLocked = false;
    this.isScrolling = false;
    this.animatedScroll = this.targetScroll = this.actualScroll;
    this.lastVelocity = this.velocity = 0;
    this.animate.stop();
  }

  start() {
    if (!this.isStopped) return;
    if (this.options.autoToggle) return this.rootElement.style.removeProperty('overflow');
    this.internalStart();
  }

  internalStart() {
    if (!this.isStopped) return;
    this.reset();
    this.isStopped = false;
    this.emit();
  }

  stop() {
    if (this.isStopped) return;
    if (this.options.autoToggle) return void this.rootElement.style.setProperty('overflow', 'clip');
    this.internalStop();
  }

  internalStop() {
    if (this.isStopped) return;
    this.reset();
    this.isStopped = true;
    this.emit();
  }


  raf = (time) => {
    const deltaTime = time - (this.time || time);
    this.time = time;
    this.animate.advance(0.001 * deltaTime);
    if (this.options.autoRaf) this.__rafID = requestAnimationFrame(this.raf);
  };

  scrollTo(target, {
    offset = 0,
    immediate = false,
    lock = false,
    duration = this.options.duration,
    easing = this.options.easing,
    lerp = this.options.lerp,
    onStart,
    onComplete,
    force = false,
    programmatic = true,
    userData,
  } = {}) {
    if (this.isStopped && !force) return;
    if (this.isLocked && !force) return;

    if (typeof target === 'string' && ['top', 'left', 'start', '#'].includes(target)) target = 0;
    else if (typeof target === 'string' && ['bottom', 'right', 'end'].includes(target)) target = this.limit;
    else {
      let el;
      if (typeof target === 'string') {
        el = document.querySelector(target);
        if (!el) {
          if (target === '#top') target = 0;
          else console.warn('Lenis: Target not found', target);
        }
      } else if (target instanceof HTMLElement && target?.nodeType) {
        el = target;
      }
      if (el) {
        if (this.options.wrapper !== window) {
          const rootRect = this.rootElement.getBoundingClientRect();
          offset -= this.isHorizontal ? rootRect.left : rootRect.top;
        }
        const rect = el.getBoundingClientRect();
        target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll;
      }
    }

    if (typeof target !== 'number') return;

    target += offset;
    target = Math.round(target);

    if (this.options.infinite) {
      if (programmatic) {
        this.targetScroll = this.animatedScroll = this.scroll;
        const diff = target - this.animatedScroll;
        if (diff > this.limit / 2) target -= this.limit;
        else if (diff < -this.limit / 2) target += this.limit;
      }
    } else {
      target = clamp(0, target, this.limit);
    }

    if (target === this.targetScroll) {
      onStart?.(this);
      onComplete?.(this);
      return;
    }

    this.userData = userData ?? {};

    if (immediate) {
      this.animatedScroll = this.targetScroll = target;
      this.setScroll(this.scroll);
      this.reset();
      this.preventNextNativeScrollEvent();
      this.emit();
      onComplete?.(this);
      this.userData = {};
      requestAnimationFrame(() => this.dispatchScrollendEvent());
      return;
    }

    if (!programmatic) this.targetScroll = target;

    if (typeof duration === 'number' && typeof easing !== 'function') easing = defaultEasing;
    else if (typeof easing === 'function' && typeof duration !== 'number') duration = 1;

    this.animate.fromTo(this.animatedScroll, target, {
      duration, easing, lerp,
      onStart: () => {
        if (lock) this.isLocked = true;
        this.isScrolling = 'smooth';
        onStart?.(this);
      },
      onUpdate: (value, completed) => {
        this.isScrolling = 'smooth';
        this.lastVelocity = this.velocity;
        this.velocity = value - this.animatedScroll;
        this.direction = Math.sign(this.velocity);
        this.animatedScroll = value;
        this.setScroll(this.scroll);
        if (programmatic) this.targetScroll = value;
        if (!completed) this.emit();
        if (completed) {
          this.reset();
          this.emit();
          onComplete?.(this);
          this.userData = {};
          requestAnimationFrame(() => this.dispatchScrollendEvent());
          this.preventNextNativeScrollEvent();
        }
      },
    });
  }

  preventNextNativeScrollEvent() {
    this._preventNextNativeScrollEvent = true;
    requestAnimationFrame(() => { this._preventNextNativeScrollEvent = false; });
  }

  checkNestedScroll(el, { deltaX, deltaY }) {
    const now = Date.now();
    const cache = (el._lenis ??= {});
    const orientation = this.options.gestureOrientation;
    let hasOverflowX, hasOverflowY, isScrollableX, isScrollableY, scrollWidth, scrollHeight, clientWidth, clientHeight;

    if (now - (cache.time ?? 0) > 2000) {
      cache.time = Date.now();
      const style = window.getComputedStyle(el);
      cache.computedStyle = style;
      hasOverflowX = ['auto', 'overlay', 'scroll'].includes(style.overflowX);
      hasOverflowY = ['auto', 'overlay', 'scroll'].includes(style.overflowY);
      cache.hasOverflowX = hasOverflowX;
      cache.hasOverflowY = hasOverflowY;
      if ((!hasOverflowX && !hasOverflowY) ||
          (orientation === 'vertical' && !hasOverflowY) ||
          (orientation === 'horizontal' && !hasOverflowX)) return false;

      scrollWidth = el.scrollWidth; scrollHeight = el.scrollHeight;
      clientWidth = el.clientWidth; clientHeight = el.clientHeight;
      isScrollableX = scrollWidth > clientWidth;
      isScrollableY = scrollHeight > clientHeight;
      cache.isScrollableX = isScrollableX; cache.isScrollableY = isScrollableY;
      cache.scrollWidth = scrollWidth; cache.scrollHeight = scrollHeight;
      cache.clientWidth = clientWidth; cache.clientHeight = clientHeight;
    } else {
      isScrollableX = cache.isScrollableX; isScrollableY = cache.isScrollableY;
      hasOverflowX = cache.hasOverflowX; hasOverflowY = cache.hasOverflowY;
      scrollWidth = cache.scrollWidth; scrollHeight = cache.scrollHeight;
      clientWidth = cache.clientWidth; clientHeight = cache.clientHeight;
    }

    let axis;
    if (!hasOverflowX && !hasOverflowY) return false;
    if (!isScrollableX && !isScrollableY) return false;
    if (orientation === 'vertical' && (!hasOverflowY || !isScrollableY)) return false;
    if (orientation === 'horizontal' && (!hasOverflowX || !isScrollableX)) return false;

    if (orientation === 'horizontal') axis = 'x';
    else if (orientation === 'vertical') axis = 'y';
    else {
      if (deltaX !== 0 && hasOverflowX && isScrollableX) axis = 'x';
      if (deltaY !== 0 && hasOverflowY && isScrollableY) axis = 'y';
    }
    if (!axis) return false;

    let pos, limit, delta, hasOverflow, isScrollable;
    if (axis === 'x') {
      pos = el.scrollLeft; limit = scrollWidth - clientWidth; delta = deltaX;
      hasOverflow = hasOverflowX; isScrollable = isScrollableX;
    } else {
      pos = el.scrollTop; limit = scrollHeight - clientHeight; delta = deltaY;
      hasOverflow = hasOverflowY; isScrollable = isScrollableY;
    }
    return (delta > 0 ? pos < limit : pos > 0) && hasOverflow && isScrollable;
  }

  get rootElement() {
    return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
  }

  get limit() {
    if (this.options.__experimental__naiveDimensions) {
      return this.isHorizontal
        ? this.rootElement.scrollWidth - this.rootElement.clientWidth
        : this.rootElement.scrollHeight - this.rootElement.clientHeight;
    }
    return this.dimensions.limit[this.isHorizontal ? 'x' : 'y'];
  }

  get isHorizontal() { return this.options.orientation === 'horizontal'; }

  get actualScroll() {
    const w = this.options.wrapper;
    return this.isHorizontal ? (w.scrollX ?? w.scrollLeft) : (w.scrollY ?? w.scrollTop);
  }

  get scroll() {
    if (!this.options.infinite) return this.animatedScroll;
    const limit = this.limit;
    return ((this.animatedScroll % limit) + limit) % limit;
  }

  get progress() { return this.limit === 0 ? 1 : this.scroll / this.limit; }

  get isScrolling() { return this._isScrolling; }
  set isScrolling(v) { if (this._isScrolling !== v) { this._isScrolling = v; this.updateClassName(); } }

  get isStopped() { return this._isStopped; }
  set isStopped(v) { if (this._isStopped !== v) { this._isStopped = v; this.updateClassName(); } }

  get isLocked() { return this._isLocked; }
  set isLocked(v) { if (this._isLocked !== v) { this._isLocked = v; this.updateClassName(); } }

  get isSmooth() { return this.isScrolling === 'smooth'; }

  get className() {
    let cls = 'lenis';
    if (this.options.autoToggle) cls += ' lenis-autoToggle';
    if (this.isStopped) cls += ' lenis-stopped';
    if (this.isLocked) cls += ' lenis-locked';
    if (this.isScrolling) cls += ' lenis-scrolling';
    if (this.isScrolling === 'smooth') cls += ' lenis-smooth';
    return cls;
  }

  updateClassName() {
    this.cleanUpClassName();
    this.rootElement.className = `${this.rootElement.className} ${this.className}`.trim();
  }

  cleanUpClassName() {
    this.rootElement.className = this.rootElement.className.replace(/lenis(-\w+)?/g, '').trim();
  }
}





let currentLenis = null;
let scrollLocked = false;
const instanceListeners = new Set();  
const scrollCallbacks = [];           

function notifyInstanceChange() {
  for (const fn of instanceListeners) fn(currentLenis);
}

function initLenis(options = {}) {
  const lenis = new Lenis({ anchors: { duration: 1.2, easing: easeOutCubic }, ...options });

  currentLenis = lenis;
  notifyInstanceChange();

  const onScroll = (instance) => {
    for (const { callback } of scrollCallbacks) callback(instance);
  };
  lenis.on('scroll', onScroll);

  function destroy() {
    lenis.off('scroll', onScroll);
    lenis.destroy();
    if (currentLenis === lenis) {
      currentLenis = null;
      notifyInstanceChange();
    }
  }

  return { lenis, destroy };
}

function easeOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function watchLenis(callback, priority = 0) {
  const entry = { callback, priority };
  scrollCallbacks.push(entry);
  scrollCallbacks.sort((a, b) => a.priority - b.priority);


  if (currentLenis) callback(currentLenis);

  const unsubscribeInstance = (() => {
    instanceListeners.add(() => {});
    return () => {};
  })();

  return () => {
    const idx = scrollCallbacks.indexOf(entry);
    if (idx !== -1) scrollCallbacks.splice(idx, 1);
  };
}

function getLenis() {
  return currentLenis;
}

function setCssScrollLocked(locked) {
  if (locked === scrollLocked) return;
  scrollLocked = locked;
  document.documentElement.classList.toggle('scroll-locked', locked);
}

function getCssScrollLocked() {
  return scrollLocked;
}

function scrollToTop(immediate = true) {
  if (currentLenis) currentLenis.scrollTo(0, { immediate });
  else window.scrollTo(0, 0);
}


export {
  Lenis,
  initLenis,
  watchLenis,
  getLenis,
  scrollToTop,
  setCssScrollLocked,
  getCssScrollLocked,
};
