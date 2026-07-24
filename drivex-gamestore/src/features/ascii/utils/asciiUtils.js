export const DEFAULT_CHARACTERS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export function proxySanityUrl(url) {
  return url.startsWith('https://cdn.sanity.io/')
    ? `/api/image-proxy?url=${encodeURIComponent(url)}`
    : url;
}

export function onTextureLoadError(err) {
  console.error('Failed to load texture:', err);
}

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

import { ASCII_ANIMATION_DURATION } from '../../shared.js';
export const ASCII_ANIMATION_DURATION_MS = 1000 * ASCII_ANIMATION_DURATION;

export async function computeContentBounds(imageSrc, origin = { x: 0.5, y: 0.5 }) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          console.warn('[ASCII] Could not get canvas context, using default bounds');
          resolve(1);
          return;
        }
        const scale = Math.min(200 / img.width, 200 / img.height, 1);
        const w = Math.floor(img.width * scale);
        const h = Math.floor(img.height * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        const cx = origin.x * w;
        const cy = (1 - origin.y) * h;
        const maxDist = Math.max(
          Math.hypot(cx, cy),
          Math.hypot(w - cx, cy),
          Math.hypot(cx, h - cy),
          Math.hypot(w - cx, h - cy)
        );

        let furthest = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            if (
              void 0 !== a && void 0 !== r && void 0 !== g && void 0 !== b &&
              a > 10 && (r > 15 || g > 15 || b > 15)
            ) {
              const d = Math.hypot(x - cx, y - cy);
              if (d > furthest) furthest = d;
            }
          }
        }
        const normalized = Math.min(furthest / maxDist * 1.05, 1);
        resolve(normalized);
      } catch (err) {
        console.warn('[ASCII] Error computing content bounds:', err);
        resolve(1);
      }
    };
    img.onerror = () => {
      console.warn('[ASCII] Could not load image for bounds computation');
      resolve(1);
    };
    img.src = proxySanityUrl(imageSrc);
  });
}
