import { extendTailwindMerge } from 'https://esm.sh/tailwind-merge@2.5.0';


const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display',
        'text-h1', 'text-h2', 'text-h3', 'text-h4', 'text-h5', 'text-h6',
        'text-subheadline',
        'text-accent', 'text-accent-sm', 'text-accent-lg',
        'text-body', 'text-body-sm', 'text-body-lg',
      ],
    },
  },
});

export function cx(...args) {
  let str = '';
  for (let i = 0; i < args.length; i++) {
    let mix = args[i];
    if (mix) {
      if (typeof mix === 'string' || typeof mix === 'number') {
        str += (str && ' ') + mix;
      } else if (Array.isArray(mix)) {
        let inner = cx.apply(null, mix);
        if (inner) str += (str && ' ') + inner;
      } else if (typeof mix === 'object') {
        for (let key in mix) {
          if (mix[key]) str += (str && ' ') + key;
        }
      }
    }
  }
  return twMerge(str);
}

export function cva(base, config) {
  let resolvedBase = base;
  let resolvedConfig = config;

  // single-object style: cva({ base: [...], variants: {...} })
  if (config === undefined && base && typeof base === 'object' && !Array.isArray(base) && 'base' in base) {
    resolvedBase = base.base;
    resolvedConfig = base;
  }

  const variants = resolvedConfig?.variants || {};
  const defaultVariants = resolvedConfig?.defaultVariants || {};
  const compoundVariants = resolvedConfig?.compoundVariants || [];

  return function (props) {
    let classes = [resolvedBase];
    let currentProps = Object.assign({}, defaultVariants, props);

    for (let variant in variants) {
      let variantProp = currentProps[variant];
      if (variantProp !== undefined && variants[variant][variantProp]) {
        classes.push(variants[variant][variantProp]);
      }
    }

    for (let i = 0; i < compoundVariants.length; i++) {
      let cv = compoundVariants[i];
      let isMatch = true;
      for (let key in cv) {
        if (key === 'class' || key === 'className') continue;
        if (Array.isArray(cv[key])) {
          if (!cv[key].includes(currentProps[key])) isMatch = false;
        } else {
          if (cv[key] !== currentProps[key]) isMatch = false;
        }
      }
      if (isMatch) {
        if (cv.class) classes.push(cv.class);
        if (cv.className) classes.push(cv.className);
      }
    }

    if (props?.class) classes.push(props.class);
    if (props?.className) classes.push(props.className);

    return cx(classes);
  };
}
