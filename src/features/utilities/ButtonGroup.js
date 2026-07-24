
import { initSanityButton } from './SanityButton.js';
import { cx } from '../../utils/cx.js'; 

const LAYOUT_CLASS_MAP = {
  horizontal: 'flex-row flex-wrap items-center',
  vertical: 'flex-col',
};
const GAP_CLASS_MAP = { 0: 'gap-0', 4: 'gap-4', 8: 'gap-8', 16: 'gap-16', 24: 'gap-24', 32: 'gap-32' };

export function initButtonGroup({ buttonGroup, className } = {}) {
  if (!buttonGroup.buttons || buttonGroup.buttons.length === 0) return null;

  const layoutClass = LAYOUT_CLASS_MAP[buttonGroup.layout];
  const gapClass = GAP_CLASS_MAP[buttonGroup.gap];

  const containerEl = document.createElement('div');
  containerEl.className = cx('flex items-start', layoutClass, gapClass, className);

  buttonGroup.buttons.forEach((button) => {
    const buttonEl = initSanityButton({ button });
    if (buttonEl) containerEl.appendChild(buttonEl);
  });

  return containerEl;
}
