import { usePageEnterContext } from './usePageEnterContext.js';

// Renamed from mangled/aliased source identifiers (hook: usePageEnterMotion -- name itself is
// legible in source via e.s(["usePageEnterMotion", () => r]), so it is preserved as-is; hooks
// keep their "use" name per the Folder Structure Convention, unlike PascalCase components):
// e (options param) -> options, h/p (priority) -> priority, f/g (skip) -> skip,
// m/v (duration) -> duration, x (register) -> register, y (unregister) -> unregister,
// b (phase) -> phase, C (prefersReducedMotion) -> prefersReducedMotion,
// w/s (idRef/id) -> id, _/j (delay/setDelay) -> delay, k/E (hasEntered/setHasEntered) -> hasEntered,
// S/I/P (shouldAnimate/isEntering/isComplete) -> kept as-is (already legible)
//
// NOTE: the source's `d = (0,t.c)(20)` array is React Compiler's auto-generated useMemoCache --
// compiler bookkeeping that skips recomputation across renders. It is dropped entirely, same as
// the useMemo/useCallback conversion pattern (wrapper dropped, wrapped logic preserved), since
// there is no render cycle to skip work across once React is removed.
export function usePageEnterMotion(options) {
  const opts = options === undefined ? {} : options;
  const { priority: priorityOpt, skip: skipOpt, duration: durationOpt } = opts;
  const priority = priorityOpt === undefined ? 0 : priorityOpt;
  const skip = skipOpt !== undefined && skipOpt;
  const duration = durationOpt === undefined ? 0.8 : durationOpt;


  const { register, unregister, phase: initialPhase, prefersReducedMotion } =
    usePageEnterContext();

  const id = crypto.randomUUID();

  let delay = 0;
  let hasEntered = false;
  let phase = initialPhase;


  const listeners = new Set();

  function computeState() {
    return {
      shouldAnimate: hasEntered && !prefersReducedMotion,
      delay,
      duration,
      phase,
      prefersReducedMotion,
      isEntering: phase === 'entering',
      isComplete: phase === 'complete',
    };
  }

  function notify() {
    const state = computeState();
    listeners.forEach((listener) => listener(state));
  }

  // useEffect(() => { if (skip) return; register(id, cb, priority); return () => unregister(id); },
  //   [register, unregister, priority, skip])
  let cleanupRegister = null;
  if (!skip) {
    register(
      id,
      (delayValue) => {
        delay = delayValue;
        hasEntered = true;
        notify();
      },
      priority
    );
    cleanupRegister = () => unregister(id);
  }

  // useEffect(() => { if (phase === "waiting") { setHasEntered(false); setDelay(0); } }, [phase])
  // TODO: in source this effect re-runs every time `phase` changes (React dependency-array
  // reactivity driven by usePageEnterContext's live value). usePageEnterContext is SOURCE NOT
  // PRESENT here, so its own change-notification contract is unknown. handlePhaseChange below
  // reproduces the effect BODY faithfully and is invoked once immediately with the initial phase
  // snapshot (mirroring the effect's mount-time run). Wire this function to
  // usePageEnterContext's real phase-change notifications once that source is available.
  function handlePhaseChange(nextPhase) {
    phase = nextPhase;
    if (phase === 'waiting') {
      hasEntered = false;
      delay = 0;
    }
    notify();
  }
  handlePhaseChange(initialPhase);

  return {
    getState: computeState,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    _notifyPhaseChange: handlePhaseChange,
    destroy() {
      listeners.clear();
      if (cleanupRegister) cleanupRegister();
    },
  };
}

