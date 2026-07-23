
import { useIsoLayoutEffect } from './useIsoLayoutEffect.js';
import { screens } from '../media/shared/screens.js';

function createMediaQueryWatcher(query, initializeWithValue) {
  let matches = initializeWithValue;
  let ready = false;
  const listeners = new Set();

  const mediaQueryList = window.matchMedia(query.substring(query.indexOf('(')).trim());
  const handleChange = () => {
    matches = mediaQueryList.matches;
    ready = true;
    listeners.forEach((fn) => fn({ matches, ready }));
  };

  useIsoLayoutEffect(() => {
    mediaQueryList.addEventListener('change', handleChange);
    handleChange();
    return () => mediaQueryList.removeEventListener('change', handleChange);
  });

  return {
    get matches() { return matches; },
    get ready() { return ready; },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export function useBreakpoint(breakpointName, options) {
  const initializeWithValue = options?.initializeWithValue ?? false;
  const watcher = createMediaQueryWatcher(`(min-width: ${screens[breakpointName]})`, initializeWithValue);
  return watcher.matches;
}

export function useIsTouchDevice(options) {
  const initializeWithValue = options?.initializeWithValue ?? false;
  const watcher = createMediaQueryWatcher('(pointer: coarse)', initializeWithValue);
  return watcher.matches;
}



