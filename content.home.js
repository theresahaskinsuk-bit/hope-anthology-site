/*
  Hope Anthology homepage content
  EDIT THIS FILE for normal homepage changes: copy, image URLs, links, and button labels.
  Keep the punctuation marks, commas, and quote marks around each value.
*/
window.HA_HOME_CONTENT = {
  images: {
    logo: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/e789bc30-2f5c-4037-8190-a9355d3a8d20/home-logo-hope-anthology.jpg?content-type=image%2Fjpeg',
    star: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/1852dfa4-ea60-4e93-83b5-ac8ea2f0498d/home-footer-star-hope-anthology.png?content-type=image%2Fpng',
    hero: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/3ac43f8a-1dbb-47cd-a379-492308c77625/home-hero-hope-anthology-art-and-making.jpg?content-type=image%2Fjpeg',
    keep: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/18cea152-1a12-4535-8cef-3099aab45bd5/home-panel-to-keep-symbolic-art.jpg?content-type=image%2Fjpeg',
    make: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/f8b5d4d6-304b-4edf-aa13-4c87597d4873/home-panel-to-make-stained-glass-patterns-luna.jpg?content-type=image%2Fjpeg',
    why: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/5171904f-5f1a-405f-80af-ff1199448f4e/home-panel-story-family-making-table.jpg?content-type=image%2Fjpeg'
  },

    navigation: [
    { label: 'To Keep', url: '/to-keep' },
    { label: 'To Make', url: '/collections/stained-glass-patterns' },
    { label: 'The Story', url: '/story' },
    { label: 'Collaborate', url: '/collaborate' },
    { label: 'Collective', url: '/collective' }
  ],

  hero: {
    eyebrow: 'Symbolic art · meaningful making',
    headlineHtml: 'An anthology of art to <em>keep</em> and things to <em>make.</em>',
    body: "Things to keep that lift you, anchor you, or just make you smile. Things to make that give you space to slow down and just be. And sometimes, something to give when words don't work. Made by independent artists.",
    bodyTagline: '',
    cta1Label: 'To Keep →',
    cta1Url: '/to-keep',
    cta2Label: 'To Make →',
    cta2Url: '/collections/stained-glass-patterns',
    secondaryButtonLabel: 'Read the story',
    secondaryButtonUrl: '/story'
  },

  intro: {
    backgroundImageKey: 'hero',
    primaryButtonLabel: 'To Keep →',
    primaryButtonUrl: '/to-keep',
    secondaryButtonLabel: 'Read the story →',
    secondaryButtonUrl: '/story',
    bodyHtml: 'The Hope Anthology brings together <em>independent artists and makers</em> — and the people <em>who need</em> what they make. A curated collection by <em>many hands</em>. William Morris held that the things we make and live with should carry meaning, and that the people who make them should be <em>valued</em>.',
    kicker: 'Two worlds. One anthology.'
  },

  worlds: {
    kicker: 'Two worlds. One anthology.',
    heading: "What's here for you",
    panels: [
      { label: 'To Keep', tone: 'keep', imageKey: 'keep', alt: 'Hope Anthology art to keep', copy: 'Art you can own that shows up for you every day.', linkLabel: 'To Keep →', linkUrl: '/to-keep' },
      { label: 'To Make', tone: 'make', imageKey: 'make', alt: 'Hope Anthology stained glass making project', copy: 'Make something. Just for you. Just because.', linkLabel: 'To Make →', linkUrl: '/collections/stained-glass-patterns' },
      { label: 'Behind it all', tone: 'why', imageKey: 'why', alt: 'Hope Anthology story and family making table', copy: "There's a reason all of this exists.", linkLabel: 'The Story →', linkUrl: '/story' }
    ]
  },

  artistRoute: {
    eyebrow: 'FOR ARTISTS',
    heading: "The first fifty founding artists. You could be one of them.",
    body: 'No commission, no exclusivity, and nothing for you to build. Free for the founding year.',
    linkLabel: 'See how it works for artists →',
    linkUrl: '/collaborate'
  },

  collective: {
    kicker: 'Collective',
    heading: 'Something worth being part of.',
    body: "New designs, behind-the-scenes making, and the occasional reminder that you're doing better than you think. No noise. No pressure. Just the Anthology.",
    emailLabel: 'Email address',
    emailPlaceholder: 'Email address',
    emailFieldName: 'email',
    buttonLabel: 'Join the Collective',
    note: 'Occasional letters only. No noise. No pressure.',
    // Squarespace-only setup: this sends visitors to the Squarespace Collective page,
    // where the native Squarespace newsletter/email signup should collect the address.
    // When the final native Squarespace form endpoint is available, replace formAction with that endpoint.
    provider: 'squarespace-email-campaigns',
    formAction: '/collective',
    formMethod: 'get'
  },

  footer: {
    copyright: '© The Hope Anthology 2026',
    instagramUrl: 'https://www.instagram.com',
    privacyUrl: '/privacy',
    accessibilityUrl: '/accessibility',
    sellingUrl: '/why-we-sell-this-way'
  }
};
