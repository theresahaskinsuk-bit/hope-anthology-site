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
    make: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/87b77105-e104-46b9-9a52-6ce6020a42db/home-panel-to-make-stained-glass-patterns.jpg?content-type=image%2Fjpeg',
    why: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/5171904f-5f1a-405f-80af-ff1199448f4e/home-panel-story-family-making-table.jpg?content-type=image%2Fjpeg',
    woodland: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/cf4d1bc3-53df-4e5e-89db-b7f81fe4780c/home-card-woodland-folk-collection.jpg?content-type=image%2Fjpeg',
    alphabet: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/e2a2c195-ccee-4a99-a325-6c4637e5be17/home-card-meaning-alphabet-collection.jpg?content-type=image%2Fjpeg',
    glass: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/4d6c1011-8dfc-46d3-a7c8-14b636cafb68/home-card-stained-glass-patterns-collection.jpg?content-type=image%2Fjpeg'
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
    body: "Things to keep that lift you, anchor you, or just make you smile. Things to make that give you space to slow down and just be. It all begins with a feeling — and it's all made for you.",
    primaryButtonLabel: 'Explore the Anthology →',
    primaryButtonUrl: '/collections',
    secondaryButtonLabel: 'Read the story',
    secondaryButtonUrl: '/story'
  },

  intro: {
    backgroundImageKey: 'hero',
    primaryButtonLabel: 'Explore the Anthology →',
    primaryButtonUrl: '/collections',
    secondaryButtonLabel: 'Read the story →',
    secondaryButtonUrl: '/story',
    bodyHtml: 'The Hope Anthology brings together material suppliers, designers, hobbyists, independent makers, artists — all rooted in the belief that when different crafts <em>come together</em>, something <em>greater is made.</em> A curated collection by many hands.<br>William Morris believed that too — and much like here, he held that the things we make and live with should <em>carry meaning</em>, and that the people who make them should <em>be valued.</em>',
    kicker: 'Two worlds. One anthology.'
  },

  worlds: {
    kicker: 'Two worlds. One anthology.',
    heading: "What's here for you",
    panels: [
      { label: 'To Keep', tone: 'keep', imageKey: 'keep', alt: 'Hope Anthology art to keep', copy: 'Art you own that shows up for you every day.', linkLabel: 'To Keep →', linkUrl: '/collections' },
      { label: 'To Make', tone: 'make', imageKey: 'make', alt: 'Hope Anthology stained glass making project', copy: 'Make something. Just for you. Just because.', linkLabel: 'To Make →', linkUrl: '/collections' },
      { label: 'Behind it all', tone: 'why', imageKey: 'why', alt: 'Hope Anthology story and family making table', copy: "There's a reason all of this exists.", linkLabel: 'The Story →', linkUrl: '/story' }
    ]
  },

  collections: {
    heading: 'Have a look around',
    linkLabel: 'The full Anthology →',
    linkUrl: '/collections',
    cards: [
      { kicker: 'To Keep', title: 'Woodland Folk', imageKey: 'woodland', alt: 'Woodland Folk collection', copy: 'Six creatures. Six characters. Each one a mirror for something in you.', linkLabel: 'View collection →', linkUrl: '/collections' },
      { kicker: 'To Keep', title: 'Meaning Alphabet', imageKey: 'alphabet', alt: 'Meaning Alphabet collection', copy: 'A letter. A word. A reminder to carry with you.', linkLabel: 'View collection →', linkUrl: '/collections' },
      { kicker: 'To Make', title: 'Stained glass', imageKey: 'glass', alt: 'Stained glass patterns collection', copy: 'Beginner-friendly patterns designed for the joy of making.', linkLabel: 'View collection →', linkUrl: '/collections' }
    ]
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
