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
    logo: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/1f3bfb43-558e-4262-b2e2-d4e3b56bd77e/01-the-hope-anthology.jpg?content-type=image%2Fjpeg',
    star: 'https://images.squarespace-cdn.com/content/6a258894c750534b28845855/470da432-cdf9-45be-b3ba-2e9599ce5f4f/04-the-hope-anthology-botanical-star.png?content-type=image%2Fpng',
  },

    navigation: [
    { label: 'To Keep', url: '/to-keep' },
    { label: 'To Make', url: '/to-make' },
    { label: 'The Story', url: '/story' },
    { label: 'For Artists', url: '/for-artists' },
    { label: 'Collective', url: '/collective' }
  ],

  footer: {
    copyright: '© The Hope Anthology 2026',
    instagramUrl: 'https://www.instagram.com',
    privacyUrl: '/privacy',
    accessibilityUrl: '/accessibility',
    infoTemplateUrl: '/info-page-template'
  },

  defaultContact: {
    heading: 'Contact',
    paragraphs: [
      'If you have any questions about this page, you are welcome to get in touch with The Hope Anthology.'
    ],
    links: [
      { label: 'Use the Collaborate form', url: '/for-artists' },
      { label: 'Email The Hope Anthology', url: 'mailto:hello@thehopeanthology.art' }
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
        lastUpdated: 'Last updated: 8 September 2026'
      },
      intro: [
        'The short version: The Hope Anthology holds as little about you as it possibly can. If you join the Collective we have your email address. If you email us, we have your email. That is genuinely it — nothing is sold, nothing is shared with advertisers, and there is no tracking on this site.',
        'The longer version is below, because you are entitled to it.'
      ],
      sections: [
        {
          dividerBefore: true,
          heading: 'Who we are',
          paragraphs: [
            'The Hope Anthology, Bristol, UK.',
            { parts: [{ text: 'Email:', bold: true }, { text: ' hello@thehopeanthology.art' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'What we collect and why',
          paragraphs: [
            { parts: [{ text: 'If you join the Collective', bold: true }, { text: ', we collect your name and contact details, and a record of your consent — that is, the fact that you signed up and when.' }] },
            'We use it to send you the newsletter. Nothing else.',
            { parts: [{ text: 'If you contact us', bold: true }, { text: ', we collect your name and contact details, and the correspondence itself.' }] },
            'We use it to reply to you, and to keep enough of a record that we can follow up properly.',
            { parts: [{ text: 'We do not', bold: true }, { text: ' use cookies for analytics or tracking on this site. We do not collect information about your health, beliefs, or anything else in the categories the law treats as special. We do not build a profile of you.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'Our lawful bases',
          paragraphs: [
            'Under UK data protection law we have to have a "lawful basis" for using your information. There is a list of possible bases in the UK GDPR, and you can read more about them on the ICO\'s website.',
            { parts: [{ text: 'For the Collective newsletter: consent.', bold: true }, { text: ' You gave us permission after we told you what it was for. You can withdraw that consent at any time, and unsubscribing is the easiest way to do it.' }] },
            { parts: [{ text: 'For replying to your enquiry: legitimate interests.', bold: true }, { text: ' You contacted us and we need your details to answer. Our legitimate interest is responding to people who contact us with a question, enquiry or concern, and keeping a record of that correspondence so we can follow up.' }] },
            { parts: [{ text: 'For approaching artists and organisations, and for our "do not contact" list: legitimate interests.', bold: true }, { text: ' Our legitimate interest in the first is finding independent artists whose work belongs in the Anthology, and support organisations who might want to share it. Our legitimate interest in the second is making sure we never contact someone who has asked us not to.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'Your rights',
          paragraphs: [
            'Which basis we rely on can affect which of these apply. You can read more about your rights, and the exemptions that sometimes apply, on the ICO\'s website.'
          ],
          listItems: [
            { parts: [{ text: 'Access', bold: true }, { text: ' — you can ask us for copies of your personal information, and for details about where we got it and who we share it with.' }] },
            { parts: [{ text: 'Rectification', bold: true }, { text: ' — you can ask us to correct information you think is wrong or incomplete.' }] },
            { parts: [{ text: 'Erasure', bold: true }, { text: ' — you can ask us to delete your personal information.' }] },
            { parts: [{ text: 'Restriction', bold: true }, { text: ' — you can ask us to limit how we use it.' }] },
            { parts: [{ text: 'Objection', bold: true }, { text: ' — you can object to us processing your information.' }] },
            { parts: [{ text: 'Portability', bold: true }, { text: ' — you can ask us to transfer what you gave us to you or to another organisation.' }] },
            { parts: [{ text: 'Withdrawing consent', bold: true }, { text: ' — where consent is our basis, you can withdraw it at any time.' }] }
          ],
          trailingParagraphs: [
            'If you make a request, we must respond without undue delay and in any event within one month.',
            { parts: [{ text: 'To make a request, email ', bold: false }, { text: 'hello@thehopeanthology.art', bold: true }, { text: '.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'Where we get your information from',
          paragraphs: [
            { parts: [{ text: 'Directly from you', bold: true }, { text: ' — when you sign up to the Collective, or when you contact us.' }] },
            { parts: [{ text: 'From publicly available sources', bold: true }, { text: ' — when we are looking for artists, makers or organisations to approach, we sometimes find names and public contact details from shops, websites and public profiles. If we have found your details this way, we will tell you so the first time we contact you.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'How long we keep it',
          paragraphs: [
            { parts: [{ text: 'Collective subscribers', bold: true }, { text: ' — we keep your email address until you unsubscribe. After that it is deleted within 30 days.' }] },
            { parts: [{ text: 'Enquiries', bold: true }, { text: ' — we keep your message and contact details for 3 years after the conversation ends, then delete them. This is so that if you get in touch with us again, we still have the context of what we talked about last time.' }] },
            { parts: [{ text: 'Artists and organisations we have approached', bold: true }, { text: ' — where we have found public contact details in order to get in touch, we keep them for up to 3 years so we can follow up, unless you ask us not to. We review the list at least once a year and delete anything that is no longer relevant.' }] },
            { parts: [{ text: 'If you ask us not to contact you again', bold: true }, { text: ' — we delete everything else we hold about you, but we keep your name and email address on a short "do not contact" list. We keep that indefinitely, because it is the only way we can be sure we do not approach you again by mistake. It holds nothing but your name, your email address, and the date you asked. You can ask us to remove that too, though it does mean we might not recognise you if we come across your work again later.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'Who we share it with',
          paragraphs: [
            { parts: [{ text: 'Squarespace.', bold: true }, { text: ' They are our data processor, which means they handle information on our behalf as part of the service they provide to us.' }] },
            'Squarespace hosts our website and runs our email newsletter. They store the email addresses of people who sign up to the Collective, and send the newsletter on our behalf.',
            'That is the only organisation we share your information with. We do not sell it, and we do not pass it to advertisers, data brokers or anyone else.'
          ]
        },
        {
          dividerBefore: true,
          heading: 'Sharing information outside the UK',
          paragraphs: [
            'Where necessary, our data processors may share personal information outside of the UK. When doing so, they comply with the UK GDPR, making sure appropriate safeguards are in place.',
            { parts: [{ text: 'Organisation name:', bold: true }, { text: ' Squarespace, Inc.' }] },
            { parts: [{ text: 'Category of recipient:', bold: true }, { text: ' Website hosting and email marketing provider' }] },
            { parts: [{ text: 'Country the personal information is sent to:', bold: true }, { text: ' United States' }] },
            { parts: [{ text: 'How the transfer complies with UK data protection law:', bold: true }, { text: ' Addendum to the EU Standard Contractual Clauses (SCCs). Squarespace uses the European Commission Standard Contractual Clauses together with the UK\'s International Data Transfer Addendum as the legal basis for transferring personal data to the United States.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'How to complain',
          paragraphs: [
            { parts: [{ text: 'If you have any concerns about how we have used your information, please tell us. Email ', bold: false }, { text: 'hello@thehopeanthology.art', bold: true }, { text: ' and we will look into it.' }] },
            'If you are still unhappy after raising it with us, you can complain to the Information Commissioner\'s Office.',
            { lines: [{ parts: [{ text: 'Information Commissioner\'s Office', bold: true }] }, 'Wycliffe House', 'Water Lane', 'Wilmslow', 'Cheshire', 'SK9 5AF'] },
            { parts: [{ text: 'Helpline:', bold: true }, { text: ' 0303 123 1113' }] },
            { parts: [{ text: 'Website:', bold: true }, { text: ' https://www.ico.org.uk/make-a-complaint' }] }
          ]
        }
      ],
      contact: false
    },

    '/accessibility': {
      page: {
        eyebrow: 'Accessibility',
        title: 'Accessibility',
        lastUpdated: 'Last updated: 8 September 2026'
      },
      intro: [
        'This site is for people who are having a hard time, among others. It would be a poor sort of anthology if some of them couldn\'t use it.',
        'So this page is an honest account: what has been done, what is known to be imperfect, and how to tell me when something doesn\'t work. It is not a claim that everything is fine.'
      ],
      sections: [
        {
          dividerBefore: true,
          heading: 'What I aim for',
          paragraphs: [
            'The Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. That is the standard UK public sector websites are held to. The Hope Anthology isn\'t a public body and isn\'t legally required to meet it, but it is the right target and it is what I am working towards.',
            'I have not had the site independently audited against it. When I say something works, I mean I have checked it myself.'
          ]
        },
        {
          dividerBefore: true,
          heading: 'What is in place',
          paragraphs: [
            { parts: [{ text: 'Every image has alternative text.', bold: true }, { text: ' Every photograph of an artist\'s work carries a written description, so if you use a screen reader, or if images don\'t load, you still get told what is there. This was checked page by page rather than assumed.' }] },
            { parts: [{ text: 'Headings are structured properly.', bold: true }, { text: ' Each page has one main heading and a logical order beneath it, so you can navigate by headings rather than reading through everything.' }] },
            { parts: [{ text: 'Links say where they go.', bold: true }, { text: ' "See Nell\'s work" rather than "click here". If you pull up a list of links on a page, they should make sense on their own.' }] },
            { parts: [{ text: 'The content is readable without JavaScript.', bold: true }, { text: ' The site is built with JavaScript, which historically meant that anything not running it — some assistive tools, some browsers, some crawlers — saw almost nothing. Every page now carries a plain-text version of its content underneath, so the words are there regardless.' }] },
            { parts: [{ text: 'No tracking, no cookie banner.', bold: true }, { text: ' The site sets only the cookies it needs to function. There is no pop-up asking you to make a decision before you can read anything.' }] },
            { parts: [{ text: 'No autoplay, no motion.', bold: true }, { text: ' Nothing moves, flashes or plays on its own.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'What is not right yet',
          paragraphs: [
            'I would rather tell you than let you find out.',
            { parts: [{ text: '"Skip to content" doesn\'t currently work.', bold: true }, { text: ' The link is there, but because of how the site is built, it doesn\'t land where it should. If you navigate by keyboard, you will have to tab through the navigation on each page. This is a structural problem and a bigger fix than it looks, but it is scheduled.' }] },
            { parts: [{ text: 'The site has no main landmark.', bold: true }, { text: ' For the same reason as above, if you navigate by landmarks, you won\'t find one. Headings still work.' }] },
            { parts: [{ text: 'The mobile menu needs JavaScript.', bold: true }, { text: ' On a narrow screen, the menu button won\'t open without it. The full navigation is available in the footer of every page as a fallback.' }] },
            { parts: [{ text: 'Nothing has been tested with a real screen reader by a real user.', bold: true }, { text: ' I have checked the code. That is not the same thing, and I know it.' }] }
          ]
        },
        {
          dividerBefore: true,
          heading: 'Tell me when something doesn\'t work',
          paragraphs: [
            'This is the part I actually want from this page.',
            'If something is hard to use, unclear, or simply doesn\'t work for you, please tell me. You don\'t need to be technical about it, and you don\'t need to justify it.',
            { parts: [{ text: 'Email:', bold: true }, { text: ' hello@thehopeanthology.art' }] },
            'It helps if you can say which page you were on and what you were trying to do. If you are comfortable saying what device or assistive technology you were using, that helps too — but only if you want to.',
            'I read these myself and I will reply.'
          ]
        },
        {
          dividerBefore: true,
          heading: 'If you need something in a different format',
          paragraphs: [
            'If there is something on this site you would like in another form — larger text, plain text, read aloud, or anything else — ask. I would rather find a way than have you go without.'
          ]
        },
        {
          dividerBefore: true,
          paragraphs: [
            { parts: [{ text: 'This statement describes the site as it is, not as I would like it to be. It will be updated as things are fixed.', italic: true }] }
          ]
        }
      ],
      contact: false
    }
  }
};
