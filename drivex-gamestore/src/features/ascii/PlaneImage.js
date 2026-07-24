
import * as THREE from 'three';
import { proxySanityUrl, onTextureLoadError } from './utils/asciiUtils.js';

let _texture = null;
let _setTexture = null;

let _meshRef = null;

export function initPlaneImage({
  imageSrc,
  onLoad,
  alignX = 'center',
  alignY = 'bottom',
  fit = 'cover',
  stretchX = 1,
  stretchY = 1,
  rotationY = 0,
  rotationX = 0,
  viewport  
} = {}) {
  
  _texture = null;
  _setTexture = (v) => {
    _texture = v;
    if (_meshRef && v) {
      _meshRef.material.map = v;
      _meshRef.material.needsUpdate = true;
    }
  };

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  loader.load(
    proxySanityUrl(imageSrc),
    (tex) => {
      _setTexture(tex);
      if (onLoad) onLoad();
    },
    void 0,
    onTextureLoadError
  );

  if (!_texture) return { mesh: null, destroy: () => destroyPlaneImage() };

  const img = _texture.image;
  const imgAspect = img.width / img.height;
  const vpAspect = viewport.width / viewport.height;

  let planeW, planeH;
  
  if (fit === 'contain' && imgAspect > vpAspect) {
    planeW = viewport.width;
    planeH = viewport.width / imgAspect;
  } else {
    planeH = viewport.height;
    planeW = viewport.height * imgAspect;
  }

  const finalW = planeW * stretchX;
  const finalH = planeH * stretchY;

  let offsetX = 0;
  const overflowX = finalW - viewport.width;
  if (alignX === 'left') offsetX = overflowX / 2;
  else if (alignX === 'right') offsetX = -overflowX / 2;

  let offsetY = 0;
  const overflowY = finalH - viewport.height;
  if (alignY === 'bottom') offsetY = overflowY / 2;
  else if (alignY === 'top') offsetY = -overflowY / 2;

  const geometry = new THREE.PlaneGeometry(finalW, finalH);
  const material = new THREE.MeshBasicMaterial({
    map: _texture,
    transparent: true,
    alphaTest: 0.01
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(offsetX, offsetY, 0);
  mesh.rotation.set(rotationX, rotationY, 0);
  _meshRef = mesh;

  return {
    mesh,
    destroy: () => destroyPlaneImage()
  };
}

export function destroyPlaneImage() {
  if (_meshRef) {
    if (_meshRef.geometry) _meshRef.geometry.dispose();
    if (_meshRef.material) _meshRef.material.dispose();
    _meshRef = null;
  }
  if (_texture) {
    _texture.dispose();
    _texture = null;
  }
  _setTexture = null;
}
