
export function flattenChildrenToText(children) {
  const arr = Array.isArray(children) ? children : [children];
  return arr.map((child) => {
    if (child == null || child === false) return null;
    if (typeof child === "string") return child;
    if (typeof child === "number") return String(child);
    
    if (typeof child === "object" && typeof child.textContent === "string") {
      return child.textContent;
    }
    
    if (
      typeof child === "object" &&
      child !== null &&
      typeof child.props === "object" &&
      child.props !== null &&
      "children" in child.props
    ) {
      return child.props.children;
    }
    return null;
  });
}

function spanToPlainText(node) {
  let text = "";
  if (!node || !Array.isArray(node.children)) return text;
  for (const child of node.children) {
    if (!child) continue;
    if (child._type === "@text" && typeof child.text === "string") {
      text += child.text;
    } else if (child._type === "@span") {
      text += spanToPlainText(child);
    }
  }
  return text;
}

export function buildComponentsConfig(deps) {
  const {
    cx,
    stegaClean,
    initSanityMedia,
    initSanityLink,
    initAnimatedText,
    initInnerParallax,
  } = deps;

  const mediaBlock = (parentElement, props = {}) => {
    const { value, className } = props;
    if (!value) return null;
    const { media, caption } = value;

    const cls = cx("flex flex-col gap-16", className);
    const aspectRatio = media?.aspectRatio ?? undefined;
    const style = { aspectRatio };

    const figure = document.createElement("figure");
    figure.className = cls;
    figure.setAttribute("data-rich-text-block", "mediaBlock");

    const parallaxHost = initInnerParallax(figure, {
      overflow: "60 lg:120",
      style,
    });
    initSanityMedia(parallaxHost, { media, className: "size-full" });

    if (caption) {
      const figcaption = document.createElement("figcaption");
      
      figcaption.textContent = caption;
      figure.appendChild(figcaption);
    }

    if (parentElement) parentElement.appendChild(figure);
    return figure;
  };

  const inlineMediaField = (parentElement, props = {}) => {
    const { value } = props;
    const media = value?.media;
    if (!media) return null;
    return initSanityMedia(parentElement, {
      media,
      width: 100,
      autoPlay: true,
      loop: true,
      videoProps: { noControls: true, muted: true, playsInline: true },
      className: "inline-flex h-[1em] w-auto align-middle",
    });
  };

  const numberList = (parentElement, props = {}) => {
    const { children } = props;
    const ol = document.createElement("ol");
    ol.className = "flex list-none flex-col gap-8 text-body";
    const items = flattenChildrenToText(children);
    items.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-8";
      const numberSpan = document.createElement("span");
      numberSpan.className = "shrink-0 text-foreground-muted";
      numberSpan.textContent = `${i + 1}.`;
      li.appendChild(numberSpan);
      initAnimatedText(li, { children: item });
      ol.appendChild(li);
    });
    if (parentElement) parentElement.appendChild(ol);
    return ol;
  };

  const bulletList = (parentElement, props = {}) => {
    const { children } = props;
    const ul = document.createElement("ul");
    ul.className = "flex list-none flex-col gap-8 text-body";
    const items = flattenChildrenToText(children);
    items.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-8";
      const dot = document.createElement("span");
      dot.className = "mt-[0.5em] size-4 shrink-0 rounded-full bg-current";
      dot.setAttribute("aria-hidden", "true");
      li.appendChild(dot);
      initAnimatedText(li, { children: item });
      ul.appendChild(li);
    });
    if (parentElement) parentElement.appendChild(ul);
    return ul;
  };

  const h4Block = (parentElement, props = {}) => {
    const { children } = props;
    const h4 = document.createElement("h4");
    h4.className = "mt-8 text-h6 first:mt-0 lg:mt-16";
    initAnimatedText(h4, { children });
    if (parentElement) parentElement.appendChild(h4);
    return h4;
  };

  const h3Block = (parentElement, props = {}) => {
    const { children } = props;
    const h3 = document.createElement("h3");
    h3.className = "mt-16 text-h5 first:mt-0 lg:mt-24";
    initAnimatedText(h3, { children });
    if (parentElement) parentElement.appendChild(h3);
    return h3;
  };

  const h2Block = (parentElement, props = {}) => {
    const { children } = props;
    const h2 = document.createElement("h2");
    h2.className = "mt-24 text-h4 first:mt-0 lg:mt-32";
    initAnimatedText(h2, { children });
    if (parentElement) parentElement.appendChild(h2);
    return h2;
  };

  const normalBlock = (parentElement, props = {}) => {
    const { children } = props;
    const div = document.createElement("div");
    div.className = "text-body empty:hidden";
    
    div.setAttribute("data-paragraph", "true");
    initAnimatedText(div, { children });
    if (parentElement) parentElement.appendChild(div);
    return div;
  };

  const linkFieldMark = (parentElement, props = {}) => {
    const { value, children } = props;
    const sanityLinkEl = initSanityLink(parentElement, {
      link: value,
      className:
        "group relative no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    });

    if (sanityLinkEl && typeof sanityLinkEl.appendChild === "function") {
      appendChildren(sanityLinkEl, children);

      const underlineWrap = document.createElement("span");
      underlineWrap.className = "pointer-events-none absolute inset-x-0 -bottom-1";
      underlineWrap.setAttribute("aria-hidden", "true");

      const underOut = document.createElement("span");
      underOut.className = cx(
        "absolute inset-x-0 top-0 h-px origin-left scale-x-100 bg-current",
        "transition-transform delay-300 duration-700",
        "[transition-timing-function:cubic-bezier(0.625,0.05,0,1)]",
        "group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0",
        "group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0"
      );

      const underIn = document.createElement("span");
      underIn.className = cx(
        "absolute inset-x-0 top-0 h-px origin-right scale-x-0 bg-current",
        "transition-transform delay-0 duration-700",
        "[transition-timing-function:cubic-bezier(0.625,0.05,0,1)]",
        "group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300",
        "group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300"
      );

      underlineWrap.appendChild(underOut);
      underlineWrap.appendChild(underIn);
      sanityLinkEl.appendChild(underlineWrap);
    }

    return sanityLinkEl;
  };

  const highlightColorFieldMark = (parentElement, props = {}) => {
    const { value, children } = props;
    const span = document.createElement("span");
    span.style.setProperty("--color-value", stegaClean(value.color));
    span.className = "bg-(--color-value) text-inherit";
    appendChildren(span, children);
    if (parentElement) parentElement.appendChild(span);
    return span;
  };

  const textColorFieldMark = (parentElement, props = {}) => {
    const { value, children } = props;
    const span = document.createElement("span");
    span.style.setProperty("--color-value", stegaClean(value.color));
    span.className = "bg-inherit text-(--color-value)";
    appendChildren(span, children);
    if (parentElement) parentElement.appendChild(span);
    return span;
  };

  const supMark = (parentElement, props = {}) => {
    const { children } = props;
    const sup = document.createElement("sup");
    sup.className = "text-[0.6em]";
    appendChildren(sup, children);
    if (parentElement) parentElement.appendChild(sup);
    return sup;
  };

  const underlineMark = (parentElement, props = {}) => {
    const { children } = props;
    const em = document.createElement("em");
    em.className = "not-italic underline underline-offset-2";
    appendChildren(em, children);
    if (parentElement) parentElement.appendChild(em);
    return em;
  };

  const strongMark = (parentElement, props = {}) => {
    const { children } = props;
    const strong = document.createElement("strong");
    strong.className = "font-bold";
    appendChildren(strong, children);
    if (parentElement) parentElement.appendChild(strong);
    return strong;
  };

  const emMark = (parentElement, props = {}) => {
    const { children } = props;
    const em = document.createElement("em");
    em.className = "italic";
    appendChildren(em, children);
    if (parentElement) parentElement.appendChild(em);
    return em;
  };

  return {
    types: { mediaBlock, inlineMediaField },
    marks: {
      em: emMark,
      strong: strongMark,
      underline: underlineMark,
      sup: supMark,
      textColorField: textColorFieldMark,
      highlightColorField: highlightColorFieldMark,
      linkField: linkFieldMark,
    },
    block: {
      normal: normalBlock,
      h2: h2Block,
      h3: h3Block,
      h4: h4Block,
    },
    list: {
      bullet: bulletList,
      number: numberList,
    },
  };
}

function appendChildren(container, children) {
  if (children == null || children === false) return;
  if (Array.isArray(children)) {
    children.forEach((c) => appendChildren(container, c));
    return;
  }
  if (typeof children === "string" || typeof children === "number") {
    container.appendChild(document.createTextNode(String(children)));
    return;
  }
  
  container.appendChild(children);
}
