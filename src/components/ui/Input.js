
import { cx, cva } from '../../utils/cx.js';

const inputVariants = cva({
  base: [
    'flex w-full border border-border bg-surface font-sans text-foreground',
    'file:border-0 file:bg-transparent file:font-medium',
    'placeholder:text-foreground-muted',
    'outline-none transition-colors duration-200 ease-out focus:border-foreground',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    size: {
      default: 'h-48 px-16 py-12 text-body file:text-body',
      sm: 'h-40 px-12 py-8 text-body-sm file:text-body-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export function initInput(parentEl, props = {}) {
  const { className, type, size, ...rest } = props;

  const input = document.createElement('input');
  input.type = type ?? 'text';
  input.className = cx(inputVariants({ size }), className);

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null) continue;
    if (key === 'autoComplete') {
      input.setAttribute('autocomplete', value);
    } else if (typeof value === 'boolean') {
      if (value) input.setAttribute(key, '');
    } else {
      input.setAttribute(key, value);
    }
  }

  if (parentEl) parentEl.appendChild(input);
  return input;
}
