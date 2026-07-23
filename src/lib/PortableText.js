export const LIST_NEST_MODE_HTML = "html";

function isSpan(e) {
  return e._type === "span" && "text" in e && typeof e.text === "string" && 
    (e.marks === undefined || (Array.isArray(e.marks) && e.marks.every(m => typeof m === "string")));
}

export function isPortableTextBlock(e) {
  return typeof e._type === "string" && e._type[0] !== "@" && 
    (!("markDefs" in e) || !e.markDefs || (Array.isArray(e.markDefs) && e.markDefs.every(m => typeof m._key === "string"))) && 
    "children" in e && Array.isArray(e.children) && e.children.every(c => typeof c === "object" && "_type" in c);
}

export function isPortableTextListItemBlock(e) {
  return isPortableTextBlock(e) && "listItem" in e && typeof e.listItem === "string" && 
    (e.level === undefined || typeof e.level === "number");
}

export function isPortableTextToolkitList(e) {
  return e._type === "@list";
}

export function isPortableTextToolkitSpan(e) {
  return e._type === "@span";
}

export function isPortableTextToolkitTextNode(e) {
  return e._type === "@text";
}

const sortOrder = ["strong", "em", "code", "underline", "strike-through"];

function sortMarks(span, blockChildren, marks) {
  if (!isSpan(span) || !span.marks || !span.marks.length) return [];
  let marksCopy = span.marks.slice();
  let frequency = {};
  
  marksCopy.forEach(mark => {
    frequency[mark] = 1;
    for (let i = blockChildren.indexOf(span) + 1; i < blockChildren.length; i++) {
      let sibling = blockChildren[i];
      if (sibling && isSpan(sibling) && Array.isArray(sibling.marks) && sibling.marks.includes(mark)) {
        frequency[mark]++;
      } else {
        break;
      }
    }
  });
  
  marksCopy.sort((a, b) => {
    let freqA = frequency[a];
    let freqB = frequency[b];
    if (freqA !== freqB) return freqB - freqA;
    let indexA = sortOrder.indexOf(a);
    let indexB = sortOrder.indexOf(b);
    if (indexA === indexB) return a.localeCompare(b);
    return indexA - indexB;
  });
  
  return marksCopy;
}

export function buildMarksTree(block) {
  let children = block.children;
  let markDefs = block.markDefs || [];
  if (!children || !children.length) return [];
  
  let sortedMarks = children.map(child => sortMarks(child, children, markDefs));
  
  let root = { _type: "@span", children: [], markType: "<unknown>" };
  let stack = [root];
  
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if (!child) continue;
    
    let marks = sortedMarks[i] || [];
    let commonLevel = 1; 
    
    if (stack.length > 1) {
      for (; commonLevel < stack.length; commonLevel++) {
        let markKey = stack[commonLevel]?.markKey || "";
        let markIndex = marks.indexOf(markKey);
        if (markIndex === -1) break;
        marks.splice(markIndex, 1);
      }
    }
    
    stack = stack.slice(0, commonLevel);
    let parent = stack[stack.length - 1];
    
    if (parent) {
      for (let mark of marks) {
        let markDef = markDefs.find(def => def._key === mark);
        let newSpan = {
          _type: "@span",
          _key: child._key,
          children: [],
          markDef: markDef,
          markType: markDef ? markDef._type : mark,
          markKey: mark
        };
        parent.children.push(newSpan);
        stack.push(newSpan);
        parent = newSpan;
      }
      
      if (isSpan(child)) {
        let lines = child.text.split("\n");
        for (let j = lines.length; j-- > 1;) {
          lines.splice(j, 0, "\n");
        }
        parent.children = parent.children.concat(lines.map(text => ({ _type: "@text", text: text })));
      } else {
        parent.children = parent.children.concat(child);
      }
    }
  }
  return root.children;
}

function createList(block, index, mode) {
  return {
    _type: "@list",
    _key: `${block._key || `${index}`}-parent`,
    mode: mode,
    level: block.level || 1,
    listItem: block.listItem,
    children: [block]
  };
}

function findListWithLevel(node, target) {
  let level = target.level || 1;
  let listItem = target.listItem || "normal";
  let isString = typeof target.listItem === "string";
  
  if (isPortableTextToolkitList(node) && (node.level || 1) === level && isString && (node.listItem || "normal") === listItem) {
    return node;
  }
  if (!("children" in node)) return undefined;
  let lastChild = node.children[node.children.length - 1];
  if (lastChild && !isSpan(lastChild)) {
    return findListWithLevel(lastChild, target);
  }
  return undefined;
}

export function nestLists(blocks, mode) {
  let listBlocks = [];
  let currentList;
  
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    if (!block) continue;
    
    if (!isPortableTextListItemBlock(block)) {
      listBlocks.push(block);
      currentList = undefined;
      continue;
    }
    
    if (!currentList) {
      currentList = createList(block, i, mode);
      listBlocks.push(currentList);
      continue;
    }
    
    if ((block.level || 1) === currentList.level && block.listItem === currentList.listItem) {
      currentList.children.push(block);
      continue;
    }
    
    if ((block.level || 1) > currentList.level) {
      let newList = createList(block, i, mode);
      if (mode === "html") {
        let lastItem = currentList.children[currentList.children.length - 1];
        let newItem = { ...lastItem, children: [...lastItem.children, newList] };
        currentList.children[currentList.children.length - 1] = newItem;
      } else {
        currentList.children.push(newList);
      }
      currentList = newList;
      continue;
    }
    
    if ((block.level || 1) < currentList.level) {
      let lastTopList = listBlocks[listBlocks.length - 1];
      let match = lastTopList && findListWithLevel(lastTopList, block);
      if (match) {
        currentList = match;
        currentList.children.push(block);
        continue;
      }
      currentList = createList(block, i, mode);
      listBlocks.push(currentList);
      continue;
    }
    
    if (block.listItem !== currentList.listItem) {
      let lastTopList = listBlocks[listBlocks.length - 1];
      let match = lastTopList && findListWithLevel(lastTopList, { level: block.level || 1 });
      if (match && match.listItem === block.listItem) {
        currentList = match;
        currentList.children.push(block);
        continue;
      }
      currentList = createList(block, i, mode);
      listBlocks.push(currentList);
      continue;
    }
    
    console.warn("Unknown state encountered for block", block);
    listBlocks.push(block);
  }
  return listBlocks;
}

export function spanToPlainText(node) {
  let text = "";
  node.children.forEach(child => {
    if (isPortableTextToolkitTextNode(child)) {
      text += child.text;
    } else if (isPortableTextToolkitSpan(child)) {
      text += spanToPlainText(child);
    }
  });
  return text;
}

const pRegex = /^\s/;
const gRegex = /\s$/;

export function toPlainText(blocks) {
  let arr = Array.isArray(blocks) ? blocks : [blocks];
  let result = "";
  
  arr.forEach((block, index) => {
    if (!isPortableTextBlock(block)) return;
    let addSpace = false;
    block.children.forEach(child => {
      if (isSpan(child)) {
        if (addSpace && result && !gRegex.test(result) && !pRegex.test(child.text)) {
          result += " ";
        }
        result += child.text;
        addSpace = false;
      } else {
        addSpace = true;
      }
    });
    if (index !== arr.length - 1) {
      result += "\n\n";
    }
  });
  return result;
}

function appendChildren(el, children) {
  if (!children) return;
  const arr = Array.isArray(children) ? children : [children];
  arr.forEach(child => {
    if (typeof child === "string" || typeof child === "number") {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
}

const defaultComponents = {
  types: {},
  block: {
    normal: (parent, { children }) => { const el = document.createElement("p"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    blockquote: (parent, { children }) => { const el = document.createElement("blockquote"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    h1: (parent, { children }) => { const el = document.createElement("h1"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    h2: (parent, { children }) => { const el = document.createElement("h2"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    h3: (parent, { children }) => { const el = document.createElement("h3"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    h4: (parent, { children }) => { const el = document.createElement("h4"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    h5: (parent, { children }) => { const el = document.createElement("h5"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    h6: (parent, { children }) => { const el = document.createElement("h6"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; }
  },
  marks: {
    em: (parent, { children }) => { const el = document.createElement("em"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    strong: (parent, { children }) => { const el = document.createElement("strong"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    code: (parent, { children }) => { const el = document.createElement("code"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    underline: (parent, { children }) => { 
      const el = document.createElement("span"); 
      el.style.textDecoration = "underline";
      appendChildren(el, children); 
      if(parent) parent.appendChild(el); 
      return { el, destroy: () => el.remove() }; 
    },
    "strike-through": (parent, { children }) => { const el = document.createElement("del"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    link: (parent, { children, value }) => { 
      const el = document.createElement("a"); 
      if(value?.href) el.href = value.href;
      appendChildren(el, children); 
      if(parent) parent.appendChild(el); 
      return { el, destroy: () => el.remove() }; 
    }
  },
  list: {
    number: (parent, { children }) => { const el = document.createElement("ol"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
    bullet: (parent, { children }) => { const el = document.createElement("ul"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; }
  },
  listItem: (parent, { children }) => { const el = document.createElement("li"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
  hardBreak: (parent) => { const el = document.createElement("br"); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
  unknownType: (parent, { value, isInline }) => { 
    const el = document.createElement(isInline ? "span" : "div");
    el.style.display = "none";
    el.textContent = `[@portabletext/react] Unknown block type "${value._type}", specify a component for it in the \`components.types\` prop`;
    if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() };
  },
  unknownMark: (parent, { markType, children }) => { 
    const el = document.createElement("span"); 
    el.className = `unknown__pt__mark__${markType}`; 
    appendChildren(el, children); 
    if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; 
  },
  unknownList: (parent, { children }) => { const el = document.createElement("ul"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
  unknownListItem: (parent, { children }) => { const el = document.createElement("li"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; },
  unknownBlockStyle: (parent, { children }) => { const el = document.createElement("p"); appendChildren(el, children); if(parent) parent.appendChild(el); return { el, destroy: () => el.remove() }; }
};

function mergeCategory(defaults, custom, key) {
  const def = defaults[key];
  const cust = custom[key];
  if (typeof cust === "function" || (cust && typeof def === "function")) {
    return cust;
  }
  if (cust) {
    return { ...def, ...cust };
  }
  return def;
}

function mergeComponents(defaults, custom) {
  if (!custom) return defaults;
  return {
    ...defaults,
    block: mergeCategory(defaults, custom, "block"),
    list: mergeCategory(defaults, custom, "list"),
    listItem: mergeCategory(defaults, custom, "listItem"),
    marks: mergeCategory(defaults, custom, "marks"),
    types: mergeCategory(defaults, custom, "types"),
  };
}

function getComponent(category, key, fallback) {
  if (typeof category === "function") return category;
  if (category && typeof category[key] === "function") return category[key];
  return fallback;
}

function renderBlockTree(node, index, isInline, mergedComponents, onMissingComponent) {
  const tree = buildMarksTree(node);
  const childrenData = tree.map((child, i) => renderNode(child, i, true, mergedComponents, onMissingComponent));
  const childrenEls = childrenData.map(c => c.el ? c.el : (c.text !== undefined ? c.text : null)).filter(c => c !== null);
  return { childrenData, childrenEls };
}

function renderNode(node, index, isInline, mergedComponents, onMissingComponent) {
  if (isPortableTextToolkitList(node)) {
    const childNodesData = node.children.map((child, i) => renderNode(child, i, false, mergedComponents, onMissingComponent));
    const listStyle = node.listItem || "bullet";
    const ListComponent = getComponent(mergedComponents.list, listStyle, mergedComponents.unknownList);
    
    if (ListComponent === mergedComponents.unknownList) {
      onMissingComponent(`Unknown list style "${listStyle}"`, { nodeType: "listStyle", type: listStyle });
    }
    
    const childrenEls = childNodesData.map(c => c.el ? c.el : (c.text !== undefined ? c.text : null)).filter(c => c !== null);
    const inst = ListComponent(null, { value: node, index, isInline: false, children: childrenEls });
    
    return {
      el: inst?.el,
      destroy: () => {
        childNodesData.forEach(c => c.destroy?.());
        inst?.destroy?.();
      }
    };
  }
  
  if (isPortableTextListItemBlock(node)) {
    const blockData = renderBlockTree(node, index, false, mergedComponents, onMissingComponent);
    const listStyle = node.listItem || "bullet";
    const ListItemComponent = getComponent(mergedComponents.listItem, listStyle, mergedComponents.unknownListItem);
    
    if (ListItemComponent === mergedComponents.unknownListItem) {
      onMissingComponent(`Unknown list item style "${listStyle}"`, { type: listStyle, nodeType: "listItemStyle" });
    }
    
    let childrenData = blockData.childrenData;
    let childrenEls = blockData.childrenEls;
    
    if (node.style && node.style !== "normal") {
      const { listItem, ...restNode } = node;
      const blockInst = renderNode(restNode, index, false, mergedComponents, onMissingComponent);
      childrenData = [blockInst];
      childrenEls = [blockInst.el ? blockInst.el : (blockInst.text !== undefined ? blockInst.text : null)].filter(c => c !== null);
    }
    
    const inst = ListItemComponent(null, { value: node, index, isInline: false, children: childrenEls });
    
    return {
      el: inst?.el,
      destroy: () => {
        childrenData.forEach(c => c.destroy?.());
        inst?.destroy?.();
      }
    };
  }
  
  if (isPortableTextToolkitSpan(node)) {
    const { markDef, markType, markKey } = node;
    const MarkComponent = mergedComponents.marks[markType] || mergedComponents.unknownMark;
    
    if (MarkComponent === mergedComponents.unknownMark) {
      onMissingComponent(`Unknown mark type "${markType}"`, { nodeType: "mark", type: markType });
    }
    
    const childNodesData = node.children.map((child, i) => renderNode(child, i, true, mergedComponents, onMissingComponent));
    const childrenEls = childNodesData.map(c => c.el ? c.el : (c.text !== undefined ? c.text : null)).filter(c => c !== null);
    
    const text = spanToPlainText(node);
    const inst = MarkComponent(null, { text, value: markDef, markType, markKey, children: childrenEls });
    
    return {
      el: inst?.el,
      destroy: () => {
        childNodesData.forEach(c => c.destroy?.());
        inst?.destroy?.();
      }
    };
  }
  
  if (node._type in mergedComponents.types) {
    const TypeComponent = mergedComponents.types[node._type];
    const inst = TypeComponent(null, { value: node, isInline, index });
    return { el: inst?.el, destroy: () => inst?.destroy?.() };
  }
  
  if (isPortableTextBlock(node)) {
    const blockData = renderBlockTree(node, index, isInline, mergedComponents, onMissingComponent);
    const style = node.style || "normal";
    const BlockComponent = getComponent(mergedComponents.block, style, mergedComponents.unknownBlockStyle);
    
    if (BlockComponent === mergedComponents.unknownBlockStyle) {
      onMissingComponent(`Unknown block style "${style}"`, { nodeType: "blockStyle", type: style });
    }
    
    const inst = BlockComponent(null, { value: node, index, isInline, children: blockData.childrenEls });
    
    return {
      el: inst?.el,
      destroy: () => {
        blockData.childrenData.forEach(c => c.destroy?.());
        inst?.destroy?.();
      }
    };
  }
  
  if (isPortableTextToolkitTextNode(node)) {
    if (node.text === "\n") {
      if (mergedComponents.hardBreak) {
        const inst = mergedComponents.hardBreak(null, {});
        return { el: inst?.el, destroy: () => inst?.destroy?.() };
      }
      return { text: "\n" };
    }
    return { text: node.text };
  }
  
  onMissingComponent(`Unknown block type "${node._type}"`, { nodeType: "block", type: node._type });
  const UnknownComponent = mergedComponents.unknownType;
  const inst = UnknownComponent(null, { value: node, isInline, index });
  return { el: inst?.el, destroy: () => inst?.destroy?.() };
}

export function initPortableText(parentElement, props = {}) {
  const { 
    value, 
    components: customComponents = {}, 
    listNestingMode = "html"
  } = props;
  
  const onMissingComponent = typeof props.onMissingComponent !== "undefined" 
    ? (props.onMissingComponent === false ? () => {} : props.onMissingComponent) 
    : (msg) => console.warn(msg);
  
  const mergedComponents = mergeComponents(defaultComponents, customComponents);
  const blocks = Array.isArray(value) ? value : [value];
  const nested = nestLists(blocks, listNestingMode);
  
  const childInstances = [];
  const rootNodes = [];
  
  nested.forEach((node, index) => {
    const data = renderNode(node, index, false, mergedComponents, onMissingComponent);
    if (data) {
      childInstances.push(data);
      if (data.el) {
        rootNodes.push(data.el);
        if (parentElement) parentElement.appendChild(data.el);
      } else if (data.text) {
        const textNode = document.createTextNode(data.text);
        rootNodes.push(textNode);
        if (parentElement) parentElement.appendChild(textNode);
      }
    }
  });
  
  function destroy() {
    childInstances.forEach(inst => inst?.destroy?.());
    rootNodes.forEach(node => {
      if (node instanceof Node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }
  
  return { el: rootNodes[0], els: rootNodes, destroy };
}