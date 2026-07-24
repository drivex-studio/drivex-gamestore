function setRef(ref, value) {
  if (typeof ref === 'function') return ref(value);
  if (ref != null) ref.current = value;
}

export function composeRefs(...refs) {
  return (value) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, value);
      if (!hasCleanup && typeof cleanup === 'function') hasCleanup = true;
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === 'function') cleanup();
          else setRef(refs[i], null);
        }
      };
    }
  };
}
