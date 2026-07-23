import { gsap, ScrollTrigger, ScrambleTextPlugin } from '../vendor.js';
import { SplitText } from 'gsap/SplitText';
import { easings } from './easings.js';

export function useDualLayerScramble(el, options = {}) {
    const DEFAULT_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    
    let originalText = "";
    let originalHtml = "";
    let parentDimensions = null;
    let lineData = [];
    let spanElements = [];
    let isAnimating = false;
    let isPrepared = false;
    let timelineInstance = null;

    function initMeasurements() {
        if (!el) return;
        const text = el.innerText ?? "";
        if (text.trim().length > 0) {
            originalText = text;
            originalHtml = el.innerHTML;
            parentDimensions = { 
            width: el.offsetWidth, 
            height: el.offsetHeight 
            };
        }
    }
    
    initMeasurements();

    function kill() {
        if (timelineInstance) {
            timelineInstance.kill();
            timelineInstance = null;
        }
        isAnimating = false;
    }

    function prepare() {
        if (!el || isPrepared) return;
        const currentText = originalText || el.innerText || "";
        if (currentText.trim().length === 0) return;
        
        if (!parentDimensions) {
            parentDimensions = { width: el.offsetWidth, height: el.offsetHeight };
        }

        function extractLines(targetEl) {
            const textContent = targetEl.innerText || "";
            if (textContent.trim().length === 0) return [];
            if (textContent.includes("\n")) return textContent.split("\n").filter(t => t.length > 0);
            
            const firstChild = targetEl.firstChild;
            if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) return [textContent];
            
            const range = document.createRange();
            const lines = [];
            let currentLine = "";
            let lastTop = null;
            const length = firstChild.length;
            
            for (let i = 0; i < textContent.length && i < length; i++) {
                range.setStart(firstChild, i);
                range.setEnd(firstChild, i + 1);
                const rect = range.getBoundingClientRect();
                
                if (lastTop !== null && Math.abs(rect.top - lastTop) > 2) {
                    if (currentLine.length > 0) lines.push(currentLine);
                    currentLine = "";
                }
                currentLine += textContent[i];
                lastTop = rect.top;
            }
            if (currentLine.length > 0) lines.push(currentLine);
            return lines.length > 0 ? lines : [textContent];
        }

        const lines = extractLines(el);
        const measurementDiv = document.createElement("div");
        measurementDiv.style.cssText = `
            position: absolute;
            visibility: hidden;
            pointer-events: none;
            white-space: nowrap;
        `;
        const computedStyle = window.getComputedStyle(el);
        measurementDiv.style.font = computedStyle.font;
        measurementDiv.style.fontSize = computedStyle.fontSize;
        measurementDiv.style.fontFamily = computedStyle.fontFamily;
        measurementDiv.style.fontWeight = computedStyle.fontWeight;
        measurementDiv.style.letterSpacing = computedStyle.letterSpacing;
        measurementDiv.style.textTransform = computedStyle.textTransform;
        
        document.body.appendChild(measurementDiv);
        
        lineData = lines.map(text => {
            measurementDiv.textContent = text;
            return {
                text: text,
                width: measurementDiv.offsetWidth,
                height: measurementDiv.offsetHeight
            };
        });
        
        document.body.removeChild(measurementDiv);
        
        const maxWidth = Math.max(...lineData.map(ld => ld.width));
        const totalHeight = lineData.reduce((acc, ld) => acc + ld.height, 0);
        
        const finalWidth = Math.max(parentDimensions?.width ?? 0, maxWidth);
        const finalHeight = Math.max(parentDimensions?.height ?? 0, totalHeight);
        
        isPrepared = true;
        
        gsap.set(el, {
            width: finalWidth,
            height: finalHeight,
            display: "inline-block",
            overflow: "hidden"
        });
        
        el.innerHTML = "";
        spanElements = [];
        
        lineData.forEach(ld => {
            const span = document.createElement("span");
            span.style.cssText = `
                display: block;
                opacity: 0;
                width: ${ld.width}px;
                height: ${ld.height}px;
                overflow: hidden;
                white-space: nowrap;
            `;
            span.innerText = ld.text;
            el.appendChild(span);
            spanElements.push(span);
        });
        
        gsap.set(el, { opacity: 1 });
    }

    function scramble(runOptions = {}) {
        if (!el) return null;
        if (isAnimating) return timelineInstance;
        
        prepare();
        
        const config = { ...options, ...runOptions };
        const duration = config.duration ?? 1;
        const speed = config.speed ?? 1;
        const chars = config.chars ?? DEFAULT_CHARS;
        const firstColorClass = config.firstColorClass ?? "scramble-brand";
        const secondColorClass = config.secondColorClass ?? "scramble-foreground";
        const stagger = config.stagger ?? 0.08;
        
        if (lineData.length === 0 || spanElements.length === 0) return null;
        
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            spanElements.forEach((span, i) => {
                const ld = lineData[i];
                if (ld) span.innerText = ld.text;
                span.style.opacity = "1";
                span.className = span.className.replace(/\bscramble-\w+\b/g, "");
            });
            config.onComplete?.();
            return null;
        }
        
        kill();
        isAnimating = true;
        timelineInstance = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
                timelineInstance = null;
                config.onComplete?.();
            }
        });
        
        function getRandomString(str, charSet = DEFAULT_CHARS) {
            let res = "";
            for (let i = 0; i < str.length; i++) {
                let char = str[i];
                if (char === " ") {
                    res += char;
                } else {
                    res += charSet[Math.floor(Math.random() * charSet.length)];
                }
            }
            return res;
        }

        spanElements.forEach((span, i) => {
            const ld = lineData[i];
            if (!ld) return;
            
            const text = ld.text;
            const delay = i * stagger;
            const randomText = getRandomString(text, chars);
            
            const nonSpaceCount = text.replace(/\s/g, "").length;
            const hiddenPlaceholder = text.replace(/[^\s]/g, " ");
            
            timelineInstance.add(() => {
                gsap.set(span, { opacity: 1 });
                span.innerText = hiddenPlaceholder;
            }, delay);
            
            timelineInstance.to(span, {
                duration: duration,
                scrambleText: {
                    text: randomText,
                    chars: chars,
                    speed: speed,
                    revealDelay: 0.1,
                    oldClass: firstColorClass,
                    newClass: firstColorClass
                },
                ease: "none"
            }, delay);
            
            timelineInstance.to(span, {
                duration: duration,
                scrambleText: {
                    text: text,
                    chars: chars,
                    speed: speed,
                    revealDelay: 0.1,
                    oldClass: firstColorClass,
                    newClass: secondColorClass
                },
                ease: "none"
            }, delay + (nonSpaceCount > 0 ? duration / nonSpaceCount : 0));
        });
        
        return timelineInstance;
    }

    function destroy() {
        kill();
        if (el && isPrepared) {
            el.innerHTML = originalHtml || originalText;
            gsap.set(el, { opacity: 0, width: "auto", height: "auto", overflow: "visible" });
            spanElements = [];
            lineData = [];
            isPrepared = false;
        }
    }

    return { scramble, kill, destroy, getIsAnimating: () => isAnimating };
}

export function initFlipIndicator(parentElement, props = {}) {
    const {
        layoutId,
        className = "h-12 w-12 bg-brand",
        duration = 0.8,
        ease = easings.backInOutSubtle,
        rotate = 0,
        ...restProps
    } = props;

    const el = document.createElement('div');
    el.className = className;
    el.style.flexShrink = '0';
    
    if (layoutId) el.setAttribute('data-layout-id', layoutId);

    Object.entries(restProps).forEach(([k, v]) => {
        if (typeof v !== 'function') el.setAttribute(k, v);
    });

    gsap.set(el, { rotate });

    function update(newProps = {}) {
        if (newProps.rotate !== undefined) {
            let activeEase = newProps.ease ?? ease;
            if (Array.isArray(activeEase) && activeEase.length === 4) {
                activeEase = `cubic-bezier(${activeEase.join(',')})`;
            }
            gsap.to(el, {
                rotate: newProps.rotate,
                duration: newProps.duration ?? duration,
                ease: activeEase
            });
        }
    }

    function destroy() {
        gsap.killTweensOf(el);
        el.remove();
    }

    if (parentElement) parentElement.appendChild(el);
    return { el, destroy, update };
}

export function initRollerNumber(parentElement, props = {}) {
    const {
        value,
        className,
        suffix,
        minDigits = 2,
        triggerMode = "scroll",
        triggerElement,
        delay = 0,
        duration = 1.5,
        stagger = 0.08,
        phase = "idle",
        ...restProps
    } = props;

    let hasTriggered = false;
    let triggerInstance = null;
    const isIdle = phase === "idle";
    const rollerInnerElements = [];

    const el = document.createElement('div');
    const baseClass = "flex items-start justify-start overflow-hidden leading-none";
    el.className = className ? `${baseClass} ${className}`.trim() : baseClass;
    el.style.height = "1em";

    Object.entries(restProps).forEach(([k, v]) => {
        if (typeof v !== 'function') el.setAttribute(k, v);
    });

    let digitsArray = Math.round(value || 0).toString().split("").map(Number);
    while (digitsArray.length < minDigits) {
        digitsArray.unshift(0);
    }

    digitsArray.forEach((digit) => {
        const trackContainer = document.createElement('div');
        trackContainer.className = "relative flex flex-col items-center justify-start overflow-hidden";
        trackContainer.style.width = "1ch";
        trackContainer.style.height = "1em";

        const innerTrack = document.createElement('div');
        innerTrack.setAttribute('data-roller-inner', 'true');
        innerTrack.className = "flex flex-col will-change-transform";
        innerTrack.style.transform = "translateY(-10em)";
        
        const sequences = ['a', 'b', 'c'];
        sequences.forEach(seqPrefix => {
            for (let i = 0; i <= 9; i++) {
                const numDiv = document.createElement('div');
                numDiv.className = "flex items-center justify-center leading-none";
                numDiv.style.height = "1em";
                numDiv.style.fontVariantNumeric = "tabular-nums";
                numDiv.textContent = i;
                innerTrack.appendChild(numDiv);
            }
        });

        trackContainer.appendChild(innerTrack);
        el.appendChild(trackContainer);
        rollerInnerElements.push(innerTrack);
    });

    if (suffix) {
        const suffixSpan = document.createElement('span');
        suffixSpan.className = "flex items-center leading-none";
        suffixSpan.style.fontVariantNumeric = "tabular-nums";
        suffixSpan.textContent = suffix;
        el.appendChild(suffixSpan);
    }

    function playAnimation() {
        if (hasTriggered || rollerInnerElements.length === 0) return;
        hasTriggered = true;
        
        rollerInnerElements.forEach((inner, i) => {
            const targetDigit = digitsArray[i] ?? 0;
            gsap.fromTo(inner, 
                { y: "-10em" }, 
                {
                    y: `${-20 - targetDigit}em`,
                    duration: duration,
                    delay: delay + (digitsArray.length - 1 - i) * stagger,
                    ease: "expo.inOut"
                }
            );
        });
    }

    function setupTrigger() {
        if (triggerMode === "immediate") {
            playAnimation();
            return;
        }
        if (!isIdle) return;
        
        hasTriggered = false;
        const scrollTarget = triggerElement || el;
        
        triggerInstance = ScrollTrigger.create({
            trigger: scrollTarget,
            start: "top bottom",
            once: true,
            invalidateOnRefresh: true,
            onEnter: playAnimation
        });
    }
    
    setTimeout(setupTrigger, 0);

    function destroy() {
        if (triggerInstance) {
            triggerInstance.kill();
        }
        gsap.killTweensOf(rollerInnerElements);
        el.remove();
    }

    if (parentElement) parentElement.appendChild(el);
    return { el, destroy, playAnimation };
}
