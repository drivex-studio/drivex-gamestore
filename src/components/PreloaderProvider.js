export function initPreloaderProvider(parentElement, props = {}, renderChildren) {
  if (typeof renderChildren === 'function') {
    renderChildren(parentElement, props);
  }
}
