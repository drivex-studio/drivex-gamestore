import { getLenis } from '../lib/lenisState.js';

let defaultModalContext = {
  isOpen: false,
  modalId: null,
  modalData: undefined,
  openModal: () => {},
  closeModal: () => {}
};

export const modalContext = { ...defaultModalContext };
export const modalEvents = new EventTarget();

export function initModalProvider(props = {}, parentElement = null) {
  let { children } = props;

  let openModal = (e, t) => {
    let lenis = getLenis();
    lenis?.stop();
    
    modalContext.isOpen = true;
    modalContext.modalId = e;
    modalContext.modalData = t;
    modalEvents.dispatchEvent(new CustomEvent('onModalChange', { 
        detail: modalContext 
    }));
  };

  let closeModal = () => {
    let lenis = getLenis();
    lenis?.start();

    modalContext.isOpen = false;
    modalContext.modalId = null;
    modalContext.modalData = undefined;

    modalEvents.dispatchEvent(new CustomEvent('onModalChange', { 
        detail: modalContext 
    }));
  };

  modalContext.openModal = openModal;
  modalContext.closeModal = closeModal;

  if (parentElement && children) {
    if (children instanceof Node) {
      parentElement.appendChild(children);
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Node) parentElement.appendChild(child);
      });
    }
  }

  return {
    destroy: destroyModalProvider
  };
}

export function destroyModalProvider() {
  Object.assign(modalContext, defaultModalContext);
}

export function useModal() {
  return modalContext;
}
