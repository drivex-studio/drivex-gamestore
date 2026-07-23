// src/data/navData.js

export const navItems = [
  { text: 'Home', link: { href: 'index.html' } },
  { text: 'Work', link: { href: 'work.html' } },
  { text: 'Pricing', link: { href: 'pricing.html' } },  
  { text: 'About', link: { href: 'about.html' } },
  { text: 'Contact', link: { href: 'contact.html' } }
];


export const flyout = {
  contact: { 
    email: 'hello@drivex.com', 
    phone: '+95 9 123 456 789' 
  },
  team: [
    { name: 'Jane Doe', email: 'jane@drivex.com' }
  ],
  socials: [
    { name: 'Instagram', handle: '@drivex', href: 'https://instagram.com/drivex' }
  ],
  location: 'Yangon, Myanmar',
  availability: { 
    text: 'Available for work', 
    isAvailable: true 
  },
  
  centerImage: { 
    image: {
      _id: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
      dimensions: {
        width: 2556,
        height: 1179,
        aspectRatio: 2556 / 1179
      }
    }, 
    caption: 'Latest project' 
  },
  featuredProject: { 
    project: { 
      uri: '/work/project-1', 
      image: {
        _id: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
        dimensions: {
          width: 2556,
          height: 1179,
          aspectRatio: 2556 / 1179
        }
      }, 
      title: 'Project 1' 
    }, 
    caption: 'Featured' 
  },
};

export const headerCta = { text: 'Book a call' };
export const spotsRemaining = 3;
