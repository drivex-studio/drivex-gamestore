'use strict';

import { screens } from './screens.js'; 

function remToNumber(value) {
  return Number.parseFloat(value.replace('rem', ''));
}

export function parseResponsiveValues(value) {
  const result = {};
  const names = Object.keys(screens).join('|');
  const matcher = RegExp(`^(${names}):(.+)$`);

  for (const entry of value.split(/\s+/)) {
    const match = entry.match(matcher);
    if (match) {
      const [, key, val] = match;
      if (val && key) {
        result[key] = { value: val, resolvedWidth: screens[key] };
      }
    } else {
      result.DEFAULT = { value: entry };
    }
  }

  return Object.fromEntries(
    Object.entries(result).sort(([, { resolvedWidth: a }], [, { resolvedWidth: b }]) => {
      return a || b ? (a ? (b ? remToNumber(b) - remToNumber(a) : -1) : 1) : 0;
    })
  );
}
