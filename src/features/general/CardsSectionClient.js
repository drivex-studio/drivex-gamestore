
import { gsap, ScrollTrigger } from '../../vendor.js';
import { useIdleGSAP } from '../../hooks/useIdleGSAP.js'; 
import { easings } from '../../utils/easings.js'; 
import { initRollerNumber } from '../../utils/FlipIndicator.js'; 
import { initScrambleText } from '../../utils/ScrambleText.js';  
import { initSanityMedia } from '../../media/SanityMedia.js'; 

const VALID_CARD_THEMES = ['light', 'dark', 'brand'];
const EASE_POWER3_OUT = easings.power3Out;
const EASE_BACK_OUT = easings.backOut;
const HEADLINE_STYLE_MAP = {
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
  h6: 'text-h6',
};

function createRollerTriggerRef() {
  return { current: null };
}

function validateCardTheme(theme) {
  if (theme) return VALID_CARD_THEMES.includes(theme) ? theme : undefined;
}

function parseHeadlineNumber(text) {
  if (!text) return null;
  const match = text.trim().match(/^([€$£¥₹]?[+]?)(\d+)([MBKx%+]*)$/i);
  if (!match) return null;
  const [, prefix = '', numberStr = '', suffix = ''] = match;
  return { prefix, number: Number.parseInt(numberStr, 10), suffix };
}

function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}

export function initCardsSectionClient({ cards, fullHeight } = {}) {
  const cardEls = []; 
  const rollerTriggerRefs = cards.map(createRollerTriggerRef); 
  const scrambleRevealFns = []; 
  let hoveredIndex = null; 
  let isMobile = false; 

  const columnCount = Math.min(cards.length, 4);
  const GRID_COLS_MAP = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const containerEl = document.createElement('div');
  containerEl.className = `relative grid gap-16 ${GRID_COLS_MAP[columnCount]} ${fullHeight ? 'h-full' : ''}`;
  containerEl.addEventListener('mouseleave', () => {
    hoveredIndex = null;
  });

  const hoverDependentEls = []; 

  function applyHoverState() {
    for (const { index, dotEl, textWrapEl } of hoverDependentEls) {
      const isHovered = hoveredIndex === index;
      
      if (dotEl) {
        dotEl.dataset.motionAnimate = JSON.stringify({
          rotate: isHovered ? 0 : -90,
          scale: isHovered ? 1 : 0,
        });
        dotEl.dataset.motionTransition = JSON.stringify({ duration: 0.5, ease: 'backOut' });
        dotEl.hidden = isMobile;
      }
      if (textWrapEl) {
        textWrapEl.dataset.motionAnimate = JSON.stringify(isMobile ? {} : { x: isHovered ? 24 : 0 });
        textWrapEl.dataset.motionTransition = JSON.stringify({ duration: 0.5, ease: 'power3Out' });
      }
    }
  }

  cards.forEach((card, index) => {
    if (card._type === 'textCard' && card.headline?.text) {
      const cardEl = document.createElement('div');
      cardEls[index] = cardEl;
      const rollerTriggerRef = rollerTriggerRefs[index];
      
      if (rollerTriggerRef) rollerTriggerRef.current = cardEl;

      const themeAttr = validateCardTheme(card.cardTheme);
      if (themeAttr) cardEl.dataset.theme = themeAttr;
      cardEl.className =
        'flex min-h-[250px] cursor-default flex-col justify-between bg-background-muted p-16 lg:min-h-[450px] lg:p-32';
      cardEl.addEventListener('mouseenter', () => {
        hoveredIndex = index;
        applyHoverState();
        scrambleRevealFns[index]?.();
      });

      const headlineEl = document.createElement('span');
      headlineEl.className = `flex items-center font-light text-foreground ${
        HEADLINE_STYLE_MAP[card.headlineDisplay ?? 'h3']
      }`;
      const parsedNumber = parseHeadlineNumber(card.headline.text);
      if (parsedNumber) {
        headlineEl.appendChild(document.createTextNode(parsedNumber.prefix));
        
        const rollerNumber = initRollerNumber(null, {
          value: parsedNumber.number,
          minDigits: parsedNumber.number.toString().length,
          triggerMode: 'scroll',
          triggerElement: rollerTriggerRef.current,
          duration: 2,
          stagger: 0.1,
          suffix: parsedNumber.suffix,
        });
        if (rollerNumber?.el) headlineEl.appendChild(rollerNumber.el);
      } else {
        headlineEl.textContent = card.headline.text;
      }
      cardEl.appendChild(headlineEl);

      if (card.text) {
        if (card.plainText) {
          const p = document.createElement('p');
          p.className = 'text-body text-foreground-muted';
          p.textContent = card.text;
          cardEl.appendChild(p);
        } else {
          const textOuterEl = document.createElement('span');
          textOuterEl.className = 'relative flex items-center text-accent text-foreground';

          const dotEl = document.createElement('span');
          dotEl.className = 'absolute left-0 size-12 bg-brand';
          dotEl.setAttribute('aria-hidden', 'true');
          textOuterEl.appendChild(dotEl);

          const textWrapEl = document.createElement('span');

const scrambleText = initScrambleText(textWrapEl, {
duration: 0.5,
multiLine: true,
onReady: (fn) => {
  scrambleRevealFns[index] = fn;
},
children: card.text,
});

          if (scrambleText?.element) textWrapEl.appendChild(scrambleText.element);
          textOuterEl.appendChild(textWrapEl);

          cardEl.appendChild(textOuterEl);
          hoverDependentEls.push({ index, dotEl, textWrapEl });
        }
      }

      containerEl.appendChild(cardEl);
 } else if (card._type === 'mediaCard' && card.media) {
      const cardEl = document.createElement('div');
      cardEls[index] = cardEl;
      cardEl.className = 'min-h-[300px] overflow-hidden lg:min-h-[450px]';
const media = initSanityMedia(cardEl, {
  media: card.media,
  className: 'h-full w-full object-cover',
  imageProps: { alt: card.alt || '' },
  autoPlay: true,
  loop: true,
});
      if (media?.element) cardEl.appendChild(media.element);
      containerEl.appendChild(cardEl);
    }
    
  });

  applyHoverState();

  const updateIsMobile = () => {
    isMobile = window.matchMedia('(max-width: 1023px)').matches;
    applyHoverState();
  };
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);

  let scrollTriggerInstance = null;
  useIdleGSAP(
    () => {
      const revealTargets = cardEls.filter(Boolean);
      if (revealTargets.length !== 0) {
        gsap.fromTo(
          revealTargets,
          { yPercent: 25, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.1,
            scrollTrigger: { trigger: containerEl, start: 'top bottom', once: true },
            onComplete: refreshScrollTrigger,
          }
        );
      }
    },
    { scope: containerEl }
  );

  function destroy() {
    window.removeEventListener('resize', updateIsMobile);
    if (scrollTriggerInstance) scrollTriggerInstance.kill();
  }

  return { element: containerEl, destroy };
}
