import { initScrambleGroup } from '../../utils/ScrambleGroup.js'; 
import { initScrambleText } from '../../utils/ScrambleText.js'; 
import { initSanityRichText } from '../../components/ui/SanityRichText.js'; 
import { gsap, SplitText } from '../../vendor.js'; 
import { screens } from '../../config/screens.js';

export function watchBreakpoint(query, onChange) {
    const minWidth = screens[query] || query;
    const mq = window.matchMedia(`(min-width: ${minWidth})`);
    
    const handler = (e) => {
        if (onChange) onChange(e.matches);
    };
    
    mq.addEventListener('change', handler);
    
    return {
        get value() { return mq.matches; },
        destroy() { mq.removeEventListener('change', handler); }
    };
}

/* ---- AccordionItem ---- */
export function initAccordionItem(parentElement, props = {}) {
    const {
        headline,
        text,
        isOpen = false,
        onToggle,
        isDesktop,
        duration = 0.8,
        ease = "expo.inOut",
        enableStagger = false,
        staggerDuration = 0.6,
        staggerDelay = 0.15,
        staggerEase = "expo.out",
        className,
        ...restProps
    } = props;

    let currentIsOpen = isOpen;
    let currentIsDesktop = isDesktop;
    let prevIsOpen = currentIsOpen;

    const el = document.createElement('div');
    el.className = className ? `border-border border-b ${className}`.trim() : 'border-border border-b';

    Object.entries(restProps).forEach(([k, v]) => {
        if (typeof v !== 'function') el.setAttribute(k, v);
    });

    const button = document.createElement('button');
    button.type = 'button';
    el.appendChild(button);

    const titleSpan = document.createElement('span');
    titleSpan.className = "text-accent uppercase";
    button.appendChild(titleSpan);

    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('class', 'h-16 w-16 shrink-0');
    iconSvg.setAttribute('viewBox', '0 0 16 16');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.setAttribute('aria-hidden', 'true');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M8 1V15');
    path1.setAttribute('stroke', 'currentColor');
    path1.setAttribute('stroke-width', '1.5');
    path1.setAttribute('stroke-linecap', 'square');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M1 8H15');
    path2.setAttribute('stroke', 'currentColor');
    path2.setAttribute('stroke-width', '1.5');
    path2.setAttribute('stroke-linecap', 'square');

    iconSvg.appendChild(path1);
    iconSvg.appendChild(path2);
    button.appendChild(iconSvg);

    const contentWrapper = document.createElement('div');
    el.appendChild(contentWrapper);

    const innerContent = document.createElement('div');
    innerContent.className = "pb-24 text-body text-foreground-muted lg:max-w-2/3";
    contentWrapper.appendChild(innerContent);

    let scrambleTextInst = null;
    let scrambleTextReadyFn = null;
    const sanityRichTextInst = initSanityRichText(innerContent, { value: text });

    function updateButtonClass() {
        const baseClass = "group flex w-full cursor-pointer items-start justify-between gap-16 py-24 text-left transition-colors lg:items-center";
        const stateClass = currentIsOpen ? "text-foreground" : "text-foreground-muted hover:text-foreground";
        button.className = `${baseClass} ${stateClass}`;
        button.setAttribute('aria-expanded', currentIsOpen);
    }

    function renderTitle() {
        if (scrambleTextInst) {
            scrambleTextInst.destroy?.();
            scrambleTextInst = null;
        }
        titleSpan.innerHTML = '';

        if (currentIsDesktop) {
            scrambleTextInst = initScrambleText(titleSpan, {
                revealMode: true,
                multiLine: true,
                secondColorClass: "scramble-inherit",
                onReady: (fn) => { scrambleTextReadyFn = fn; },
                children: headline
            });
        } else {
            titleSpan.textContent = headline;
            scrambleTextReadyFn = null;
        }
    }

    let tl = null;
    let splitTextInst = null;
    let splitTextTween = null;

    function setupTimeline() {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(contentWrapper, { height: 0, overflow: "hidden", force3D: true });
            tl = gsap.timeline({ paused: true, defaults: { duration, ease } });
            tl.to(contentWrapper, { height: "auto", duration, ease }, 0);
            tl.to(iconSvg, { rotation: -180, duration, ease }, 0);
            tl.to(path1, { opacity: 0, duration: 0.5 * duration, ease: "power2.inOut" }, 0.25 * duration);
        }
    }

    function revertSplitText() {
        if (splitTextTween) {
            splitTextTween.kill();
            splitTextTween = null;
        }
        if (splitTextInst) {
            splitTextInst.revert();
            splitTextInst = null;
        }
    }

    function triggerSplitText() {
        if (!enableStagger) return;
        const elements = contentWrapper.querySelectorAll('p, span');
        if (elements.length) {
            elements.forEach(node => {
                if (node.querySelector('.split-line')) return;
                splitTextInst = new SplitText(node, { type: "lines", mask: "lines", linesClass: "split-line" });
                const lines = splitTextInst.lines;
                gsap.set(lines, { yPercent: 110, force3D: true });
                splitTextTween = gsap.to(lines, { yPercent: 0, duration: staggerDuration, stagger: staggerDelay, ease: staggerEase, force3D: true });
            });
        }
    }

    function applyToggle() {
        if (!tl || currentIsOpen === prevIsOpen) return;
        prevIsOpen = currentIsOpen;

        if (currentIsOpen) {
            tl.play();
            if (currentIsDesktop && scrambleTextReadyFn) {
                scrambleTextReadyFn();
            }
            if (enableStagger) {
                setTimeout(() => {
                    document.fonts.ready.then(() => triggerSplitText());
                }, 200);
            }
        } else {
            tl.reverse();
            revertSplitText();
        }
    }

    function handleClick(e) {
        if (onToggle) onToggle();
    }
    button.addEventListener('click', handleClick);

    updateButtonClass();
    renderTitle();
    setupTimeline();

    function setIsOpen(newIsOpen) {
        if (currentIsOpen === newIsOpen) return;
        currentIsOpen = newIsOpen;
        updateButtonClass();
        applyToggle();
    }

    function setIsDesktop(newIsDesktop) {
        if (currentIsDesktop === newIsDesktop) return;
        currentIsDesktop = newIsDesktop;
        renderTitle();
    }

    function destroy() {
        button.removeEventListener('click', handleClick);
        revertSplitText();
        if (tl) tl.kill();
        if (scrambleTextInst) scrambleTextInst.destroy?.();
        if (sanityRichTextInst) sanityRichTextInst.destroy?.();
        gsap.killTweensOf(contentWrapper);
        gsap.killTweensOf(iconSvg);
        gsap.killTweensOf(path1);
        el.remove();
    }

    if (parentElement) parentElement.appendChild(el);
    return { el, destroy, setIsOpen, setIsDesktop };
}


export function initAccordionClient(parentElement, props = {}) {
    const {
        className,
        items = [],
        allowMultiple = false,
        duration = 0.8,
        ease = "expo.inOut",
        enableStagger = true,
        ...restProps
    } = props;

    let openItems = new Set();
    const childInstances = new Map();

    const el = document.createElement('div');
    if (className) el.className = className;
    Object.entries(restProps).forEach(([k, v]) => {
        if (typeof v !== 'function') el.setAttribute(k, v);
    });

    const scrambleGroupInst = initScrambleGroup(el, {
        stagger: 0.08,
        start: "top 85%"
    });

    const groupTarget = scrambleGroupInst?.el || el;

    const innerDiv = document.createElement('div');
    innerDiv.className = "w-full";
    groupTarget.appendChild(innerDiv);

    const isDesktopWatcher = watchBreakpoint('lg', (matches) => {
        childInstances.forEach(inst => inst.setIsDesktop(matches));
    });

    function toggleItem(key) {
        if (openItems.has(key)) {
            openItems.delete(key);
        } else {
            if (!allowMultiple) openItems.clear();
            openItems.add(key);
        }
        
        childInstances.forEach((inst, childKey) => {
            inst.setIsOpen(openItems.has(childKey));
        });
    }

    items.forEach(item => {
        const itemInst = initAccordionItem(innerDiv, {
            headline: item.headline,
            text: item.text,
            isOpen: openItems.has(item._key),
            onToggle: () => toggleItem(item._key),
            isDesktop: isDesktopWatcher.value,
            duration,
            ease,
            enableStagger
        });
        childInstances.set(item._key, itemInst);
    });

    function destroy() {
        isDesktopWatcher.destroy();
        childInstances.forEach(inst => inst.destroy?.());
        childInstances.clear();
        scrambleGroupInst?.destroy?.();
        el.remove();
    }

    if (parentElement) parentElement.appendChild(el);
    return { el, destroy };
}
