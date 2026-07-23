const activeStack = [];
export const ScrambleGroupContext = {
  Provider(containerEl, value, children) {
    activeStack.push(value);

    if (children != null) {
      const items = Array.isArray(children) ? children : [children];
      for (const child of items) {
        containerEl.appendChild(
          child instanceof Node ? child : document.createTextNode(String(child))
        );
      }
    }

    return () => {
      const i = activeStack.lastIndexOf(value);
      if (i !== -1) activeStack.splice(i, 1);
    };
  },

  useContext() {
    return activeStack.length > 0 ? activeStack[activeStack.length - 1] : null;
  },
};
