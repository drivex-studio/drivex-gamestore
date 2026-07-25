// src/data/contactSectionData.js

export const contactSectionData = {
  theme: 'dark',

  visual: {
    // Swap with a real asset when available (e.g. via Working Copy -> src/assets/images/)
    src: '../src/assets/images/contact-visual.jpg',
    alt: 'Drive X Store',
  },

  headline: "Let's talk",

  contactLines: [
    { label: 'Email', href: 'mailto:hello@drivex.com', text: 'hello@drivex.com' },
    { label: 'Support', href: 'mailto:support@drivex.com', text: 'support@drivex.com' },
  ],

  socials: [
    { text: 'Instagram', href: 'https://instagram.com/drivex' },
    { text: 'Discord', href: 'https://discord.gg/drivex' },
    { text: 'X / Twitter', href: 'https://twitter.com/drivex' },
  ],

  availabilityNote: 'Working Globally -- 24/7 Delivery',

  callToAction: {
    heading: 'Need a fast answer? Book a 15-minute call.',
    buttonText: 'Book a call',
    href: '#',
  },

  formHeading: 'Send a message',

  inquiryOptions: [
    { value: '', label: 'What do you need? *' },
    { value: 'buy-account', label: 'Buy a Game Account' },
    { value: 'topup', label: 'In-Game Currency / Top-up' },
    { value: 'custom-order', label: 'Custom / Bulk Order' },
    { value: 'support', label: 'Support Issue' },
  ],

  submitEndpoint: '/api/contact',
};