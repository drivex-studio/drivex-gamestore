export function subscribeMotionValue(motionValue, eventName, handler) {
  if (!motionValue || typeof motionValue.on !== 'function') {
    console.warn('subscribeMotionValue: motionValue does not support .on', motionValue);
    return () => {};
  }

  motionValue.on(eventName, handler);

  return () => {
    if (typeof motionValue.off === 'function') {
      motionValue.off(eventName, handler);
    } else if (typeof motionValue.removeEventListener === 'function') {
      motionValue.removeEventListener(eventName, handler);
    }
  };
}
