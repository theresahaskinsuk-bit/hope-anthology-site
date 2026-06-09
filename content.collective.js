/*
  Hope Anthology Collective page content
  EDIT THIS FILE for normal Collective page changes: copy, links, and form settings.
  Keep the punctuation marks, commas, and quote marks around each value.
*/
window.HA_COLLECTIVE_CONTENT = {
  images: {
    logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/qCxBNIjwUhdazFfG.jpg',
    star: 'https://theresahaskinsuk-bit.github.io/hope-anthology-site/assets/hope-anthology-footer-star-transparent.png'
  },

  navigation: [
    { label: 'The Collections', url: '/collections' },
    { label: 'The Story', url: '/story' },
    { label: 'Collaborate', url: '/collaborate' },
    { label: 'Collective', url: '/collective', active: true }
  ],

  hero: {
    eyebrow: 'Collective',
    headlineHtml: 'Something worth being <em>part of.</em>'
  },

  body: [
    'This is not a newsletter.',
    "Well — it is technically a newsletter. But it doesn't feel like one from the inside.",
    'The Collective is just the people who want to stay close to the Anthology as it grows. Who want to hear about new work before anyone else does. Who liked what they read on The Story page and thought — yeah, I want more of that.',
    "What you'll actually get:",
    'New designs when they arrive. The occasional thought that felt worth sharing. A behind-the-scenes moment from the making. And the honest truth about how this whole slightly terrifying, very exciting thing is going.',
    "Not on a schedule. Not every Tuesday at 9am. Just when there's something genuinely worth saying.",
    "(Which, given everything that's been going on behind that sentence — will probably be quite a lot.)",
    "No spam. No hard sell. Unsubscribe whenever you like and we'll never mention it again.",
    "If that sounds like your kind of thing — come in. Even if it's just a couple of you.",
    "That's always been more than enough."
  ],

  form: {
    heading: 'Join the Collective',
    emailLabel: 'Email address',
    emailPlaceholder: 'Your email address',
    emailFieldName: 'email',
    consentName: 'consent',
    consentLabel: 'I agree to The Hope Anthology storing my details to send occasional emails. I can unsubscribe at any time.',
    buttonLabel: 'Join the Collective',
    note: 'No spam. Unsubscribe whenever. We mean that.',
    provider: 'squarespace-email-campaigns',
    formAction: '/collective',
    formMethod: 'get'
  },

  footer: {
    copyright: '© The Hope Anthology 2026',
    instagramUrl: 'https://www.instagram.com',
    privacyUrl: '/privacy',
    accessibilityUrl: '/accessibility',
    whySellUrl: '/why-we-sell-this-way'
  }
};
