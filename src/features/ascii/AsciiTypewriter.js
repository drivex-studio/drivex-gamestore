import * as THREE from 'three'; 
import { EffectComposer } from 'postprocessing';
import { cx } from '../../utils/cx.js'; 
import { useIsTouchDevice } from '../../hooks/useBreakpoint.js'; 
import { DEFAULT_CHARACTERS } from './utils/asciiUtils.js'; 
import { initDemandFrameLoop } from './DemandFrameLoop.js'; 
import { initHoverImagePlane } from './HoverImagePlane.js'; 
import { initAsciiEffectMesh } from './AsciiEffectMesh.js';

let _containerEl = null;             
let _renderer = null;
let _scene = null;
let _camera = null;
let _composer = null;
let _imagePlaneApi = null;
let _asciiMeshApi = null;
let _demandLoopDisposer = null;
let _intersectionObserver = null;
let _resizeObserver = null;
let _rafHandle = null;
let _isVisible = true;               
let _resolvedCellSize = 20;          
let _frameloop = 'always';           

function onCanvasCreated(renderer) {
  renderer.domElement.addEventListener('webglcontextlost', onWebGLContextLost);
}

function onWebGLContextLost(evt) {
  evt.preventDefault();
}

export function initAsciiEffectCanvas(parentElement, props = {}) {
  const {
    imageSrc,
    className,
    characters = DEFAULT_CHARACTERS,
    fontSize = 54,
    cellSize = 20,             
    color = '#ff6b4a',         
    invert = false,            
    progress = 1,              
    colorProgress = 1,         
    randomness = 0.3,          
    revealDirection = 1,       
    revealEnd = 0.85,          
    effectRef,                 
    alignX = 'center',         
    alignY = 'bottom',         
    fit = 'cover',             
    mobileFit,                 
    enableHover = false,       
    hoverMode = 'stretch',     
    hoverIntensity,            
    mouseX = 0,                
    mouseY = 0,                
    mouseRef,                  
    enableGooeyReveal = false, 
    gooeyRadius = 0.15,        
    gooeySoftness = 0.08,      
    gooeyNoiseIntensity = 0.03, 
    isHovering = false,        
    enableDepthParallax = false, 
    depthMapSrc,               
    parallaxIntensity = 0.02,  
    colorDark,                 
    depthDetailMin,            
    clickPoint,                
    clickRadialInvert,         
    impactProgress,            
    revealOrigin = { x: 0.5, y: 0.5 }, 
    frameloop = 'always',      
    dpr = [1, 1.5]             
  } = props;

  const eR = revealOrigin;
  
  const eP = frameloop;
  
  const eI = dpr;
  
  const eD = hoverIntensity ?? (hoverMode === 'headTurn' ? 0.04 : 0.15);
  
  const eL = useIsTouchDevice() && mobileFit ? mobileFit : (fit ?? 'cover');

  _resolvedCellSize = cellSize;
  const setResolvedCellSize = (v) => { _resolvedCellSize = v; };

  _isVisible = true;
  const setIsVisible = (v) => { _isVisible = v; };

  const containerClass = cx('relative size-full', className);
  _containerEl = document.createElement('div');
  _containerEl.className = containerClass;
  parentElement.appendChild(_containerEl);

  if (eP === 'always') {
    let hideTimer = null;
    _intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;
      if (entry.isIntersecting) {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        setIsVisible(true);
      } else {
        hideTimer = setTimeout(() => setIsVisible(false), 500);
      }
    }, { rootMargin: '200px 0px' });
    _intersectionObserver.observe(_containerEl);
  }

  const resizeCallback = () => {
    const el = _containerEl;
    if (!el) return;
    const measure = () => {
      const t = Math.max(el.clientWidth, el.clientHeight);
      if (!Number.isFinite(t) || t <= 0) return;
      const newCellSize = cellSize * Math.max(0.5, t / 1920) * 1.35 *
        (Math.max(eI[0], Math.min(window.devicePixelRatio ?? 1, eI[1])) / 2);
      if (Number.isFinite(newCellSize) && !(newCellSize <= 0)) {
        setResolvedCellSize(newCellSize);
      }
    };
    measure();
    _resizeObserver = new ResizeObserver(measure);
    _resizeObserver.observe(el);
  };
  resizeCallback();

  const ez = (eP !== 'always' || _isVisible) ? eP : 'never';

  _renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'low-power'
  });
  _renderer.setPixelRatio(Math.max(eI[0], Math.min(window.devicePixelRatio ?? 1, eI[1])));
  _renderer.setSize(_containerEl.clientWidth, _containerEl.clientHeight, false);
  _renderer.setClearColor(0x000000, 0); 
  _containerEl.appendChild(_renderer.domElement);
  onCanvasCreated(_renderer);

  _scene = new THREE.Scene();
  _camera = new THREE.PerspectiveCamera(
    50, 
    _containerEl.clientWidth / _containerEl.clientHeight,
    0.1,
    100
  );
  _camera.position.set(0, 0, 5); 

  _composer = new EffectComposer(_renderer);

  _demandLoopDisposer = initDemandFrameLoop({
    frameloop: eP,
    invalidate: () => { if (_renderer) _renderer.render(_scene, _camera); }
  }).disposer;

  _imagePlaneApi = initHoverImagePlane({
    imageSrc,
    alignX,
    alignY,
    fit: eL,
    enableHover,
    hoverMode,
    hoverIntensity: eD,
    mouseX,
    mouseY,
    isHovering,
    viewport: { width: _containerEl.clientWidth, height: _containerEl.clientHeight }
  });
  if (_imagePlaneApi.mesh) {
    _scene.add(_imagePlaneApi.mesh);
  }

  const ek = Math.max(1, 1.6 * _resolvedCellSize);
  _asciiMeshApi = initAsciiEffectMesh({
    characters,
    fontSize,
    cellSize: ek,
    color,
    invert,
    respectAlpha: true,
    alphaThreshold: 0.1,
    progress,
    colorProgress,
    randomness,
    revealDirection,
    revealEnd,
    effectRef,
    enableGooeyReveal,
    gooeyRadius,
    gooeySoftness,
    gooeyNoiseIntensity,
    mouseX,
    mouseY,
    mouseRef,
    isHovering,
    enableDepthParallax,
    depthMapSrc,
    parallaxIntensity,
    colorDark,
    depthDetailMin,
    clickPoint,
    clickRadialInvert,
    impactProgress,
    revealOrigin: eR
  });
  if (_asciiMeshApi.asciiEffect) {
    _composer.addPass(_asciiMeshApi.asciiEffect);
  }

  const invalidate = () => {
    if (_renderer && _scene && _camera) {
      _composer.render();
    }
  };
  const tick = () => {
    if (_asciiMeshApi) _asciiMeshApi.frameCallback(invalidate);
    invalidate();
    _rafHandle = requestAnimationFrame(tick);
  };
  _rafHandle = requestAnimationFrame(tick);

  return {
    containerEl: _containerEl,
    renderer: _renderer,
    scene: _scene,
    camera: _camera,
    composer: _composer,
    destroy: () => destroyAsciiEffectCanvas()
  };
}

export function destroyAsciiEffectCanvas() {
  if (_rafHandle) { cancelAnimationFrame(_rafHandle); _rafHandle = null; }
  if (_demandLoopDisposer) { _demandLoopDisposer(); _demandLoopDisposer = null; }
  if (_intersectionObserver) { _intersectionObserver.disconnect(); _intersectionObserver = null; }
  if (_resizeObserver) { _resizeObserver.disconnect(); _resizeObserver = null; }
  if (_asciiMeshApi) { _asciiMeshApi.destroy(); _asciiMeshApi = null; }
  if (_imagePlaneApi) { _imagePlaneApi.destroy(); _imagePlaneApi = null; }
  if (_composer) { _composer.dispose(); _composer = null; }
  if (_scene) { _scene = null; }
  if (_camera) { _camera = null; }
  if (_renderer) {
    if (_renderer.domElement.parentNode) {
      _renderer.domElement.parentNode.removeChild(_renderer.domElement);
    }
    _renderer.dispose();
    _renderer = null;
  }
  if (_containerEl && _containerEl.parentNode) {
    _containerEl.parentNode.removeChild(_containerEl);
    _containerEl = null;
  }
  _isVisible = true;
  _resolvedCellSize = 20;
  _frameloop = 'always';
}
