// Auto-split from app.js
import { subscribeBreakpoint } from '../hooks/subscribeBreakpoint.js';
import { watchPathname, watchRouter } from '../hooks/watchRouter.js';
import { watchPathname, watchRouter } from '../hooks/watchRouter.js';
import { subscribePageTransition } from '../hooks/subscribePageTransition.js';
import { subscribeDualLayerScramble } from '../hooks/subscribeDualLayerScramble.js';
import gsap from 'gsap';
import { easings } from '../utils/easings.js';
import { SanityLink } from '../components/SanityLink.js';
import { cx } from '../utils/cx.js';
import { AnimatedLink } from '../components/AnimatedLink.js';
import { SanityImage } from '../components/SanityImage.js';

// ---- HeaderFlyout ----
export class HeaderFlyout {
  constructor(parentElement, props = {}) {
    // -- Props --
    const { navItems, flyout, onClose, isOpen = false, spotsRemaining, ...restProps } = props;
    this.navItems = navItems;
    this.flyout = flyout;
    this.onClose = onClose;
    this.isOpen = isOpen;
    this.spotsRemaining = spotsRemaining;

    // -- Hook-derived state --
    this.isLg = subscribeBreakpoint('lg');                          // originally: useBreakpoint("lg")
    this.pathname = watchPathname();                                 // originally: usePathname()
    this.router = watchRouter();                                     // originally: useRouter()
    this.pageTransition = subscribePageTransition();                 // originally: usePageTransition()

    // -- Component State --
    this.hoveredIndex = null;                                        // originally: const [z, O] = useState(null)
    this.indicatorPos = null;                                        // originally: const [D, B] = useState(null)
    this.rotationCount = 0;                                          // originally: const [q, H] = useState(0)
    this.isNavReady = false;                                         // originally: const [$, G] = useState(false)

    // -- Scramble Effects --
    this.scrambleCaption1 = subscribeDualLayerScramble({ duration: 0.5 });
    this.scrambleCaption2 = subscribeDualLayerScramble({ duration: 0.5 });
    this.scrambleAvailability = subscribeDualLayerScramble({ duration: 0.5 });
    this.scrambleSpots = subscribeDualLayerScramble({ duration: 0.5 });

    // -- Refs (kept as { current } objects per Section 3b rule) --
    this.containerRef = { current: null };                           // originally: m = useRef(null)
    this.navRef = { current: null };                                 // originally: R = useRef(null)
    this.navItemWrapperRefs = { current: [] };                       // originally: C = useRef([])
    this.navLinkRefs = { current: [] };                              // originally: L = useRef([])
    this.infoItemRefs = { current: [] };                             // originally: P = useRef([])
    this.availDotRef = { current: null };                            // originally: E = useRef(null)
    this.spotsDotRef = { current: null };                            // originally: _ = useRef(null)
    this.previewColRef = { current: null };                          // originally: T = useRef(null)
    this.lastHoveredIndexRef = { current: null };                    // originally: Y = useRef(null)
    this.timelineRef = { current: null };                            // originally: y = useRef(null)

    // -- Child instances --
    this.childInstances = [];

    // -- Constants --
    this.indicatorSize = this.isLg ? 32 : 20;
    this.indicatorIndent = this.isLg ? 64 : 36;

    // -- Active nav matching --
    this.activeNavIndex = this.calculateActiveIndex();

    // -- DOM Root Setup --
    this.el = document.createElement('div');
    this.el.className = 'grid-container';

    Object.entries(restProps).forEach(([k, v]) => {
      if (typeof v !== 'function') this.el.setAttribute(k, v);
    });

    this.buildDOM();
    this.updateAnimation(this.isOpen);

    if (parentElement) {
      parentElement.appendChild(this.el);
    }
  }

  calculateActiveIndex() {
    if (!this.navItems) return null;
    const idx = this.navItems.findIndex(item => 
      !!item.link?.href && (this.pathname === item.link.href || this.pathname.startsWith(`${item.link.href}/`))
    );
    return idx >= 0 ? idx : null;
  }

  getActiveKeyIndex() {
    return this.hoveredIndex ?? (this.isNavReady ? this.activeNavIndex : null);
  }

  // Handle indicator positioning frame
  updateIndicatorPosition() {
    const keyIndex = this.getActiveKeyIndex();
    if (keyIndex === null) {
      this.indicatorPos = null;
      if (this.indicatorEl) {
        gsap.to(this.indicatorEl, { opacity: 0, duration: 0.15 });
      }
      return;
    }

    requestAnimationFrame(() => {
      const itemEl = this.navItemWrapperRefs.current[keyIndex];
      const navEl = this.navRef.current;
      if (itemEl && navEl) {
        const navRect = navEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();
        this.indicatorPos = {
          y: itemRect.top - navRect.top + (itemRect.height - this.indicatorSize) / 2
        };

        if (this.indicatorEl) {
          gsap.to(this.indicatorEl, { x: 0, duration: 0.6, ease: easings.power3InOut });
          gsap.to(this.indicatorEl, {
            y: this.indicatorPos.y,
            rotate: 90 * this.rotationCount,
            duration: 0.6,
            ease: easings.backInOut
          });
          gsap.to(this.indicatorEl, { opacity: 1, duration: 0.15 });
        }
      }
    });
  }

  handleNavItemClick = (e, href) => {
    e.preventDefault();
    if (!this.pageTransition?.isTransitioning) {
      if (this.onClose) this.onClose();
      setTimeout(() => {
        if (this.pageTransition?.startTransition) {
          this.pageTransition.startTransition(() => {
            if (this.router?.push) {
              this.router.push(href, { scroll: true });
            }
          });
        }
      }, 150);
    }
  };

  buildDOM() {
    // Grid surface wrapper
    const gridEl = document.createElement('div');
    gridEl.className = 'grid bg-surface transition-colors duration-300';
    gridEl.style.gridTemplateRows = '0fr';
    this.containerRef.current = gridEl;

    const overflowEl = document.createElement('div');
    overflowEl.className = 'overflow-hidden';

    const paddingEl = document.createElement('div');
    paddingEl.className = 'p-24 lg:p-64';

    const layoutEl = document.createElement('div');
    layoutEl.className = 'grid-layout gap-y-32';

    // 1. Navigation Column
    const navEl = document.createElement('nav');
    navEl.className = 'grid-span-12 lg:grid-span-4 relative flex flex-col items-start gap-4';
    this.navRef.current = navEl;

    // Indicator Box (Framer motion replacement with GSAP)
    this.indicatorEl = document.createElement('div');
    this.indicatorEl.className = 'pointer-events-none absolute left-0 bg-brand opacity-0';
    this.indicatorEl.style.width = `${this.indicatorSize}px`;
    this.indicatorEl.style.height = `${this.indicatorSize}px`;
    navEl.appendChild(this.indicatorEl);

    if (this.navItems && Array.isArray(this.navItems)) {
      this.navItems.forEach((item, r) => {
        if (!item.link) return;
        const isCurrent = (r === this.activeNavIndex);
        const isHovered = (r === this.hoveredIndex);

        const wrapperEl = document.createElement('div');
        wrapperEl.className = 'overflow-y-clip overflow-x-visible';
        this.navItemWrapperRefs.current[r] = wrapperEl;

        const motionWrapperEl = document.createElement('div');
        motionWrapperEl.className = 'transition-transform duration-500';

        motionWrapperEl.addEventListener('mouseenter', () => {
          if (this.lastHoveredIndexRef.current !== null && this.lastHoveredIndexRef.current !== r) {
            this.rotationCount++;
          }
          this.lastHoveredIndexRef.current = r;
          this.hoveredIndex = r;
          this.updateIndicatorPosition();
        });

        motionWrapperEl.addEventListener('mouseleave', () => {
          this.hoveredIndex = null;
          this.updateIndicatorPosition();
        });

        const sanityLink = new SanityLink(motionWrapperEl, {
          link: item.link,
          onClick: (t) => this.handleNavItemClick(t, item.link?.href ?? '/'),
          className: cx('block py-4 text-h2 transition-colors duration-300', (isCurrent || isHovered) ? 'text-brand' : ''),
          children: item.text
        });
        this.navLinkRefs.current[r] = sanityLink.el;
        this.childInstances.push(sanityLink);

        wrapperEl.appendChild(motionWrapperEl);
        navEl.appendChild(wrapperEl);
      });
    }

    layoutEl.appendChild(navEl);

    // 2. Middle Contact/Team/Socials/Info Column
    const midColEl = document.createElement('div');
    midColEl.className = 'grid-span-12 lg:grid-span-2 lg:grid-start-5 flex flex-col gap-24';

    const contact = this.flyout?.contact;
    const team = this.flyout?.team;
    const socials = this.flyout?.socials;
    const location = this.flyout?.location;
    const availability = this.flyout?.availability;

    // Contact
    if (contact?.email || contact?.phone) {
      const contactGroup = document.createElement('div');
      contactGroup.className = 'flex flex-col gap-4';

      const labelWrap = document.createElement('div');
      labelWrap.className = 'overflow-hidden';
      const labelP = document.createElement('p');
      labelP.className = 'text-accent text-foreground-muted transition-colors duration-300';
      labelP.textContent = 'Contact';
      this.infoItemRefs.current[0] = labelP;
      labelWrap.appendChild(labelP);
      contactGroup.appendChild(labelWrap);

      if (contact.email) {
        const emailWrap = document.createElement('div');
        emailWrap.className = 'overflow-hidden';
        const animatedLink = new AnimatedLink(emailWrap, {
          href: `mailto:${contact.email}`,
          className: 'block text-body-sm transition-colors duration-300 lg:text-body',
          children: contact.email
        });
        this.infoItemRefs.current[1] = animatedLink.el;
        this.childInstances.push(animatedLink);
        contactGroup.appendChild(emailWrap);
      }

      if (contact.phone) {
        const phoneWrap = document.createElement('div');
        phoneWrap.className = 'overflow-hidden';
        const animatedLink = new AnimatedLink(phoneWrap, {
          href: `tel:${contact.phone.replace(/\s/g, '')}`,
          className: 'block text-body-sm transition-colors duration-300 lg:text-body',
          children: contact.phone
        });
        this.infoItemRefs.current[2] = animatedLink.el;
        this.childInstances.push(animatedLink);
        contactGroup.appendChild(phoneWrap);
      }

      midColEl.appendChild(contactGroup);
    }

    // Team
    if (team && team.length > 0) {
      const teamGroup = document.createElement('div');
      teamGroup.className = 'flex flex-col gap-4';

      team.forEach((member, r) => {
        const wrap = document.createElement('div');
        wrap.className = 'overflow-hidden';
        const animatedLink = new AnimatedLink(wrap, {
          href: `mailto:${member.email}`,
          className: 'block text-body-sm transition-colors duration-300 lg:text-body',
          children: `${member.name}: ${member.email}`
        });
        this.infoItemRefs.current[3 + r] = animatedLink.el;
        this.childInstances.push(animatedLink);
        teamGroup.appendChild(wrap);
      });

      midColEl.appendChild(teamGroup);
    }

    // Socials
    if (socials && socials.length > 0) {
      const socialsGroup = document.createElement('div');
      socialsGroup.className = 'flex flex-col gap-4';
      const teamOffset = team?.length ?? 0;

      socials.forEach((social, r) => {
        const wrap = document.createElement('div');
        wrap.className = 'overflow-hidden';
        const animatedLink = new AnimatedLink(wrap, {
          href: social.href ?? '#',
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'block text-body-sm transition-colors duration-300 lg:text-body',
          children: `${social.name}: ${social.handle}`
        });
        this.infoItemRefs.current[3 + teamOffset + r] = animatedLink.el;
        this.childInstances.push(animatedLink);
        socialsGroup.appendChild(wrap);
      });

      midColEl.appendChild(socialsGroup);
    }

    // Location
    if (location) {
      const locWrap = document.createElement('div');
      locWrap.className = 'overflow-hidden';
      const locP = document.createElement('p');
      locP.className = 'text-accent-sm text-foreground-muted transition-colors duration-300';
      locP.textContent = location;
      const teamOffset = team?.length ?? 0;
      const socialsOffset = socials?.length ?? 0;
      this.infoItemRefs.current[3 + teamOffset + socialsOffset] = locP;
      locWrap.appendChild(locP);
      midColEl.appendChild(locWrap);
    }

    // Availability & Spots Remaining
    const bottomGroup = document.createElement('div');
    bottomGroup.className = 'mt-auto flex flex-col gap-8';

    if (availability?.text) {
      const availP = document.createElement('p');
      availP.className = 'inline-flex items-start gap-8 text-accent-sm transition-colors duration-300';

      if (availability.isAvailable) {
        const dotSpan = document.createElement('span');
        dotSpan.className = 'mt-6 inline-block size-8 shrink-0 bg-brand opacity-0';
        this.availDotRef.current = dotSpan;
        availP.appendChild(dotSpan);
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'opacity-0';
      textSpan.textContent = availability.text;
      this.scrambleAvailability.ref = textSpan;
      availP.appendChild(textSpan);

      bottomGroup.appendChild(availP);
    }

    if (this.spotsRemaining && this.spotsRemaining > 0) {
      const spotsP = document.createElement('p');
      spotsP.className = 'inline-flex items-start gap-8 text-accent-sm transition-colors duration-300';

      const dotSpan = document.createElement('span');
      dotSpan.className = 'mt-6 inline-block size-8 shrink-0 bg-brand opacity-0';
      this.spotsDotRef.current = dotSpan;
      spotsP.appendChild(dotSpan);

      const textSpan = document.createElement('span');
      textSpan.className = 'opacity-0';
      textSpan.textContent = `Only ${this.spotsRemaining} spot${this.spotsRemaining === 1 ? '' : 's'} left`;
      this.scrambleSpots.ref = textSpan;
      spotsP.appendChild(textSpan);

      bottomGroup.appendChild(spotsP);
    }

    midColEl.appendChild(bottomGroup);
    layoutEl.appendChild(midColEl);

    // 3. Right Preview Column
    const centerImage = this.flyout?.centerImage;
    const featuredProject = this.flyout?.featuredProject;

    const previewCol = document.createElement('div');
    previewCol.className = 'grid-span-5 grid-start-8 hidden gap-16 opacity-0 lg:flex';
    this.previewColRef.current = previewCol;

    // Center Image Block
    const centerBlock = document.createElement('div');
    centerBlock.className = 'flex flex-1 flex-col gap-8';

    if (centerImage?.image) {
      if (centerImage.link) {
        const link = new SanityLink(centerBlock, {
          link: centerImage.link,
          onClick: (e) => this.handleNavItemClick(e, centerImage.link?.href ?? '/'),
          className: 'block flex-1 overflow-hidden',
          children: (parent) => {
            new SanityImage(parent, {
              image: centerImage.image,
              className: 'zoom-in-image h-full w-full object-cover',
              alt: centerImage.image.altText ?? ''
            });
          }
        });
        link.el.addEventListener('mouseenter', () => this.scrambleCaption1.scramble());
        this.childInstances.push(link);
      } else {
        const img = new SanityImage(centerBlock, {
          image: centerImage.image,
          className: 'zoom-in-image h-full w-full object-cover',
          alt: centerImage.image.altText ?? ''
        });
        this.childInstances.push(img);
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'h-full w-full bg-foreground/5';
      centerBlock.appendChild(placeholder);
    }

    if (centerImage?.caption) {
      const capP = document.createElement('p');
      capP.className = 'text-accent-sm transition-colors duration-300';
      capP.textContent = centerImage.caption;
      this.scrambleCaption1.ref = capP;
      centerBlock.appendChild(capP);
    }

    previewCol.appendChild(centerBlock);

    // Featured Project Block
    const featuredBlock = document.createElement('div');
    featuredBlock.className = 'flex flex-1 flex-col gap-8';

    if (featuredProject?.project?.uri && featuredProject.project.image) {
      const projLink = document.createElement('a');
      projLink.href = featuredProject.project.uri;
      projLink.className = 'block flex-1 overflow-hidden transition-opacity duration-300 hover:opacity-80';
      projLink.addEventListener('click', (e) => this.handleNavItemClick(e, featuredProject.project?.uri ?? '/'));
      projLink.addEventListener('mouseenter', () => this.scrambleCaption2.scramble());

      const img = new SanityImage(projLink, {
        image: featuredProject.project.image,
        className: 'zoom-in-image h-full w-full object-cover',
        alt: featuredProject.project.title ?? 'Featured Project'
      });
      this.childInstances.push(img);
      featuredBlock.appendChild(projLink);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'h-full w-full bg-foreground/5';
      featuredBlock.appendChild(placeholder);
    }

    if (featuredProject?.caption) {
      const capP = document.createElement('p');
      capP.className = 'text-accent-sm transition-colors duration-300';
      capP.textContent = featuredProject.caption;
      this.scrambleCaption2.ref = capP;
      featuredBlock.appendChild(capP);
    }

    previewCol.appendChild(featuredBlock);
    layoutEl.appendChild(previewCol);

    paddingEl.appendChild(layoutEl);
    overflowEl.appendChild(paddingEl);
    gridEl.appendChild(overflowEl);
    this.el.appendChild(gridEl);
  }

  updateAnimation(isOpen) {
    this.isOpen = isOpen;
    if (!this.containerRef.current) return;

    if (this.timelineRef.current) {
      this.timelineRef.current.kill();
    }

    if (!isOpen) {
      this.hoveredIndex = null;
      this.indicatorPos = null;
      this.rotationCount = 0;
      this.isNavReady = false;
      this.lastHoveredIndexRef.current = null;

      this.scrambleCaption1.kill();
      this.scrambleCaption2.kill();
      this.scrambleAvailability.kill();
      this.scrambleSpots.kill();

      const tl = gsap.timeline();
      this.timelineRef.current = tl;

      gsap.set(this.containerRef.current, { clipPath: 'inset(0% 0% 0% 0%)' });
      tl.to(this.containerRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.6,
        ease: 'expo.inOut',
        onComplete: () => {
          if (this.containerRef.current) {
            gsap.set(this.containerRef.current, { gridTemplateRows: '0fr', clipPath: 'none' });
          }
          if (this.availDotRef.current) {
            gsap.set(this.availDotRef.current, { opacity: 0 });
            this.availDotRef.current.classList.remove('animate-pulse');
          }
          if (this.spotsDotRef.current) {
            gsap.set(this.spotsDotRef.current, { opacity: 0 });
            this.spotsDotRef.current.classList.remove('animate-pulse');
          }
          if (this.previewColRef.current) {
            gsap.set(this.previewColRef.current, { opacity: 0 });
          }
        }
      });
    } else {
      const tl = gsap.timeline();
      this.timelineRef.current = tl;

      gsap.set(this.containerRef.current, { clipPath: 'none', gridTemplateRows: '0fr' });
      tl.to(this.containerRef.current, {
        gridTemplateRows: '1fr',
        duration: 1,
        ease: 'expo.inOut'
      });

      const navLinks = this.navLinkRefs.current.filter(Boolean);
      if (navLinks.length > 0) {
        tl.fromTo(navLinks, { yPercent: 110 }, {
          yPercent: 0,
          duration: 1.4,
          ease: 'expo.out',
          stagger: 0.1,
          force3D: true
        }, '<+50%');
      }

      const infoItems = this.infoItemRefs.current.filter(Boolean);
      if (infoItems.length > 0) {
        tl.fromTo(infoItems, { yPercent: 110 }, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.04,
          force3D: true
        }, '<+25%');
      }

      if (this.previewColRef.current) {
        tl.fromTo(this.previewColRef.current, { opacity: 0 }, {
          opacity: 1,
          duration: 1,
          ease: 'power1.out'
        }, '<+25%');
      }

      tl.add(() => {
        this.scrambleCaption1.kill();
        this.scrambleCaption2.kill();
        this.scrambleAvailability.kill();
        this.scrambleSpots.kill();

        this.scrambleCaption1.scramble();
        this.scrambleCaption2.scramble();
        this.scrambleAvailability.scramble();
        this.scrambleSpots.scramble();
      }, '<');

      if (this.availDotRef.current) {
        tl.to(this.availDotRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            this.availDotRef.current?.classList.add('animate-pulse');
          }
        }, '<');
      }

      if (this.spotsDotRef.current) {
        tl.to(this.spotsDotRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            this.spotsDotRef.current?.classList.add('animate-pulse');
          }
        }, '<');
      }

      tl.add(() => {
        this.isNavReady = true;
        this.updateIndicatorPosition();
      }, '<+50%');
    }
  }

  destroy() {
    if (this.timelineRef.current) {
      this.timelineRef.current.kill();
    }
    this.scrambleCaption1.kill();
    this.scrambleCaption2.kill();
    this.scrambleAvailability.kill();
    this.scrambleSpots.kill();

    this.childInstances.forEach(inst => inst?.destroy?.());
    if (this.containerRef.current) {
      gsap.killTweensOf(this.containerRef.current);
    }
    this.el.remove();
  }
}

export { HeaderFlyout };
