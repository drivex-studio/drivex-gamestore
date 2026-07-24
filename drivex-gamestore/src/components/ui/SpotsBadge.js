
import { cx } from "../../utils/cx.js";

export function SpotsBadge(parentElement, props = {}) {
  const { spots, className } = props;

  if (!spots || spots <= 0) return null;

  const wrapperClassName = cx(
    "inline-flex items-center gap-8 text-accent-sm text-foreground-muted",
    className
  );

  const pulseSpan = document.createElement("span");
  pulseSpan.className = "inline-block size-8 shrink-0 animate-pulse bg-brand";

  const pluralSuffix = spots === 1 ? "" : "s";

  const textSpan = document.createElement("span");
  textSpan.textContent = `Only ${spots} spot${pluralSuffix} left`;

  const wrapperSpan = document.createElement("span");
  wrapperSpan.className = wrapperClassName;
  wrapperSpan.appendChild(pulseSpan);
  wrapperSpan.appendChild(textSpan);

  if (parentElement) parentElement.appendChild(wrapperSpan);
  return wrapperSpan;
}
