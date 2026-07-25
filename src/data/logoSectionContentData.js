export const sanityConfig = {
  projectId: 'epvgq6at',
  dataset: 'production',
};

export const logoSectionData = {
  theme: 'light',

  trustedBy: {
    title: null,

    items: [
      {
        _key: 'coca-cola-logo',
        _type: 'image',
        alt: 'Coca Cola Logo',
        variant: 'square',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-df0fbe5bdec2803d94426b6a8e5008da2eb2dd3b-82x27-svg',
          },
          dimensions: {
            width: 82,
            height: 27,
            aspectRatio: 82 / 27,
          },
        },
      },

      {
        _key: 'bodyarmor-logo',
        _type: 'image',
        alt: 'Bodyarmor Logo',
        variant: 'horizontal',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-0a7a8c74009d8949a5016184d4b588a3cbf149bb-112x16-svg',
          },
          dimensions: {
            width: 112,
            height: 16,
            aspectRatio: 112 / 16,
          },
        },
      },

      {
        _key: 'wkndhrs-logo',
        _type: 'image',
        alt: 'WKNDHRS logo',
        variant: 'horizontal',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-c5c3a6b5729832001da250c3169912c946ad8b84-115x14-svg',
          },
          dimensions: {
            width: 115,
            height: 14,
            aspectRatio: 115 / 14,
          },
        },
      },

      {
        _key: 'many-more',
        _type: 'textItem',
        text: '+ Many more',
      },
    ],
  },
};

export default logoSectionData;
