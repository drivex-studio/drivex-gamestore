// ---- FooterStore.js ----

// -- State Management --
let isVisible = true;
const listeners = new Set();

export function subscribeFooter(listener) {
  listeners.add(listener);
  listener({ isVisible });
  return () => {
    listeners.delete(listener);
  };
}

export function setFooterVisibility(visible) {
  const nextState = Boolean(visible);
  if (isVisible === nextState) return;
  
  isVisible = nextState;
  listeners.forEach((listener) => listener({ isVisible }));
}

export function hideFooter() {
  setFooterVisibility(false);
  return () => {
    setFooterVisibility(true);
  };
}
export class FooterSlot {
  constructor(element) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    
    this.unsubscribe = subscribeFooter(({ isVisible }) => {
      this.render(isVisible);
    });
  }

  render(isVisible) {
    if (!this.el) return;
    
    if (isVisible) {
      this.el.style.display = '';
      this.el.removeAttribute('aria-hidden');
    } else {
      this.el.style.display = 'none';
      this.el.setAttribute('aria-hidden', 'true');
    }
  }

  destroy() {
    this.unsubscribe?.();
    this.el = null;
  }
}
