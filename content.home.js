/*
  Hope Anthology homepage content
  EDIT THIS FILE for normal homepage changes: copy, image URLs, links, and button labels.
  Keep the punctuation marks, commas, and quote marks around each value.
*/
window.HA_HOME_CONTENT = {
  images: {
    logo: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/e789bc30-2f5c-4037-8190-a9355d3a8d20/home-logo-hope-anthology.jpg?content-type=image%2Fjpeg',
    star: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/1852dfa4-ea60-4e93-83b5-ac8ea2f0498d/home-footer-star-hope-anthology.png?content-type=image%2Fpng',
    hero: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/4a154e4b-4dd8-438b-9c68-07d7037c4637/the-hope-anthology-art-for-everyday-human-home.jpg?content-type=image%2Fjpeg',
    keep: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/18cea152-1a12-4535-8cef-3099aab45bd5/home-panel-to-keep-symbolic-art.jpg?content-type=image%2Fjpeg',
    make: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/f8b5d4d6-304b-4edf-aa13-4c87597d4873/home-panel-to-make-stained-glass-patterns-luna.jpg?content-type=image%2Fjpeg',
    why: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/5171904f-5f1a-405f-80af-ff1199448f4e/home-panel-story-family-making-table.jpg?content-type=image%2Fjpeg',
    gather: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/96111767-d686-472f-a2ea-f375d877103e/to-gather-hero-group-craft-workshop-the-hope-anthology.jpg?content-type=image%2Fjpeg'
  },

    navigation: [
    { label: 'To Keep', url: '/to-keep' },
    { label: 'To Make', url: '/to-make' },
    { label: 'To Gather', url: '/to-gather' },
    { label: 'The Story', url: '/story' }
  ],

  hero: {
    eyebrow: 'The Hope Anthology',
    imageAlt: 'A collage of art and making: framed letter prints reading Knowing, Enough and Soar, a fox print, a stained glass sunflower and a leaf suncatcher in a sunny window, a stained glass fox in progress, the word Rise drawn in outline, and a hand writing Breathe in a notebook beside a pot of coloured pencils.',
    srTitle: 'The Hope Anthology — Art to keep, make and be part of',
    headlineHtml: 'Art to <em>keep</em>, <em>make</em> and <span class="ha-v3-nowrap"><em>be part</em> of</span>.',
    body: '',
    bodyParagraphs: [
      "Things to keep that lift you, anchor you, or simply stay with you. Things to make for the joy of it, or when you need something to get lost in. Things to do together, with your hands, your voice, your body or your imagination.",
      "And sometimes, when words don't work, something else might."
    ],
    bodyTagline: '',
    cta1Label: 'To Keep →',
    cta1Url: '/to-keep',
    cta2Label: 'To Make →',
    cta2Url: '/to-make',
    cta3Label: 'To Gather →',
    cta3Url: '/to-gather',
    buttonStyle: 'ghost'
  },

  intro: {
    backgroundImageKey: 'hero',
    primaryButtonLabel: 'To Keep →',
    primaryButtonUrl: '/to-keep',
    secondaryButtonLabel: 'Read the story →',
    secondaryButtonUrl: '/story',
    bodyHtml: 'The Hope Anthology brings together <em>independent artists</em>, <em>makers</em> and <em>creative</em> people — and the people who might <em>find something</em> in what they do. A collection by <em>many hands</em> and <em>minds</em>. All curated for the <em>beautiful, complicated</em> parts of being <em>human</em>.',
    kicker: ''
  },

  worlds: {
    kicker: 'CURATED BY HUMANS. FOR HUMANS.',
    heading: "What's here for you",
    panels: [
      { label: 'To Keep', tone: 'keep', imageKey: 'keep', alt: 'Hope Anthology art to keep', copy: 'Art that means something to you, whether you know exactly why or not.', linkLabel: 'To Keep →', linkUrl: '/to-keep' },
      { label: 'To Make', tone: 'make', imageKey: 'make', alt: 'Hope Anthology stained glass making project', copy: 'Art you can make for the joy of it, or when you need something to get lost in.', linkLabel: 'To Make →', linkUrl: '/to-make' },
      { label: 'To Gather', tone: 'gather', imageKey: 'gather', alt: 'Four people sit around a paint-spattered workshop table, heads down and concentrating as they decorate round wooden discs with bird designs, using brushes, small tools and pieces of eggshell.', copy: 'Art that happens with you in it, in your own way.', linkLabel: 'To Gather →', linkUrl: '/to-gather' }
    ]
  },

  artistRoute: {
    eyebrow: 'FOR ARTISTS',
    heading: "I'm always looking for artists who believe in what Hope is trying to do",
    body: 'No commission, no exclusivity, and nothing for you to build.',
    linkLabel: 'See how it works for artists →',
    linkUrl: '/for-artists'
  },

  collective: {
    kicker: 'Collective',
    heading: 'Something worth being part of.',
    body: "New work, behind-the-scenes glimpses, and the occasional reminder that you're doing better than you think. No noise. No pressure. Just the Anthology.",
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
  }
};
