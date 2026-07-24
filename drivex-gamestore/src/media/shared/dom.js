
export function setStyles(el, styles) {
  if (!styles) return;
  Object.entries(styles).forEach(([key, value]) => {
    if (value == null) return;
    if (key.startsWith('--')) el.style.setProperty(key, String(value));
    else el.style[key] = value;
  });
}

export function applyRestProps(el, props) {
  Object.entries(props || {}).forEach(([key, value]) => {
    if (value == null || typeof value === 'function') return;
    if (key === 'className') el.className = value;
    else if (key === 'htmlFor') el.setAttribute('for', value);
    else if (key === 'aria-hidden') el.setAttribute('aria-hidden', value);
    else el.setAttribute(key, value === true ? '' : String(value));
  });
}

export function appendChildValue(parent, value) {
  if (value == null || value === false) return;
  if (Array.isArray(value)) {
    value.forEach(item => appendChildValue(parent, item));
    return;
  }
  if (value instanceof Node) parent.appendChild(value);
  else parent.appendChild(document.createTextNode(String(value)));
}
