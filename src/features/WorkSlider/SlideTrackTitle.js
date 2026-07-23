
import { initScrambleText } from '../../utils/ScrambleText.js';

export function createSlideTrackTitle(title, onRegisterScramble) {
  const titleEl = document.createElement('h3');
  titleEl.className = 'text-accent';
  
  initScrambleText(titleEl, {
    duration: 0.5,
    text: title,
    onReady: (trigger) => onRegisterScramble(trigger),
  });
  return titleEl;
}
