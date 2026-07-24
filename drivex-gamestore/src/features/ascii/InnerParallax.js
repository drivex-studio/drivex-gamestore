
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cx } from '../../utils/cx.js'; 
import { screens, parseResponsiveValues } from '../../media/index.js'; 

gsap.registerPlugin(ScrollTrigger);

function formatValue(e) {
  if (!e) return e;
  let t = String(e).trim();
  return /^\d+(\.\d+)?$/.test(t) ? `${t}px` : t;
}

function getResponsiveStyles(v) {
  let t = typeof v === 'number' ? `${v}px` : v;
  let r = parseResponsiveValues(t) || {};
  let n = Object.keys(screens || {});
  let i = {};
  
  let defaultVal = formatValue(r.DEFAULT?.value ?? t);
  i["--parallax-overflow-DEFAULT"] = defaultVal;
  
  let s = defaultVal;
  for (let e of n) {
    let val = formatValue(r[e]?.value || s);
    i[`--parallax-overflow-${e}`] = val;
    s = val;
  }
  
  return {
    styles: i,
    className: [
      "[--parallax-overflow:var(--parallax-overflow-DEFAULT)]",
      "sm:[--parallax-overflow:var(--parallax-overflow-sm)]",
      "md:[--parallax-overflow:var(--parallax-overflow-md)]",
      "lg:[--parallax-overflow:var(--parallax-overflow-lg)]",
      "xl:[--parallax-overflow:var(--parallax-overflow-xl)]",
      "2xl:[--parallax-overflow:var(--parallax-overflow-2xl)]"
    ]
  };
}

export function initInnerParallax(parentElement, props = {}) {
  const {
    overflow,
    direction = "y",
    className,
    children,
    style = {},
    ...restProps
  } = props;

  const el = document.createElement('div');
  const innerEl = document.createElement('div');

  const { styles: responsiveStyles, className: responsiveClasses } = getResponsiveStyles(overflow);

  const wrapperClass = cx(["relative overflow-hidden", className, ...responsiveClasses]);
  el.className = wrapperClass ? wrapperClass.trim() : "";

  const combinedStyles = { ...responsiveStyles, ...style };
  Object.entries(combinedStyles).forEach(([k, v]) => {
    if (k.startsWith('--')) {
      el.style.setProperty(k, v);
    } else {
      el.style[k] = v;
    }
  });

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  innerEl.className = "absolute inset-0";

  if (direction === "x") {
    innerEl.style.width = "calc(100% + (2 * var(--parallax-overflow)))";
    innerEl.style.left = "calc(-1 * var(--parallax-overflow))";
  } else {
    innerEl.style.height = "calc(100% + (2 * var(--parallax-overflow)))";
    innerEl.style.top = "calc(-1 * var(--parallax-overflow))";
  }

  const initialTransformVal = `calc(var(--parallax-overflow) * -1)`;
  if (direction === "x") {
    innerEl.style.transform = `translateX(${initialTransformVal})`;
  } else {
    innerEl.style.transform = `translateY(${initialTransformVal})`;
  }

  if (children) {
    if (typeof children === 'string') {
      innerEl.innerHTML = children;
    } else if (children instanceof Node) {
      innerEl.appendChild(children);
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child instanceof Node) innerEl.appendChild(child);
      });
    }
  }

  el.appendChild(innerEl);
  if (parentElement) parentElement.appendChild(el);

  const st = ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      
      const val = `calc(var(--parallax-overflow) * ${2 * self.progress - 1})`;
      if (direction === "x") {
        innerEl.style.transform = `translateX(${val})`;
      } else {
        innerEl.style.transform = `translateY(${val})`;
      }
    }
  });

  function destroy() {
    st.kill();
    gsap.killTweensOf(el);
    gsap.killTweensOf(innerEl);
    el.remove();
  }

  return { el, destroy };
}