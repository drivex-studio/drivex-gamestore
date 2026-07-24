
const DEFAULT_HONEYPOT_FIELD = 'website';

export function initFormHoneypot() {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = DEFAULT_HONEYPOT_FIELD;
  input.autocomplete = 'off';
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.className =
    'pointer-events-none absolute -left-[9999px] -z-10 h-px w-px overflow-hidden opacity-0';
  return input;
}
