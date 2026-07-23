// data/accordionData.js

function makeBlock(text) {
  return [
    {
      _type: 'block',
      _key: `blk-${Math.random().toString(36).slice(2, 8)}`,
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: `span-${Math.random().toString(36).slice(2, 8)}`,
          text,
          marks: []
        }
      ],
      markDefs: []
    }
  ];
}

export const accordionSectionData = {
  headline: {
    text: 'Common questions',
    level: 'h2'
  }
};

export const accordionData = {
  allowMultiple: false,
  duration: 0.8,
  ease: 'expo.inOut',
  enableStagger: true,
  items: [
    {
      _key: 'brand-book',
      headline: 'How do you work with our existing brand book and design system?',
      text: makeBlock(
        "We start by living inside the brand book and the design system. Whatever your typography and motion principles have already defined, we carry through end to end. The job is to make the site finally match what the brand has been saying."
      )
    },
    {
      _key: 'who-i-work-with',
      headline: 'Who do I actually work with on the project?',
      text: makeBlock(
        'Both brothers on every project. You stay with the same people from kickoff through launch. The people you talk to are the people writing the code.'
      )
    },
    {
      _key: 'project-length',
      headline: 'How long does a project take?',
      text: makeBlock(
        "Most engagements run six to twelve weeks from first conversation to launch. We give you a clear timeline before you commit and we work on fewer parallel projects than most studios so the timeline holds."
      )
    },
    {
      _key: 'commerce',
      headline: 'Do you work with brands that need commerce on the site?',
      text: makeBlock(
        "Yes, as long as the brand is the point of the site and commerce sits inside it. Think Nothing, Loewe, On Running. If your site is built primarily to convert, that's a different craft and there are studios who specialize in it."
      )
    },
    {
      _key: 'tech-stack',
      headline: 'What technology do you build with?',
      text: makeBlock(
        "Custom-coded from the ground up. The stack fits the brand, not the other way around. We don't build with Framer or Webflow and the site never sits on a page-builder substrate."
      )
    },
    {
      _key: 'after-launch',
      headline: 'What happens after the site ships?',
      text: makeBlock(
        "We hand over a site you fully own. The code and the design system are yours. Engagements close cleanly. If you want us to keep building, that's a separate conversation and we work on follow-ups only when there's something specific to ship next."
      )
    }
  ]
};
export default accordionData;