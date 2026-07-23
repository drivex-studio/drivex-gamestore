
export const featuredWorkSectionData = {
  content: {
    headline: {
      text: 'Selected work.',
      level: 'h2',
    },
    text: 'Selected sites for consumer, sports and entertainment brands. The work travels.',
    viewAllButton: {
     variant: 'link',
      link: { href: '/work', text: 'View all', type: 'internal' },
    },
    caseStudies: [
      {
        _id: 'case-bodyarmor',
        title: 'BodyArmor',
        uri: '/work/bodyarmor',
        tags: ['Marketing Site', 'Sports'],
        thumbnail: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-20244bd09f91b99132a6038f84ad07f71917d0a5-2560x1440-png',
          },
        },
        featuredMedia: {
          type: 'image',
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: 'image-6eb78f9914991cf3a8c07ebdf8f930415a3ff532-2560x1440-png',
            },
            altText:
              'Laptop, tablet, and smartphone displaying the Bodyarmor Strawberry Banana product page in a clean, responsive mockup layout',
          },
          aspectRatio: '16/10',
        },
      },
      {
        _id: 'case-annnimate',
        title: 'Annnimate',
        uri: '/work/annnimate',
        tags: ['Web App', 'SaaS', 'Animations'],
        thumbnail: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-0481aca4fc225a8bba4ee19e62660661e3361f4f-2560x1440-png',
          },
        },
        featuredMedia: {
          type: 'image',
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: 'image-6eb78f9914991cf3a8c07ebdf8f930415a3ff532-2560x1440-png',
            },
            altText:
              'Two silhouetted people viewing the Annnimate website on a large desktop screen displaying an animation library and headline text',
          },
          aspectRatio: '16/10',
        },
      },
      {
        _id: 'case-wkndhrs',
        title: 'WKNDHRS',
        uri: '/work/wkndhrs',
        tags: ['Agency Website', 'Portfolio', 'Animations'],
        thumbnail: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-6eb78f9914991cf3a8c07ebdf8f930415a3ff532-2560x1440-png',
          },
        },
        featuredMedia: {
          type: 'image',
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
            },
            altText:
              'WKNDHRS website displayed across laptop and mobile, highlighting creative services for AI, AR, music, and new digital experiences in a minimalist interface',
          },
          aspectRatio: '16/10',
        },
      },
      {
        _id: 'case-fitgreenmind',
        title: 'Fitgreenmind',
        uri: '/work/fitgreenmind',
        tags: ['Marketing Site', 'Animations'],
        thumbnail: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
          },
        },
        featuredMedia: {
          type: 'image',
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
            },
            altText:
              'Laptop on a wooden desk displaying the Fit Green Mind logo on a green screen, styled with plants and minimalist decor',
          },
          aspectRatio: '16/10',
        },
      },
    ],
  },
};

export default featuredWorkSectionData;
