/*
  Hope Anthology homepage content
  EDIT THIS FILE for normal homepage changes: copy, image URLs, links, and button labels.
  Keep the punctuation marks, commas, and quote marks around each value.
*/
window.HA_HOME_CONTENT = {
  images: {
    logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/qCxBNIjwUhdazFfG.jpg',
    star: 'https://theresahaskinsuk-bit.github.io/hope-anthology-site/assets/hope-anthology-footer-star-transparent.png',
    hero: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/HGkesneQnMGpdSSC.jpg',
    keep: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/IJCQxZYmcSwNTWvS.jpg',
    make: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/hBVZHGIOxZpRsXVe.jpg',
    why: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/rPGNseNwiBqKhbVZ.jpg',
    woodland: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/YuJYtKipiqoszDua.jpg',
    alphabet: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/HeOgrQASgDmnRJqf.jpg',
    glass: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/WIsTuKbrFNrEbKcI.jpg'
  },

  navigation: [
    { label: 'The Collections', url: '/collections' },
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
