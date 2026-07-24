
export function useIsoLayoutEffect(setup) {
  return typeof setup === "function" ? setup() : undefined;
}
