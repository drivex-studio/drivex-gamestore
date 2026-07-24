
import { initLogoSectionContent } from '../features/general/LogoSectionContent.js';
import { logoSectionData } from '../data/logoSectionContentData.js';

export function initLogoSection(mainContainer) {
  const sectionEl = document.createElement('section');

  sectionEl.setAttribute('data-theme', 'light');
  sectionEl.setAttribute('data-page-builder-section', 'logoSection');
  sectionEl.className = 'bg-background pt-48 lg:pt-96 pb-16 lg:pb-32';

  const logoSectionInstance = initLogoSectionContent(sectionEl, logoSectionData);

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function destroy() {
    if (logoSectionInstance && typeof logoSectionInstance.destroy === 'function') {
      logoSectionInstance.destroy();
    }

    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return {
    element: sectionEl,
    destroy,
  };
}