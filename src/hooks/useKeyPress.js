
export function useKeyPress(key, handler, capture = false) {
  const listener = (event) => {
    if (event.key === key) handler(event);
  };
  window.addEventListener('keydown', listener, capture);

  function destroy() {
    window.removeEventListener('keydown', listener, capture);
  }

  return { destroy };
}