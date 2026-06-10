/*
  Hope Anthology reusable information page content
  EDIT THIS FILE for privacy, accessibility, template copy, links, and page metadata.

  The renderer chooses the correct page by matching the current Squarespace URL path.
  Supported paths in this file are:
  - /info-page-template
  - /privacy
  - /accessibility

  Keep the punctuation marks, commas, and quote marks around each value.
*/
window.HA_INFO_TEMPLATE_CONTENT = {
  images: {
    logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663685783666/qCxBNIjwUhdazFfG.jpg',
    star: 'https://theresahaskinsuk-bit.github.io/hope-anthology-site/assets/hope-anthology-footer-star-transparent.png'
  },

  navigation: [
    { label: 'The Collections', url: '/collections' },
    { label: 'The Story', url: '/story' },
    { label: 'Collaborate', url: '/collaborate' },
    { label: 'Collective', url: '/collective' }
  ],

  footer: {
    copyright: '© The Hope Anthology 2026',
    instagramUrl: 'https://www.instagram.com',
    privacyUrl: '/privacy',
    accessibilityUrl: '/accessibility',
    whySellUrl: '/why-we-sell-this-way',
    infoTemplateUrl: '/info-page-template'
  },

  defaultContact: {
    heading: 'Contact',
    paragraphs: [
      'If you have any questions about this page, you are welcome to get in touch with The Hope Anthology.'
    ],
    details: [
      'The Hope Anthology',
      'Bristol, UK'
    ],
    links: [
      { label: 'Use the Collaborate form', url: '/collaborate' },
      { label: 'Email The Hope Anthology', url: 'mailto:hello@thehopeanthology.com' }
    ]
  },

  pages: {
    '/info-page-template': {
      page: {
        eyebrow: 'Information page',
        title: 'Info page template',
        lastUpdated: 'Last updated: June 2026'
      },
      sections: [
        {
          heading: 'Section heading',
          paragraphs: [
            'This is placeholder copy for a simple information page. Replace this paragraph with the finished wording for the page Theresa wants to publish.',
            'The template is designed for clear, calm long-form pages such as privacy notes, accessibility information, terms, policies, frequently asked questions, or practical explanations.'
          ]
        },
        {
          heading: 'Another section heading',
          paragraphs: [
            'Use short paragraphs where possible. The page will automatically keep the same type scale, spacing, colours, and readable centered width as the rest of The Hope Anthology site.'
          ],
          listItems: [
            'List items are optional and styled automatically.',
            'Each section can have paragraphs, a list, or both.',
            'Delete this list if the finished page does not need one.'
          ]
        },
        {
          heading: 'Subsection or practical details',
          paragraphs: [
            'Add any practical information visitors need to understand before they act. The tone should stay plain, direct, and helpful.',
            'If this template is copied for a legal or policy page, replace all placeholder text before publishing.'
          ]
        }
      ]
    },

    '/privacy': {
      page: {
        eyebrow: 'Privacy policy',
        title: 'Privacy policy',
        lastUpdated: 'Last updated: June 2026'
      },
      sections: [
        {
          heading: 'Privacy',
          paragraphs: [
            'This page explains how The Hope Anthology handles information when you use this website, contact the project, enquire about a collaboration, or choose to hear from us.This privacy policy explains how The Hope Anthology handles information when you use this website, contact the project, enquire about a collaboration, or choose to hear from us.',
          ]
        },
        {
          heading: 'Information you choose to share',
          paragraphs: [
            'We may receive the information you choose to send through contact forms, collaboration enquiries, email messages, purchases, event enquiries, or newsletter sign-ups if those features are used on the site.'
          ],
          listItems: [
            'Your name and contact details, if you provide them.',
            'The content of your message or enquiry.',
            'Any practical details needed to respond to your request.'
          ]
        },
        {
          heading: 'How information is used',
          paragraphs: [
            'Information is used to respond to enquiries, manage collaborations, provide customer support, keep appropriate records, and maintain the website and services connected to The Hope Anthology.',
            'The Hope Anthology does not need visitors to create an account simply to read the website.'
          ]
        },
        {
          heading: 'Cookies and third-party services',
          paragraphs: [
            'The website may use platform features, analytics, embedded content, payment tools, newsletter tools, or social links provided by third-party services. These services may process technical data according to their own policies.',
            'Replace this placeholder with the final list of services used by the live website before publishing.'
          ]
        },
        {
          heading: 'Your choices',
          paragraphs: [
            'You can contact The Hope Anthology if you want to ask what information has been shared, correct details, request deletion where appropriate, or ask a privacy-related question.'
          ]
        }
      ],
      contact: {
        heading: 'Privacy contact',
        paragraphs: [
          'For privacy questions, please contact The Hope Anthology and include enough detail for us to understand your request.'
        ],
        details: [
          'The Hope Anthology',
          'Bristol, UK'
        ],
        links: [
          { label: 'Email The Hope Anthology', url: 'mailto:hello@thehopeanthology.com' },
          { label: 'Use the Collaborate form', url: '/collaborate' }
        ]
      }
    },

    '/accessibility': {
      page: {
        eyebrow: 'Accessibility',
        title: 'Accessibility',
        lastUpdated: 'Last updated: June 2026'
      },
      sections: [
        {
          heading: 'Our accessibility approach',
          paragraphs: [
            'The Hope Anthology aims to make this website calm, readable, and practical for as many visitors as possible.',
            'The site design prioritises clear typography, strong contrast, straightforward navigation, and pages that work well on different screen sizes.'
          ]
        },
        {
          heading: 'What we are working to support',
          paragraphs: [
            'The website has been designed with accessibility in mind, including readable page widths and consistent navigation.'
          ],
          listItems: [
            'Readable text with strong colour contrast.',
            'Keyboard-accessible links and navigation where possible.',
            'Responsive layouts for mobile, tablet, and desktop screens.',
            'Plain language and clear page structure.'
          ]
        },
        {
          heading: 'Known limitations',
          paragraphs: [
            'Some areas may depend on third-party platforms, embedded tools, or older content that is still being improved. The Hope Anthology will keep reviewing the site and making practical improvements over time.'
          ]
        },
        {
          heading: 'Feedback',
          paragraphs: [
            'If you find a part of the website difficult to use, please get in touch. Helpful details include the page address, what you were trying to do, and the device or assistive technology you were using if you are comfortable sharing that.'
          ]
        }
      ],
      contact: {
        heading: 'Accessibility contact',
        paragraphs: [
          'Accessibility feedback is welcome. Please contact The Hope Anthology if something is unclear, hard to navigate, or not working as expected.'
        ],
        details: [
          'The Hope Anthology',
          'Bristol, UK'
        ],
        links: [
          { label: 'Email The Hope Anthology', url: 'mailto:hello@thehopeanthology.com' },
          { label: 'Use the Collaborate form', url: '/collaborate' }
        ]
      }
    }
  }
};
