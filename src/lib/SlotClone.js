
import { cx } from '../utils/cx.js';

export function mergeProps(slotProps, childProps) {
  const merged = { ...childProps };
  for (const key in childProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key)) {
      if (slotValue && childValue) {
        merged[key] = (...args) => {
          childValue(...args);
          slotValue(...args);
        };
      } else if (slotValue) {
        merged[key] = slotValue;
      }
    } else if (key === 'style') {
      merged[key] = { ...slotValue, ...childValue };
    } else if (key === 'className') {
      merged[key] = cx([slotValue, childValue]);
    }
  }
  return { ...slotProps, ...merged };
}

export function Slot(props, targetEl) {
  if (!targetEl) return null;
  const { children, ...restProps } = props;
  applyPropsToElement(targetEl, restProps);
  if (children !== undefined) {
    targetEl.replaceChildren();
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child instanceof Node) targetEl.appendChild(child);
      else if (child != null) targetEl.appendChild(document.createTextNode(String(child)));
    });
  }
  return targetEl;
}

function applyPropsToElement(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (key === 'className') el.className = cx(el.className, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (/^on[A-Z]/.test(key) && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'ref') {
      
    } else {
      el.setAttribute(key, value);
    }
  }
}
