import { cx } from '../utils/cx.js';

const STYLE = { fill: 'var(--color-foreground)', transition: 'fill 300ms ease-out' };

const PATHS = [
  "M212.88,248.5c-1.92-1.89-3.17-4.57-3.17-8.06V90.87c0-15.24,23.65-15.22,23.65,0v137.74h176.04V13c0-9.05-4.51-13-12.95-13H123.9C77.16,0,46.22,31.1,46.22,78.02l-.03,373.14c0,46.93,30.97,78.02,77.71,78.02h274.81c6.19,0,10.7-4.52,10.7-10.74V252.27H221.51c-3.85,0-6.72-1.51-8.63-3.77ZM233.34,311.59v113.56c0,15.24-23.65,15.22-23.65,0V311.59c0-15.24,23.65-15.22,23.65,0Z",
  "M718.71,0H510.92c-46.74,0-77.71,31.1-77.71,78.02v373.14c0,46.93,30.97,78.02,77.71,78.02h207.79c46.74,0,77.71-31.1,77.71-78.02V78.02C796.42,31.1,765.45,0,718.71,0ZM619.12,424.77c0,15.24-23.65,15.22-23.65,0V106.7c0-15.24,23.65-15.22,23.65,0v318.07Z",
  "M1183.34,78.02c0-46.93-30.97-78.02-77.71-78.02H897.84c-46.74,0-77.71,31.1-77.71,78.02v373.14c0,46.93,30.97,78.02,77.71,78.02h275.57c7.58,0,9.94-4.53,9.94-10.74V78.02ZM1012.47,425.67c0,15.24-23.65,15.22-23.65,0V105.34c0-15.24,23.65-15.22,23.65,0v320.33Z",
  "M1217.67,529.18h274.81c46.74,0,77.71-31.1,77.71-78.02V78.02c0-46.93-30.97-78.02-77.71-78.02h-274.81c-6.19,0-10.7,4.52-10.7,10.74v507.7c0,6.22,4.51,10.74,10.7,10.74ZM1368.17,105.34c0-15.24,23.65-15.22,23.65,0v320.1c0,15.24-23.65,15.22-23.65,0V105.34Z",
];

export function initLogoGood(parentElement, props = {}) {
  const { className, ...rest } = props;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1616.59 529.18');
  svg.setAttribute('aria-label', 'Good');
  svg.setAttribute('role', 'img');
  svg.setAttribute('class', cx('h-auto w-full', className));
  Object.assign(svg.style, STYLE);
  Object.entries(rest).forEach(([key, value]) => svg.setAttribute(key, value));

  PATHS.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });

  parentElement.appendChild(svg);
  return svg;
}
