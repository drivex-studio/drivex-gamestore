
import { Slot } from './SlotClone.js';

function resolveChildren(props, arg) {
  return typeof props.children === 'function' ? props.children(arg) : props.children;
}

export function Slottable({ asChild, child, children, ...restProps }) {
  if (!(child instanceof Node)) {
    return asChild ? null : resolveChildren({ children }, child);
  }
  const originalChildNodes = Array.from(child.childNodes);
  const resolvedContent = resolveChildren({ children }, originalChildNodes);
  return Slot({ ...restProps, children: resolvedContent }, child);
}
