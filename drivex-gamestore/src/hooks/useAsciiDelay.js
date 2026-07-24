import { useBreakpoint } from "./useBreakpoint.js";
import { ASCII_REVEAL_DURATION } from "../config/asciiConfig.js";

const asciiDelayBase = 0.1 * ASCII_REVEAL_DURATION;

export function useAsciiDelay() {
  const md = useBreakpoint("md");
  return md ? asciiDelayBase : 0;
}
