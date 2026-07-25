import { cx } from '../../utils/cx.js';

const VALID_THEMES = ['light', 'dark', 'brand'];

export function initPageBuilderSection({
  name,
  theme = 'light',
  tag = 'section',
  padding,
  className,
  withGrid = true,
  gridClassName,
  mainContainer,
} = {}) {
  const resolvedTheme = VALID_THEMES.includes(theme) ? theme : 'light';

  const sectionEl = document.createElement(tag);
  sectionEl.setAttribute('data-theme', resolvedTheme);
  sectionEl.setAttribute('data-page-builder-section', name ?? 'true');
  sectionEl.className = cx('bg-background', padding, className);

  let gridContainerEl = sectionEl;
  let gridLayoutEl = sectionEl;

  if (withGrid) {
    gridContainerEl = document.createElement('div');
    gridContainerEl.className = 'grid-container';

    gridLayoutEl = document.createElement('div');
    gridLayoutEl.className = cx('grid-layout', gridClassName);

    gridContainerEl.appendChild(gridLayoutEl);
    sectionEl.appendChild(gridContainerEl);
  }

  const instances = [];
  function registerInstance(instance) {
    if (instance) {
      instances.push(instance);
    }
    return instance;
  }


  function resolveElement(child) {
    if (!child) return null;
    if (child instanceof Node) return child;
    return child.element ?? child.el ?? null;
  }

  function addSpan(spanClassName, ...children) {
    const spanEl = document.createElement('div');
    spanEl.className = spanClassName;
    children.forEach((child) => {
      const el = resolveElement(child);
      if (el) spanEl.appendChild(el);
      if (child && !(child instanceof Node)) registerInstance(child);
    });
    gridLayoutEl.appendChild(spanEl);
    return spanEl;
  }

  if (mainContainer) mainContainer.appendChild(sectionEl);

  function mount() {
    instances.forEach((instance) => instance?.mount?.());
  }

  function destroy() {
    instances.forEach((instance) => instance?.destroy?.());
    if (sectionEl.parentNode) sectionEl.parentNode.removeChild(sectionEl);
  }

  return {
    element: sectionEl,
    gridContainerEl,
    gridLayoutEl,
    addSpan,
    registerInstance,
    mount,
    destroy,
  };
}

