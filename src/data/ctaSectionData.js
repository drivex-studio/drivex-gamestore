export const ctaSectionData = {
  sectionType: "ctaSection",
  className: "pt-64 lg:pt-128 pb-64 lg:pb-128 bg-background",
  theme: "light",
  content: {
    leftColumn: {
      headline: {
        level: "h2",
        text: "Start a project.",
        trigger: "scroll"
      },
      image: {
        _id: "image-733a905001b518d4cb990ad59887343a88c281d0-4096x1798-jpg",
        asset: {
          _ref: "image-733a905001b518d4cb990ad59887343a88c281d0-4096x1798-jpg",
          _type: "reference"
        },
        altText: "TODO: add alt text",
        description: "TODO: add description",
        dimensions: {
            "aspectRatio": 2.278086763070078,
        "height": 1798,
        "width": 4096
        },
        crop: null,
        hotspot: null,
        lqip: "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAJABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAUGB//EACEQAAIBAwQDAQAAAAAAAAAAAAECAAMEcQURITQSEzJB/8QAFgEBAQEAAAAAAAAAAAAAAAAABAED/8QAGhEAAwADAQAAAAAAAAAAAAAAAAECERITIf/aAAwDAQACEQMRAD8AxfQtRNjqC1E42BDHMo7y5ta1uR5p7Two3/ZEUfmrkQXuJmN6tZQGo2pUOmuVR3RwVZTsRCK7/tVMwk60bJ+H/9k",
        palette: {
          dominant: { background: "#a2b7d3", foreground: "#000" },
          darkMuted: { background: "#2f4864", foreground: "#fff" },
          vibrant: { background: "#1fb9d5", foreground: "#fff" }
        }
      }
    },
    rightColumn: {
      headline: {
        level: "h4",
        text: "Book a call or send us a message. We read everything.",
        trigger: "scroll"
      },
      contactInfo: {
        email: "contact@good-fella.com",
        subtext: "Working with teams worldwide."
      },
ctaButtons: [
  {
    link: { href: "/contact", text: "Get in touch", type: "internal" },
    variant: "link"
  },
  {
    link: { href: "#", text: "Book a 15-min call", type: "modal", modalId: "cal-booking" },
    variant: "button",
    size: "sm",
    theme: "light"
  }
],

      note: "Both brothers on every project."
    }
  }
};
