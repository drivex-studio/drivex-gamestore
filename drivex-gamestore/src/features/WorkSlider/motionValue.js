import gsap from 'gsap';
export function createMotionValue(initial = 0) {
  let current = initial;
  const listeners = new Set();

  return {
    get: () => current,
    set(next) {
      current = next;
      listeners.forEach((cb) => cb(current));
    },
    on(event, cb) {
      if (event !== 'change') return () => {};
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

export function animateMotionValue(mv, to, { duration = 0.8, ease = 'power4.inOut' } = {}) {
  const proxy = { v: mv.get() };
  return gsap.to(proxy, {
    v: to,
    duration,
    ease,
    onUpdate: () => mv.set(proxy.v),
  });
}
