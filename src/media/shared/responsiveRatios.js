'use strict';

import { screens } from './screens.js'; 
import { parseResponsiveValues } from './responsiveValues.js'; 

export function parseAspectRatio(value) {
  if (typeof value === 'number') return value;
  const [width = 1, height = 1] = value.split(/[:/]/).map(Number);
  return width / height;
}

export function createResponsiveRatios(value) {
  const parsed = parseResponsiveValues(String(value));
  const names = Object.keys(screens);
  const styles = {};
  const defaultRatio = parseAspectRatio(parsed.DEFAULT?.value);
  styles['--mx-ratio-DEFAULT'] = String(defaultRatio);

  let previous = defaultRatio;
  for (const name of names) {
    const ratio = parseAspectRatio(parsed[name]?.value || previous);
    styles[`--mx-ratio-${name}`] = String(ratio);
    previous = ratio;
  }

  return {
    styles,
    className: [
      'aspect-[var(--mx-ratio)]',
      '[--mx-ratio:var(--mx-ratio-DEFAULT)]',
      'sm:[--mx-ratio:var(--mx-ratio-sm)]',
      'md:[--mx-ratio:var(--mx-ratio-md)]',
      'lg:[--mx-ratio:var(--mx-ratio-lg)]',
      'xl:[--mx-ratio:var(--mx-ratio-xl)]',
      '2xl:[--mx-ratio:var(--mx-ratio-2xl)]'
    ]
  };
}
