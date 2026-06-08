# Hope Anthology Site Files

This repository hosts the custom Hope Anthology homepage files used by Squarespace Code Injection.

## Files

| File | What it does | Edit normally? |
|---|---|---|
| `content.home.js` | Homepage copy, image URLs, button labels, and links | **Yes — this is the main editing file** |
| `ha-home.js` | Main homepage rendering script loaded by Squarespace | Usually no |
| `styles.css` | Homepage design/styling | Only for design changes |
| `README.md` | These notes | Yes, if helpful |

## Squarespace Footer Code

After GitHub Pages is enabled, Squarespace Footer Code Injection should use this structure:

```html
<!-- Hope Anthology custom homepage -->
<script src="https://YOUR-GITHUB-USERNAME.github.io/hope-anthology-site/ha-home.js?v=1"></script>
```

Replace `YOUR-GITHUB-USERNAME` with your GitHub username.

## Simple Editing Rule

For normal content updates, edit `content.home.js`. Increase the `?v=1` number in Squarespace Footer Code Injection after important changes, for example `?v=2`, so browsers load the newest file.
