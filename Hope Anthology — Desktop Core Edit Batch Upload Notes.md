# Hope Anthology — Desktop Core Edit Batch Upload Notes

## What changed

This batch updates the desktop homepage template to address the header logo, hidden H1, navigation colour, CTA arrows, linked module images, reusable newsletter form, and footer star treatment.

| Area | Change made | Status |
|---|---|---|
| Header logo | Removed the forced circular crop and set the logo to `object-fit: contain` inside the 72px teal header bar. | Done |
| Visible wordmark | Removed the visible “The Hope Anthology” wordmark from the header. | Done |
| Hidden H1 | Added a screen-reader-only H1 inside the home/logo link: “The Hope Anthology — Symbolic art and meaningful making”. | Done |
| Navigation | Header nav links now use the white/cream default state, with brighter white and underline on hover/focus. | Done |
| CTA arrows | CTA arrows are now inserted automatically by the renderer across hero buttons, panel links, collection links, and the newsletter button. | Done |
| Module images | All six module/collection images are linked to the same destinations as their matching CTAs. | Done |
| CTA hover | Secondary and inline CTAs use underline/focus behaviour, with a subtle arrow movement. | Done |
| Newsletter | A reusable, accessible email form has been added and configured for the Squarespace route, with `provider`, `formAction`, `formMethod`, and field-name settings in `content.home.js`. | Squarespace-ready setup done |
| Footer star | A temporary transparent PNG asset has been generated and referenced from `content.home.js`. | Done, provided the asset is uploaded/committed |

## Files to upload/commit

Upload or commit these files to the GitHub Pages repository, preserving the folder structure exactly:

| File | Destination |
|---|---|
| `ha-home.js` | Repository root, replacing the current file |
| `content.home.js` | Repository root, replacing the current file |
| `styles.css` | Repository root, replacing the current file |
| `assets/hope-anthology-footer-star-transparent.png` | `assets/` folder in the same repository |

The ZIP package `hope-anthology-desktop-core-edits.zip` contains all required files plus the validation notes.

## Squarespace newsletter note

The newsletter form is now configured for the Squarespace-only route Theresa chose:

```js
provider: 'squarespace-email-campaigns',
formAction: '/collective',
formMethod: 'get'
```

This keeps everything within Squarespace rather than routing subscribers to Mailchimp, Flodesk, ConvertKit, or any other external provider. At this stage, the homepage form sends the visitor to the Squarespace Collective page with their email field value, so the native Squarespace newsletter/email signup block should live there and perform the actual subscriber collection. When the final native Squarespace form endpoint is available from the live Squarespace block, `formAction` can be replaced with that endpoint so the homepage module submits directly into Squarespace Email Campaigns.

## Validation completed

The updated JavaScript passed syntax checks with `node --check`. A local root-path browser preview confirmed that the custom homepage mounts, the logo is no longer cropped into an oval/circle, the hidden H1 is present but visually hidden, the nav computed colour is `rgb(242, 243, 239)`, six module/collection images are linked, ten CTA arrows render automatically, and the newsletter form now reports `data-provider="squarespace-email-campaigns"`.
