window.HA_COLLECTIONS_CONTENT = {
  images: {
    logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/qCxBNIjwUhdazFfG.jpg',
    star: '/assets/hope-anthology-footer-star-transparent.png',
    doorKeep: '/assets/collections-door-keep.jpg',
    doorMake: '/assets/collections-door-make.jpg',
    woodland: '/assets/collections-woodland-folk.jpg',
    alphabet: '/assets/collections-meaning-alphabet.jpg',
    anchors: '/assets/collections-everyday-anchors.jpg',
    angelNumbers: '/assets/collections-angel-numbers.jpg',
    farmFolk: '/assets/collections-farm-folk.jpg',
    stainedGlass: '/assets/collections-stained-glass.jpg'
  },

  navigation: [
    { label: 'The Collections', url: '/collections' },
    { label: 'The Story', url: '/story' },
    { label: 'Collaborate', url: '/collaborate' },
    { label: 'Collective', url: '/collective' }
  ],

  page: {
    eyebrow: 'The Collections',
    headlineHtml: 'Two worlds. One <em>anthology.</em>',
    intro: 'Everything in the Hope Anthology belongs to one of two worlds. Things you keep — prints and finished pieces to live with. Things you make — patterns and designs to build with your hands.'
  },

  doors: [
    {
      world: 'World one',
      titleHtml: 'To <em>Keep</em>',
      body: 'Prints and finished pieces. Designed to live on your walls, your shelves, your surfaces. Things worth holding onto.',
      count: '5 collections · Prints & finished goods',
      arrow: 'Scroll to explore ↓',
      imageKey: 'doorKeep',
      alt: 'Hands holding the Enough art print — a framed Meaning Alphabet E for Enough by The Hope Anthology',
      url: '#to-keep'
    },
    {
      world: 'World two',
      titleHtml: 'To <em>Make</em>',
      body: 'Patterns and making guides. Designs that become something in your hands. Currently stained glass — more crafts coming.',
      count: '1 collection · More mediums arriving',
      arrow: 'Scroll to explore ↓',
      imageKey: 'doorMake',
      alt: 'Luna moth stained glass pattern pieces on a green cutting mat — a Hope Anthology pattern ready to make',
      url: '#to-make'
    }
  ],

  keepWorld: {
    id: 'to-keep',
    eyebrow: 'To Keep',
    heading: 'Prints & finished pieces',
    intro: 'Five collections of prints and designs — for your walls, your shelves, the surfaces of your life. Each one began with a feeling worth keeping.',
    collections: [
      {
        title: 'Woodland Folk',
        body: 'Six creatures. Six characters. Each one a mirror for something in you. The fox turns challenge into grace. The owl trusts the silence between moments. The hare moves with the rhythm of life. Which one are you today?',
        imageKey: 'woodland',
        alt: 'The Hope Anthology Woodland Folk collection — Fox, Hare, Badger, Squirrel, Owl and Otter in terracotta on white',
        linkLabel: 'Enter this collection →',
        linkUrl: '/collections/woodland-folk'
      },
      {
        title: 'Meaning Alphabet',
        body: 'A letter. A word. A reminder to carry with you. Every letter in the alphabet holds something worth saying — these are the ones worth putting on your wall. Find your letter. Or the one someone needs.',
        imageKey: 'alphabet',
        alt: 'The Hope Anthology Meaning Alphabet collection — botanical letter prints in teal and gold on cream',
        linkLabel: 'Enter this collection →',
        linkUrl: '/collections/meaning-alphabet'
      },
      {
        title: 'Everyday Anchors',
        body: 'Words that hold you steady when things get wobbly. Not motivational posters — tools. Things to look at when you need to remember something true. For the walls you see every day.',
        imageKey: 'anchors',
        alt: 'The Hope Anthology Everyday Anchors collection — bold typographic word prints in black and white',
        linkLabel: 'Enter this collection →',
        linkUrl: '/collections/everyday-anchors'
      },
      {
        title: 'Angel Numbers',
        body: "Trust what keeps showing up. These aren't coincidences. Each number carries a meaning, a mood, a message for wherever you are right now. Which one is following you?",
        imageKey: 'angelNumbers',
        alt: 'The Hope Anthology Angel Numbers collection — angel wing prints in various colours on cream background',
        linkLabel: 'Enter this collection →',
        linkUrl: '/collections/angel-numbers'
      },
      {
        title: 'Farm Folk',
        body: "Some people are just a Goat. Others are absolutely a Chicken. You'll know immediately which one you or they are. Each piece in Farm Folk is a character you'll recognise immediately. Whatever your Farm Folk animal turns out to be — it's always a lovely thing. Find yours.",
        imageKey: 'farmFolk',
        alt: 'The Hope Anthology Farm Folk collection — Goat, Highland Cow, Pig, Donkey and Chicken in olive green botanical style',
        linkLabel: 'Enter this collection →',
        linkUrl: '/collections/farm-folk',
        note: 'More To Keep collections arriving. Join the Collective to hear first.'
      }
    ]
  },

  makeWorld: {
    id: 'to-make',
    eyebrow: 'To Make',
    heading: 'Patterns & making guides',
    intro: 'Designs that become something in your hands. Buy the pattern, make the piece, keep it or give it. Currently stained glass — more craft mediums on the way.',
    collection: {
      title: 'Stained glass',
      body: 'Beginner-friendly patterns designed for the joy of making. Each one is a digital pattern — sized, structured, and tested so they actually work in glass. Light through your window, made by your hands.',
      imageKey: 'stainedGlass',
      alt: 'Hope Anthology stained glass bee pattern — pattern sheets on workbench and finished bee suncatcher in a window with flowers',
      linkLabel: 'Enter this collection →',
      linkUrl: '/collections/stained-glass',
      secondaryLabel: 'Shop on Etsy',
      secondaryUrl: 'https://www.etsy.com'
    },
    coming: [
      { title: 'Felt & embroidery', body: 'The Woodland Folk animals in felt. Small enough to make in an evening.', tag: 'in development' },
      { title: 'Paper cutting', body: 'The botanical star. The fox in paper. Delicate and considered.', tag: 'coming soon' },
      { title: 'Your medium?', body: "If you make in a medium that suits the Anthology — let's talk.", linkLabel: 'Collaborate →', linkUrl: '/collaborate' }
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
    provider: 'squarespace-email-campaigns',
    formAction: '/collective',
    formMethod: 'get'
  },

  footer: {
    copyright: '© The Hope Anthology 2026',
    instagramUrl: 'https://www.instagram.com',
    privacyUrl: '/privacy',
    termsUrl: '/terms'
  }
};
