export function usePathname() {
  let path = window.location.pathname;

  // Static multi-page build (index.html, work.html, ...) served without
  // clean-URL rewriting: normalize "/index.html" -> "/" and
  // "/work.html" -> "/work" so it matches navData.js's clean hrefs.
  path = path.replace(/\/index\.html$/, '/');
  path = path.replace(/\.html$/, '');

  if (path === '') path = '/';

  return path;
}
