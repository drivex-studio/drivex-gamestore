import { initPortableText } from '../../lib/PortableText.js'; 
import { stegaClean } from '@sanity/client/stega'; 
import { cx } from "../../utils/cx.js";
import { initInnerParallax } from "../../features/ascii/InnerParallax.js";
import { initAnimatedProse } from "../AnimatedProse.js";

import { initAnimatedText } from "../AnimatedText.js";
import { 
  SanityLink as initSanityLink, 
  initSanityMedia } from "../../media/index.js";

function extractChildrenText(children) {
  if (!children) return [];
  const arr = Array.isArray(children) ? children : [children];
  return arr.map(child => {
    if (typeof child === 'string') return child;
    if (child instanceof Node) return child.textContent;
    if (child && typeof child === 'object' && 'children' in child) return child.children;
    return null;
  });
}

function appendChildren(el, children) {
  if (!children) return;
  const arr = Array.isArray(children) ? children : [children];
  arr.forEach(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
}

function initMediaBlock(parentElement, props = {}) {
  const { value, className } = props;
  if (!value) return null;
  
  const { media, caption } = value;
  const childInstances = [];

  const el = document.createElement('figure');
  const resolvedClass = cx("flex flex-col gap-16", className);
  el.className = resolvedClass ? resolvedClass.trim() : '';
  el.setAttribute('data-rich-text-block', 'mediaBlock');

  const aspectRatio = media?.aspectRatio ?? undefined;

  const parallaxInst = initInnerParallax(el, {
    overflow: "60 lg:120",
    style: { aspectRatio }
  });
  if (parallaxInst) childInstances.push(parallaxInst);

  if (media && parallaxInst?.el) {
    const mediaInst = initSanityMedia(parallaxInst.el, {
      media,
      className: "size-full"
    });
    if (mediaInst) childInstances.push(mediaInst);
  }

  if (caption) {
    const fig = document.createElement('figcaption');
    fig.textContent = caption;
    el.appendChild(fig);
  }

  if (parentElement) parentElement.appendChild(el);
  return { 
    el, 
    destroy: () => { 
      childInstances.forEach(i => i?.destroy?.()); 
      el.remove(); 
    } 
  };
}

function initListOrdered(parentElement, props = {}) {
  const { children } = props;
  const el = document.createElement('ol');
  el.className = "flex list-none flex-col gap-8 text-body";
  const instances = [];

  extractChildrenText(children).forEach((childData, i) => {
    const li = document.createElement('li');
    li.className = "flex items-start gap-8";

    const numSpan = document.createElement('span');
    numSpan.className = "shrink-0 text-foreground-muted";
    numSpan.textContent = `${i + 1}.`;
    li.appendChild(numSpan);

    const animInst = initAnimatedText(li, { children: childData });
    if (animInst) instances.push(animInst);

    el.appendChild(li);
  });

  if (parentElement) parentElement.appendChild(el);
  return { 
    el, 
    destroy: () => { 
      instances.forEach(inst => inst?.destroy?.()); 
      el.remove(); 
    } 
  };
}

function initListUnordered(parentElement, props = {}) {
  const { children } = props;
  const el = document.createElement('ul');
  el.className = "flex list-none flex-col gap-8 text-body";
  const instances = [];

  extractChildrenText(children).forEach((childData, i) => {
    const li = document.createElement('li');
    li.className = "flex items-start gap-8";

    const bullet = document.createElement('span');
    bullet.className = "mt-[0.5em] size-4 shrink-0 rounded-full bg-current";
    bullet.setAttribute('aria-hidden', 'true');
    li.appendChild(bullet);

    const animInst = initAnimatedText(li, { children: childData });
    if (animInst) instances.push(animInst);

    el.appendChild(li);
  });

  if (parentElement) parentElement.appendChild(el);
  return { 
    el, 
    destroy: () => { 
      instances.forEach(inst => inst?.destroy?.()); 
      el.remove(); 
    } 
  };
}

function initBlockH4(parentElement, props = {}) {
  const el = document.createElement('h4');
  el.className = "mt-8 text-h6 first:mt-0 lg:mt-16";
  const childInst = initAnimatedText(el, { children: props.children });
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => { childInst?.destroy?.(); el.remove(); } };
}

function initBlockH3(parentElement, props = {}) {
  const el = document.createElement('h3');
  el.className = "mt-16 text-h5 first:mt-0 lg:mt-24";
  const childInst = initAnimatedText(el, { children: props.children });
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => { childInst?.destroy?.(); el.remove(); } };
}

function initBlockH2(parentElement, props = {}) {
  const el = document.createElement('h2');
  el.className = "mt-24 text-h4 first:mt-0 lg:mt-32";
  const childInst = initAnimatedText(el, { children: props.children });
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => { childInst?.destroy?.(); el.remove(); } };
}

function initBlockNormal(parentElement, props = {}) {
  const el = document.createElement('div');
  el.className = "text-body empty:hidden";
  el.setAttribute('data-paragraph', 'true');
  const childInst = initAnimatedText(el, { children: props.children });
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => { childInst?.destroy?.(); el.remove(); } };
}

function initMarkLink(parentElement, props = {}) {
  const { value, children } = props;
  
  const linkInst = initSanityLink(parentElement, {
    link: value,
    className: "group relative no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    children
  });

  if (linkInst && linkInst.el) {
    const span1 = document.createElement('span');
    span1.className = "pointer-events-none absolute inset-x-0 -bottom-1";
    span1.setAttribute('aria-hidden', 'true');
    span1.innerHTML = `
      <span class="absolute inset-x-0 top-0 h-px origin-left scale-x-100 bg-current transition-transform delay-300 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0 group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0"></span>
      <span class="absolute inset-x-0 top-0 h-px origin-right scale-x-0 bg-current transition-transform delay-0 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300 group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300"></span>
    `;
    linkInst.el.appendChild(span1);
  }

  return linkInst;
}

function initMarkHighlightColor(parentElement, props = {}) {
  const el = document.createElement('span');
  el.className = "bg-(--color-value) text-inherit";
  if (props.value?.color) {
    el.style.setProperty('--color-value', stegaClean(props.value.color));
  }
  appendChildren(el, props.children);
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => el.remove() };
}

function initMarkTextColor(parentElement, props = {}) {
  const el = document.createElement('span');
  el.className = "bg-inherit text-(--color-value)";
  if (props.value?.color) {
    el.style.setProperty('--color-value', stegaClean(props.value.color));
  }
  appendChildren(el, props.children);
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => el.remove() };
}

function initMarkSup(parentElement, props = {}) {
  const el = document.createElement('sup');
  el.className = "text-[0.6em]";
  appendChildren(el, props.children);
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => el.remove() };
}

function initMarkUnderline(parentElement, props = {}) {
  const el = document.createElement('em');
  el.className = "not-italic underline underline-offset-2";
  appendChildren(el, props.children);
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => el.remove() };
}

function initMarkStrong(parentElement, props = {}) {
  const el = document.createElement('strong');
  el.className = "font-bold";
  appendChildren(el, props.children);
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => el.remove() };
}

function initMarkEm(parentElement, props = {}) {
  const el = document.createElement('em');
  el.className = "italic";
  appendChildren(el, props.children);
  if (parentElement) parentElement.appendChild(el);
  return { el, destroy: () => el.remove() };
}

function initInlineMedia(parentElement, props = {}) {
  const media = props.value?.media;
  if (!media) return null;

  return initSanityMedia(parentElement, {
    media,
    width: 100,
    autoPlay: true,
    loop: true,
    videoProps: {
      noControls: true,
      muted: true,
      playsInline: true
    },
    className: "inline-flex h-[1em] w-auto align-middle"
  });
}

export function initSanityRichText(parentElement, props = {}) {
  const { value, className } = props;
  if (!value) return null;

  const resolvedClass = cx("flex flex-col gap-16", className);
  
  const proseInst = initAnimatedProse(parentElement, { 
    className: resolvedClass?.trim() 
  });

  const componentsConfig = {
    types: {
      mediaBlock: initMediaBlock,
      inlineMediaField: initInlineMedia
    },
    marks: {
      em: initMarkEm,
      strong: initMarkStrong,
      underline: initMarkUnderline,
      sup: initMarkSup,
      textColorField: initMarkTextColor,
      highlightColorField: initMarkHighlightColor,
      linkField: initMarkLink
    },
    block: {
      normal: initBlockNormal,
      h2: initBlockH2,
      h3: initBlockH3,
      h4: initBlockH4
    },
    list: {
      bullet: initListUnordered,
      number: initListOrdered
    }
  };

  const ptInst = initPortableText(proseInst.el, {
    value,
    onMissingComponent: false,
    components: componentsConfig
  });

  function destroy() {
    ptInst?.destroy?.();
    proseInst?.destroy?.();
  }

  return { el: proseInst.el, destroy };
}
