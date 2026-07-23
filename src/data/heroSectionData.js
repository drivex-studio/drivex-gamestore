
export const heroSectionData = {
  className: 'grid-span-12 lg:grid-span-7 pointer-events-none relative z-10 flex grid-rows-[1fr_auto] flex-col items-start justify-between pb-16 lg:pb-32',
  headline: 'Drive X Store',
  headlineLevel: 'h1',
  subtext: 'Premium gaming accounts and digital experiences.',
  ctas: {
    layout: 'horizontal',
    gap: 16,
    buttons: [
      {
        variant: 'default',
        size: 'default',
        theme: 'brand',
        link: { href: '/shop', text: 'Shop Now', type: 'internal' },
      },
      {
        variant: 'link',
        link: { href: 'https://discord.gg/drivex', text: 'Join Discord', type: 'external' },
      },
    ],
  },
  trustedBy: { title: 'Trusted By', items: [] },
};

export default heroSectionData;
