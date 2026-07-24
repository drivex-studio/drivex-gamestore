export const aboutHeroData = {
  className: 'grid-span-12 lg:grid-subgrid flex flex-col justify-center gap-16',

  headline: 'Two Brothers.\nOne Obsession: Craft.',
  headlineLevel: 'h1',

  subtext:
    "We're a frontend development studio that builds websites, animations, and web apps for brands like Coca-Cola, FIFA, and BodyArmor.",

  media: {
    type: 'image',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
      },
      altText:
        'Adrian and Julian dressed in black seated in modern chairs against a neutral studio background, both looking off to the side',
    },
  },


  mobileImage: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: 'image-e91a652a9f52ceba1eb97fa12d177a647a63e865-1672x2508-png',
    },
    altText:
      'Adrian and Julian dressed in black sitting on the floor against a white wall in a minimalist studio setting',
  },

  ctas: null, 
  scrollText: null, 
  useWatermark: true, 
};

export default aboutHeroData;
