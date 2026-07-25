
export function useEventListener(eventName, handler, target = window, options) {
  const handlerBox = { current: handler };

  function setHandler(nextHandler) {
    handlerBox.current = nextHandler;
  }

  if (!target) {
    return { destroy: () => {}, setHandler };
  }

  const listener = (event) => {
    handlerBox.current(event);
  };
  target.addEventListener(eventName, listener, options);

  function destroy() {
    target.removeEventListener(eventName, listener, options);
  }

  return { destroy, setHandler };
}
