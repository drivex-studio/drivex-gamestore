
import * as THREE from 'three';
import { ASCIIEffect } from '../../lib/ASCIIEffect.js';
import { proxySanityUrl, DEFAULT_CHARACTERS } from './utils/asciiUtils.js';

let _gooeyIntensityRef = 0;             
let _parallaxOffsetRef = { x: 0, y: 0 }; 
let _wasHoveringRef = false;             
let _scrambleSeedCounterRef = 0;         
let _asciiEffect = null;                 

export function initAsciiEffectMesh({
  characters = DEFAULT_CHARACTERS,
  fontSize = 54,
  cellSize = 20,
  color = '#ff6b4a',
  invert = false,
  alphaThreshold = 0.1,
  respectAlpha = true,
  progress = 1,
  colorProgress = 1,
  randomness = 0.3,
  revealDirection = 1,
  revealEnd = 0.85,
  enableGooeyReveal = false,
  gooeyRadius = 0.15,
  gooeySoftness = 0.08,
  gooeyNoiseIntensity = 0.03,
  enableDepthParallax = false,
  parallaxIntensity = 0.02,
  colorDark,
  depthDetailMin,
  effectRef,           
  mouseX = -1,
  mouseY = -1,
  mouseRef,            
  isHovering = false,
  depthMapSrc,         
  clickPoint,
  clickRadialInvert,
  impactProgress,
  revealOrigin = { x: 0.5, y: 0.5 }
} = {}) {
  
  _asciiEffect = new ASCIIEffect({
    characters,
    fontSize,
    cellSize,
    color,
    invert,
    alphaThreshold,
    respectAlpha,
    progress,
    colorProgress,
    randomness,
    revealDirection,
    revealEnd,
    enableGooeyReveal,
    gooeyRadius,
    gooeySoftness,
    gooeyNoiseIntensity,
    enableDepthParallax,
    parallaxIntensity,
    colorDark,
    depthDetailMin,
    revealOrigin
  });

  if (depthMapSrc && enableDepthParallax) {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(proxySanityUrl(depthMapSrc), (tex) => {
      _asciiEffect.setDepthMap(tex);
      _asciiEffect.setEnableDepthParallax(true);
    });
  }

  const frameCallback = (invalidate) => {
    const mx = mouseRef?.current?.x ?? mouseX;
    const my = mouseRef?.current?.y ?? mouseY;

    _asciiEffect.setProgress(progress);
    _asciiEffect.setColorProgress(colorProgress);
    _asciiEffect.setClickPoint(clickPoint?.x ?? -1, clickPoint?.y ?? -1);
    _asciiEffect.setRadialInvert(+!!clickRadialInvert);
    _asciiEffect.setImpactProgress(impactProgress ?? 0);
    _asciiEffect.setRevealOrigin(revealOrigin.x, revealOrigin.y);

    if (isHovering && (enableDepthParallax || enableGooeyReveal)) {
      invalidate();
    }

    if (enableDepthParallax) {
      const targetX = isHovering ? -mx * parallaxIntensity : 0;
      const targetY = isHovering ? -my * parallaxIntensity * 0.5 : 0;
      const lerp = isHovering ? 0.08 : 0.05;
      _parallaxOffsetRef.x += (targetX - _parallaxOffsetRef.x) * lerp;
      _parallaxOffsetRef.y += (targetY - _parallaxOffsetRef.y) * lerp;
      _asciiEffect.setParallaxOffset(_parallaxOffsetRef.x, _parallaxOffsetRef.y);
      if (!isHovering) {
        const dx = Math.abs(targetX - _parallaxOffsetRef.x);
        const dy = Math.abs(targetY - _parallaxOffsetRef.y);
        if (dx > 1e-4 || dy > 1e-4) invalidate();
      }
    }

    if (enableGooeyReveal) {
      _asciiEffect.setMousePosition((mx + 1) / 2, (my + 1) / 2);
      if (isHovering && !_wasHoveringRef) {
        _scrambleSeedCounterRef += 1;
        _asciiEffect.setScrambleSeed(_scrambleSeedCounterRef);
      }
      _wasHoveringRef = isHovering;
      const target = +!!isHovering;
      const lerp = isHovering ? 0.08 : 0.06;
      _gooeyIntensityRef += (target - _gooeyIntensityRef) * lerp;
      _asciiEffect.setGooeyIntensity(_gooeyIntensityRef);
      if (!isHovering && Math.abs(target - _gooeyIntensityRef) > 0.001) {
        invalidate();
      }
    }
  };

  if (effectRef) {
    effectRef.current = _asciiEffect;
  }

  return {
    asciiEffect: _asciiEffect,
    frameCallback,
    destroy: () => destroyAsciiEffectMesh(effectRef)
  };
}

export function destroyAsciiEffectMesh(effectRef) {
  if (effectRef) {
    effectRef.current = null;
  }
  if (_asciiEffect) {
    _asciiEffect.dispose();
    _asciiEffect = null;
  }
  _gooeyIntensityRef = 0;
  _parallaxOffsetRef = { x: 0, y: 0 };
  _wasHoveringRef = false;
  _scrambleSeedCounterRef = 0;
}
