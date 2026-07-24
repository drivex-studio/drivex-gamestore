
export function initTabTitleMessage() {
  let originalTitle = document.title;

  function onVisibilityChange() {
    if (document.hidden) {
      originalTitle = document.title;
      
      document.title = "Don't be shy, Fella. ";
    } else {
      document.title = originalTitle;
    }
  }

  document.addEventListener("visibilitychange", onVisibilityChange);

  function destroyTabTitleMessage() {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    
    document.title = originalTitle;
  }

  return { destroy: destroyTabTitleMessage };
}
