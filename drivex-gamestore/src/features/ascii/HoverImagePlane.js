
import { initPlaneImage, destroyPlaneImage } from './PlaneImage.js';

export function initHoverImagePlane({
  imageSrc,
  onLoad,
  alignX,
  alignY,
  fit,
  enableHover = false,
  hoverMode = 'stretch',
  hoverIntensity,
  mouseX,
  mouseY,
  isHovering,
  viewport
} = {}) {
  
  let stretchX = 1;
  let stretchY = 1;
  let rotationY = 0;

  if (enableHover && isHovering) {
    if (hoverMode === 'headTurn') {
      
      rotationY = -mouseX * hoverIntensity;
    } else {
      
      if (alignX === 'left') {
        
        stretchX = 1 + (mouseX + 1) / 2 * hoverIntensity;
      } else if (alignX === 'right') {
        
        stretchX = 1 + (1 - mouseX) / 2 * hoverIntensity;
      } else if (alignX === 'center') {
        
        stretchX = 1 + Math.abs(mouseX) * hoverIntensity;
      }
      
      stretchY = 1 + (1 - mouseY) / 2 * hoverIntensity;
    }
  }

  return initPlaneImage({
    imageSrc,
    onLoad,
    alignX,
    alignY,
    fit,
    stretchX,
    stretchY,
    rotationX: 0,
    rotationY,
    viewport
  });
}

export function destroyHoverImagePlane() {
  destroyPlaneImage();
}
