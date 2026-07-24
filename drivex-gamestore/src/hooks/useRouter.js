export function useRouter() {
  return {
    push: (href) => { window.location.href = href; },
    replace: (href) => { window.location.replace(href); },
    back: () => { window.history.back(); },
  };
}
