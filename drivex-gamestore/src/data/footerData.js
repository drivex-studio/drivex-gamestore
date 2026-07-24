import { navItems, flyout, spotsRemaining } from './navData.js';

const contactEmail = flyout.contact?.email;

export const footerContactInformation = contactEmail
  ? {
      _type: 'block',
      style: 'normal',
      markDefs: [{ _key: 'footerContactEmail', _type: 'link', href: `mailto:${contactEmail}` }],
      children: [{ _type: 'span', text: contactEmail, marks: ['footerContactEmail'] }],
    }
  : null;

export const footerCopyrightNotice = {
  _type: 'block',
  style: 'normal',
  children: [{ _type: 'span', text: 'Drive X Store. All rights reserved.' }],
};

export const footerProps = {
  navigation: {
    items: navItems,
    availability: flyout.availability,
  },
  contactInformation: footerContactInformation,
  copyrightNotice: footerCopyrightNotice,
  spotsRemaining,
  showWatermark: true,   
};
