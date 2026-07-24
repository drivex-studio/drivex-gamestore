export function initSyncBodyTheme() {
  function syncTheme() {
    const section = document.querySelector('[data-page-builder-section][data-theme]');
    if (section) {
      const theme = section.getAttribute('data-theme');
      if (theme) document.body.setAttribute('data-theme', theme);
    }
  }

  syncTheme();
  const observer = new MutationObserver(() => {
    syncTheme();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: false });

  return function destroySyncBodyTheme() {
    observer.disconnect();
  };
}
