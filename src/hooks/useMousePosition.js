export function useMousePosition(options = {}, onChange) {
  const { lerp = 0.08, enabled = true, containerRef, refOnly = false } = options;

  let mouseX = 0;
  let mouseY = 0;
  let isHovering = false;
  const mouseRef = { current: { x: 0, y: 0 } };

  function emit() {
    onChange?.({ mouseX, mouseY, isHovering, mouseRef });
  }

  let rafId = 0;

  if (!enabled) {
    if (!refOnly) {
      mouseX = 0;
      mouseY = 0;
    }
    mouseRef.current.x = 0;
    mouseRef.current.y = 0;
    isHovering = false;
    emit();
    return {
      getState: () => ({ mouseX, mouseY, isHovering, mouseRef }),
      destroy() {},
    };
  }

  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let isHoveringLocal = false;

  function scheduleTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    curX += (targetX - curX) * lerp;
    curY += (targetY - curY) * lerp;
    mouseRef.current.x = curX;
    mouseRef.current.y = curY;
    if (!refOnly) {
      mouseX = curX;
      mouseY = curY;
    }
    emit();
    rafId =
      Math.abs(targetX - curX) > 1e-4 || Math.abs(targetY - curY) > 1e-4
        ? requestAnimationFrame(tick)
        : 0;
  }

  function handleMouseMove(e) {
    const container = containerRef?.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
        if (!isHoveringLocal) {
          isHoveringLocal = true;
          isHovering = true;
          emit();
        }
        targetX = 2 * relX - 1;
        targetY = (1 - relY) * 2 - 1;
      } else if (isHoveringLocal) {
        isHoveringLocal = false;
        isHovering = false;
        emit();
        targetX = 0;
        targetY = 0;
      }
    } else {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    }
    scheduleTick();
  }

  function handleDocMouseLeave() {
    targetX = 0;
    targetY = 0;
    scheduleTick();
  }

  function handleContainerEnter() {
    isHoveringLocal = true;
    isHovering = true;
    emit();
  }

  function handleContainerLeave() {
    isHoveringLocal = false;
    isHovering = false;
    emit();
    targetX = 0;
    targetY = 0;
    scheduleTick();
  }

  window.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseleave', handleDocMouseLeave);

  const container = containerRef?.current;
  if (container) {
    container.addEventListener('mouseenter', handleContainerEnter);
    container.addEventListener('mouseleave', handleContainerLeave);
  } else {
    document.addEventListener('mouseenter', handleContainerEnter);
    document.addEventListener('mouseleave', handleContainerLeave);
  }

  return {
    getState: () => ({ mouseX, mouseY, isHovering, mouseRef }),
    destroy() {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleDocMouseLeave);
      if (container) {
        container.removeEventListener('mouseenter', handleContainerEnter);
        container.removeEventListener('mouseleave', handleContainerLeave);
      } else {
        document.removeEventListener('mouseenter', handleContainerEnter);
        document.removeEventListener('mouseleave', handleContainerLeave);
      }
      cancelAnimationFrame(rafId);
    },
  };
}
