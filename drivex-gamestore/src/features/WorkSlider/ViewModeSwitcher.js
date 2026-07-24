
import { cx } from '../../utils/cx.js';

function svgEl(attrs, pathsData) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.entries(attrs).forEach(([key, value]) => svg.setAttribute(key, value));
  pathsData.forEach(({ tag, attrs: elAttrs }) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(elAttrs).forEach(([key, value]) => el.setAttribute(key, value));
    svg.appendChild(el);
  });
  return svg;
}

const BASE_SVG_ATTRS = { width: '16', height: '16', viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' };
const STROKE = { stroke: 'currentColor', 'stroke-width': '1.5' };

function createSliderIcon() {
  return svgEl(BASE_SVG_ATTRS, [
    { tag: 'rect', attrs: { x: '1', y: '4', width: '6', height: '8', ...STROKE } },
    { tag: 'rect', attrs: { x: '9', y: '4', width: '6', height: '8', ...STROKE } },
  ]);
}
function createDuoIcon() {
  return svgEl(BASE_SVG_ATTRS, [
    { tag: 'rect', attrs: { x: '1', y: '1', width: '6', height: '14', ...STROKE } },
    { tag: 'rect', attrs: { x: '9', y: '1', width: '6', height: '14', ...STROKE } },
  ]);
}
function createGridIcon() {
  const coords = [
    [1, 1], [6, 1], [11, 1],
    [1, 6], [6, 6], [11, 6],
    [1, 11], [6, 11], [11, 11],
  ];
  return svgEl(BASE_SVG_ATTRS, coords.map(([x, y]) => ({ tag: 'rect', attrs: { x: String(x), y: String(y), width: '4', height: '4', ...STROKE } })));
}
function createListIcon() {
  return svgEl({ ...BASE_SVG_ATTRS, xmlns: 'http://www.w3.org/2000/svg' }, [
    { tag: 'line', attrs: { x1: '1', y1: '4', x2: '15', y2: '4', ...STROKE } },
    { tag: 'line', attrs: { x1: '1', y1: '8', x2: '15', y2: '8', ...STROKE } },
    { tag: 'line', attrs: { x1: '1', y1: '12', x2: '15', y2: '12', ...STROKE } },
  ]);
}

const VIEW_MODES = [
  { mode: 'slider', label: 'Slider view', createIcon: createSliderIcon },
  { mode: 'duo', label: 'Two column view', visibility: 'hidden md:flex', createIcon: createDuoIcon },
  { mode: 'grid', label: 'Grid view', createIcon: createGridIcon },
  { mode: 'list', label: 'List view', visibility: 'flex md:hidden', createIcon: createListIcon },
];

export function initViewModeSwitcher(parentEl, props = {}) {
  let { value, onChange, className } = props;

  const rootEl = document.createElement('div');
  rootEl.className = cx('flex items-center gap-4', className);
  rootEl.setAttribute('role', 'group');
  rootEl.setAttribute('aria-label', 'View mode');

  function render() {
    rootEl.innerHTML = '';
    VIEW_MODES.forEach(({ mode, label, visibility, createIcon }) => {
      const isActive = value === mode;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = cx(
        'size-32 cursor-pointer items-center justify-center transition-colors duration-400',
        isActive ? 'bg-brand text-black' : 'bg-surface/75 text-foreground hover:bg-surface',
        visibility ?? 'flex'
      );
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(isActive));
      button.addEventListener('click', () => onChange?.(mode));
      button.appendChild(createIcon());
      rootEl.appendChild(button);
    });
  }
  render();

  parentEl.appendChild(rootEl);

  function update(nextProps = {}) {
    if ('value' in nextProps) value = nextProps.value;
    if ('onChange' in nextProps) onChange = nextProps.onChange;
    if ('className' in nextProps) rootEl.className = cx('flex items-center gap-4', nextProps.className);
    render();
  }

  return { rootEl, update };
}
