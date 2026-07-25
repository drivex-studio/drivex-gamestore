import { gsap } from '../vendor.js';
import { usePathname } from '../hooks/usePathname.js';
import { useRouter } from '../hooks/useRouter.js';
import { initLink as Link } from './Link.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { usePageTransition } from '../hooks/usePageTransition.js';
import { useDualLayerScramble } from '../utils/FlipIndicator.js';
import { cx } from '../utils/cx.js';
import { easings } from '../utils/easings.js';
import { SanityLink } from '../media/SanityLink.js';
import { AnimatedLink } from './ui/AnimatedLink.js';
import { SanityImage } from '../media/SanityImage.js';

const backInOutEase = easings.backInOut;   
const power3InOutEase = easings.power3InOut; 

export function initMobileNavMenu(parentElement, props = {}) {
  let { navItems, flyout, onClose, isOpen, spotsRemaining } = props;

  const isLg = useBreakpoint('lg'); 
  const dotSize = isLg ? 32 : 20;   
  const dotTravel = isLg ? 64 : 36; 

  const gridRootRef = { current: null };      
  const timelineRef = { current: null };      
  const navElRef = { current: null };         
  const itemWrapperRefs = [];                 
  const itemLinkRefs = [];                    
  
  const itemMotionWrapRefs = [];              
  const revealRefs = [];                      
  const availabilityDotRef = { current: null }; 
  const spotsDotRef = { current: null };        
  const featuredColRef = { current: null };     

  const pathname = usePathname(); 
  const router = useRouter();     
  const { startTransition, isTransitioning } = usePageTransition(); 

  let hoveredIndex = null;      
  let highlightPosition = null; 
  let rotationCount = 0;        
  const lastHoveredIndexRef = { current: null }; 
  let hasRevealed = false;      

  const activeIndex = (() => { 
    if (!navItems) return null;
    const idx = navItems.findIndex((item) => !!item.link?.href && (pathname === item.link.href || pathname.startsWith(`${item.link.href}/`)));
    return idx >= 0 ? idx : null;
  })();

  function effectiveHighlightIndex() { 
    return hoveredIndex ?? (hasRevealed ? activeIndex : null);
  }

  let scrambleCenterCaption = null;   
  let scrambleFeaturedCaption = null; 
  let scrambleAvailability = null;    
  let scrambleSpots = null;           

  const contact = flyout?.contact;               
  const team = flyout?.team;                     
  const socials = flyout?.socials;                
  const location = flyout?.location;               
  const availability = flyout?.availability;         
  const centerImage = flyout?.centerImage;           
  const featuredProject = flyout?.featuredProject;   

  function updateHighlightPosition() {
    const targetIndex = effectiveHighlightIndex();
    if (targetIndex === null) {
      highlightPosition = null;
      renderHighlight();
      return;
    }
    requestAnimationFrame(() => {
      const itemEl = itemWrapperRefs[targetIndex];
      const navEl = navElRef.current;
      if (itemEl && navEl) {
        const navRect = navEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();
        highlightPosition = { y: itemRect.top - navRect.top + (itemRect.height - dotSize) / 2 };
        renderHighlight();
      }
    });
  }

  function setHoveredIndex(index) { 
    hoveredIndex = index;
    if (index !== null && lastHoveredIndexRef.current !== null && lastHoveredIndexRef.current !== index) {
      rotationCount += 1;
    }
    if (index !== null) lastHoveredIndexRef.current = index;
    updateHighlightPosition();
  }

  function clearHover() { 
    setHoveredIndex(null);
  }

  const gsapContext = gsap.context(() => {}, gridRootRef.current || undefined);

  function runOpenCloseTimeline() {
    if (!gridRootRef.current) return;
    if (timelineRef.current?.kill) timelineRef.current.kill();

    if (isOpen) {
      const linkEls = itemLinkRefs.filter(Boolean);
      const revealEls = revealRefs.filter(Boolean);
      if (linkEls.length > 0) gsap.set(linkEls, { yPercent: 110 });
      if (revealEls.length > 0) gsap.set(revealEls, { yPercent: 110 });

      timelineRef.current = gsap.timeline();
      gsap.set(gridRootRef.current, { clipPath: 'none', gridTemplateRows: '0fr' });
      timelineRef.current.to(gridRootRef.current, { gridTemplateRows: '1fr', duration: 1, ease: 'expo.inOut' });

      if (linkEls.length > 0) {
        timelineRef.current.to(linkEls, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, force3D: true }, '<+50%');
      }
      if (revealEls.length > 0) {
        timelineRef.current.to(revealEls, { yPercent: 0, duration: 0.5, ease: 'power2.out', stagger: 0.04, force3D: true }, '<+25%');
      }

      if (featuredColRef.current) {
        timelineRef.current.fromTo(featuredColRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' }, '<+25%');
      }
      timelineRef.current.add(() => {
        scrambleCenterCaption?.kill(); scrambleFeaturedCaption?.kill(); scrambleAvailability?.kill(); scrambleSpots?.kill();
        scrambleCenterCaption?.scramble(); scrambleFeaturedCaption?.scramble(); scrambleAvailability?.scramble(); scrambleSpots?.scramble();
      }, '<');
      if (availabilityDotRef.current) {
        timelineRef.current.to(availabilityDotRef.current, {
          opacity: 1, duration: 0.5, ease: 'power2.out',
          onComplete: () => { availabilityDotRef.current?.classList.add('animate-pulse'); },
        }, '<');
      }
      if (spotsDotRef.current) {
        timelineRef.current.to(spotsDotRef.current, {
          opacity: 1, duration: 0.5, ease: 'power2.out',
          onComplete: () => { spotsDotRef.current?.classList.add('animate-pulse'); },
        }, '<');
      }
      timelineRef.current.add(() => {
        hasRevealed = true;
        updateHighlightPosition();
      }, '<+50%');
    } else {
      timelineRef.current = gsap.timeline();
      gsap.set(gridRootRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      timelineRef.current.to(gridRootRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut',
        onComplete: () => {
          if (gridRootRef.current) gsap.set(gridRootRef.current, { gridTemplateRows: '0fr', clipPath: 'none' });
          if (availabilityDotRef.current) {
            gsap.set(availabilityDotRef.current, { opacity: 0 });
            availabilityDotRef.current.classList.remove('animate-pulse');
          }
          if (spotsDotRef.current) {
            gsap.set(spotsDotRef.current, { opacity: 0 });
            spotsDotRef.current.classList.remove('animate-pulse');
          }
          if (featuredColRef.current) gsap.set(featuredColRef.current, { opacity: 0 });
        },
      });
    }
  }

  const handleCenterImageHover = gsapContext.add(() => { scrambleCenterCaption?.scramble(); }); 
  const handleFeaturedProjectHover = gsapContext.add(() => { scrambleFeaturedCaption?.scramble(); }); 

  function runResetOnCloseEffect() {
    if (!isOpen) {
      hoveredIndex = null;
      highlightPosition = null;
      rotationCount = 0;
      hasRevealed = false;
      lastHoveredIndexRef.current = null;
      scrambleCenterCaption?.kill();
      scrambleFeaturedCaption?.kill();
      scrambleAvailability?.kill();
      scrambleSpots?.kill();
      renderHighlight();
    }
  }

  function handleNavClick(e, href) { 
    e.preventDefault();
    if (isTransitioning) return;
    onClose();
    setTimeout(() => {
      startTransition(() => {
        router.push(href, { scroll: true });
      });
    }, 150);
  }

  const outer = document.createElement('div');
  outer.className = 'grid-container';

  const gridRoot = document.createElement('div');
  gridRoot.className = 'grid bg-surface transition-colors duration-300';
  gridRoot.style.gridTemplateRows = '0fr';
  gridRootRef.current = gridRoot;
  outer.appendChild(gridRoot);

  const overflowWrap = document.createElement('div');
  overflowWrap.className = 'overflow-hidden';
  gridRoot.appendChild(overflowWrap);

  const paddedWrap = document.createElement('div');
  paddedWrap.className = 'p-24 lg:p-64';
  overflowWrap.appendChild(paddedWrap);

  const layoutGrid = document.createElement('div');
  layoutGrid.className = 'grid-layout gap-y-32';
  paddedWrap.appendChild(layoutGrid);

  const nav = document.createElement('nav');
  nav.className = 'grid-span-12 lg:grid-span-4 relative flex flex-col items-start gap-4';
  navElRef.current = nav;
  layoutGrid.appendChild(nav);

  const highlightBox = document.createElement('div');
  highlightBox.className = 'pointer-events-none absolute left-0 bg-brand';
  highlightBox.style.width = `${dotSize}px`;
  highlightBox.style.height = `${dotSize}px`;
  highlightBox.style.opacity = '0';
  highlightBox.style.transition = 'transform 600ms ease-out, opacity 150ms ease-out';
  nav.appendChild(highlightBox);

  function renderHighlight() {
    if (!highlightPosition) {
      highlightBox.style.opacity = '0';
      return;
    }

    highlightBox.style.transform = `translateY(${highlightPosition.y}px)`;
    highlightBox.style.opacity = '1';
    
    itemMotionWrapRefs.forEach((el, idx) => {
      if (!el) return;
      const isTarget = idx === effectiveHighlightIndex();
      gsap.to(el, { x: isTarget ? dotTravel : 0, duration: 0.6, ease: power3InOutEase });
    });
  }

  (navItems || []).forEach((item, index) => {
    if (!item.link) return;
    const isActive = index === activeIndex;
    const isHovered = index === hoveredIndex;

    const itemWrapper = document.createElement('div');
    itemWrapper.className = 'overflow-y-clip overflow-x-visible';
    itemWrapperRefs[index] = itemWrapper;

    const itemMotionWrap = document.createElement('div');
    itemMotionWrap.addEventListener('mouseenter', () => setHoveredIndex(index));
    itemMotionWrap.addEventListener('mouseleave', clearHover);
    itemMotionWrapRefs[index] = itemMotionWrap; 

    const link = SanityLink({
      link: item.link,
      className: cx('block py-4 text-h2 transition-colors duration-300', isActive || isHovered ? 'text-brand' : ''),
    });
    link.textContent = item.text;
    link.addEventListener('click', (e) => handleNavClick(e, item.link?.href ?? '/'));
    itemLinkRefs[index] = link;

    itemMotionWrap.appendChild(link);
    itemWrapper.appendChild(itemMotionWrap);
    nav.appendChild(itemWrapper);
  });

  const infoCol = document.createElement('div');
  infoCol.className = 'grid-span-12 lg:grid-span-2 lg:grid-start-5 flex flex-col gap-24';
  layoutGrid.appendChild(infoCol);

  let revealIndex = 0;
  function makeRevealLine(className, buildContent) {
    const overflow = document.createElement('div');
    overflow.className = 'overflow-hidden';
    const el = buildContent();
    revealRefs[revealIndex] = el;
    revealIndex += 1;
    overflow.appendChild(el);
    return overflow;
  }

  if (contact?.email || contact?.phone) {
    const contactWrap = document.createElement('div');
    contactWrap.className = 'flex flex-col gap-4';
    contactWrap.appendChild(makeRevealLine(null, () => {
      const p = document.createElement('p');
      p.className = 'text-accent text-foreground-muted transition-colors duration-300';
      p.textContent = 'Contact';
      return p;
    }));
    if (contact.email) {
      contactWrap.appendChild(makeRevealLine(null, () => {
        const a = AnimatedLink({ href: `mailto:${contact.email}`, className: 'block text-body-sm transition-colors duration-300 lg:text-body' });
        a.textContent = contact.email;
        return a;
      }));
    }
    if (contact.phone) {
      contactWrap.appendChild(makeRevealLine(null, () => {
        const a = AnimatedLink({ href: `tel:${contact.phone.replace(/\s/g, '')}`, className: 'block text-body-sm transition-colors duration-300 lg:text-body' });
        a.textContent = contact.phone;
        return a;
      }));
    }
    infoCol.appendChild(contactWrap);
  }

  if (team && team.length > 0) {
    const teamWrap = document.createElement('div');
    teamWrap.className = 'flex flex-col gap-4';
    team.forEach((member) => {
      teamWrap.appendChild(makeRevealLine(null, () => {
        const a = AnimatedLink({ href: `mailto:${member.email}`, className: 'block text-body-sm transition-colors duration-300 lg:text-body' });
        a.append(`${member.name}: `, member.email);
        return a;
      }));
    });
    infoCol.appendChild(teamWrap);
  }

  if (socials && socials.length > 0) {
    const socialsWrap = document.createElement('div');
    socialsWrap.className = 'flex flex-col gap-4';
    socials.forEach((social) => {
      socialsWrap.appendChild(makeRevealLine(null, () => {
        const a = AnimatedLink({ href: social.href ?? '#', target: '_blank', rel: 'noopener noreferrer', className: 'block text-body-sm transition-colors duration-300 lg:text-body' });
        a.append(`${social.name}: `, social.handle);
        return a;
      }));
    });
    infoCol.appendChild(socialsWrap);
  }

  if (location) {
    infoCol.appendChild(makeRevealLine(null, () => {
      const p = document.createElement('p');
      p.className = 'text-accent-sm text-foreground-muted transition-colors duration-300';
      p.textContent = location;
      return p;
    }));
  }

  const availabilitySpotsWrap = document.createElement('div');
  availabilitySpotsWrap.className = 'mt-auto flex flex-col gap-8';
  if (availability?.text) {
    const p = document.createElement('p');
    p.className = 'inline-flex items-start gap-8 text-accent-sm transition-colors duration-300';
    if (availability.isAvailable) {
      const dot = document.createElement('span');
      dot.className = 'mt-6 inline-block size-8 shrink-0 bg-brand opacity-0';
      availabilityDotRef.current = dot;
      p.appendChild(dot);
    }
    const textSpan = document.createElement('span');
    textSpan.className = 'opacity-0';
    textSpan.textContent = availability.text;
    scrambleAvailability = useDualLayerScramble(textSpan, { duration: 0.5 });
    p.appendChild(textSpan);
    availabilitySpotsWrap.appendChild(p);
  }
  if (spotsRemaining && spotsRemaining > 0) {
    const p = document.createElement('p');
    p.className = 'inline-flex items-start gap-8 text-accent-sm transition-colors duration-300';
    const dot = document.createElement('span');
    dot.className = 'mt-6 inline-block size-8 shrink-0 bg-brand opacity-0';
    spotsDotRef.current = dot;
    p.appendChild(dot);
    const textSpan = document.createElement('span');
    textSpan.className = 'opacity-0';
    textSpan.textContent = `Only ${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} left`;
    scrambleSpots = useDualLayerScramble(textSpan, { duration: 0.5 });
    p.appendChild(textSpan);
    availabilitySpotsWrap.appendChild(p);
  }
  infoCol.appendChild(availabilitySpotsWrap);

  const featuredCol = document.createElement('div');
  featuredCol.className = 'grid-span-5 grid-start-8 hidden gap-16 opacity-0 lg:flex';
  featuredColRef.current = featuredCol;
  layoutGrid.appendChild(featuredCol);

  const centerCol = document.createElement('div');
  centerCol.className = 'flex flex-1 flex-col gap-8';
  if (centerImage?.image) {
    let mediaEl;
    if (centerImage.link) {
      mediaEl = SanityLink({ link: centerImage.link, className: 'block flex-1 overflow-hidden' });
      mediaEl.addEventListener('click', (e) => handleNavClick(e, centerImage.link?.href ?? '/'));
      mediaEl.addEventListener('mouseenter', handleCenterImageHover);
      const img = document.createElement('div');
      SanityImage(img, { image: centerImage.image, className: 'zoom-in-image h-full w-full object-cover', alt: centerImage.image.altText ?? '' });
      mediaEl.appendChild(img.firstChild ?? img);
    } else {
      mediaEl = document.createElement('div');
      SanityImage(mediaEl, { image: centerImage.image, className: 'zoom-in-image h-full w-full object-cover', alt: centerImage.image.altText ?? '' });
    }
    centerCol.appendChild(mediaEl);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'h-full w-full bg-foreground/5';
    centerCol.appendChild(placeholder);
  }
  if (centerImage?.caption) {
    const caption = document.createElement('p');
    caption.className = 'text-accent-sm transition-colors duration-300';
    caption.textContent = centerImage.caption;
    scrambleCenterCaption = useDualLayerScramble(caption, { duration: 0.5 });
    centerCol.appendChild(caption);
  }
  featuredCol.appendChild(centerCol);

  const featuredProjectCol = document.createElement('div');
  featuredProjectCol.className = 'flex flex-1 flex-col gap-8';
  if (featuredProject?.project?.uri && featuredProject.project.image) {
    const a = document.createElement('a');
    a.href = featuredProject.project.uri;
    a.className = 'block flex-1 overflow-hidden transition-opacity duration-300 hover:opacity-80';
    a.addEventListener('click', (e) => handleNavClick(e, featuredProject.project?.uri ?? '/'));
    a.addEventListener('mouseenter', handleFeaturedProjectHover);
    const img = document.createElement('div');
    SanityImage(img, { image: featuredProject.project.image, className: 'zoom-in-image h-full w-full object-cover', alt: featuredProject.project.title ?? 'Featured Project' });
    a.appendChild(img.firstChild ?? img);
    featuredProjectCol.appendChild(a);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'h-full w-full bg-foreground/5';
    featuredProjectCol.appendChild(placeholder);
  }
  if (featuredProject?.caption) {
    const caption = document.createElement('p');
    caption.className = 'text-accent-sm transition-colors duration-300';
    caption.textContent = featuredProject.caption;
    scrambleFeaturedCaption = useDualLayerScramble(caption, { duration: 0.5 });
    featuredProjectCol.appendChild(caption);
  }
  featuredCol.appendChild(featuredProjectCol);

  parentElement.appendChild(outer);
  runOpenCloseTimeline();

  function setIsOpen(nextIsOpen) {
    isOpen = nextIsOpen;
    runOpenCloseTimeline();
    runResetOnCloseEffect();
  }

  function destroy() {
    timelineRef.current?.kill?.();
    gsapContext.revert();
  }

  return { element: outer, setIsOpen, destroy };
}
