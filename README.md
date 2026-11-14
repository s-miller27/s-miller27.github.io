# Stephen Miller resume site

Plain HTML, CSS, and JavaScript. No build step, no dependencies.

## Files

- `index.html` – all content
- `css/styles.css` – styles (single dark theme; the `prefers-color-scheme` block is commented out)
- `js/menu.js` – mobile menu behavior
- `js/scroll.js` – current-section highlight in the nav, reveal on scroll, progress bar, timeline fill (motion parts are skipped under `prefers-reduced-motion`)
- `js/particles.js` – decorative dots-and-lines background behind the hero (still image under `prefers-reduced-motion`)
- `assets/Stephen-Miller-Resume.pdf` – the resume download
- `resume-print/resume.html` – print-styled resume used to make the PDF. Open it in a browser, press Ctrl+P, choose **Save as PDF** with headers and footers off, and save over `assets/Stephen-Miller-Resume.pdf`. Keep its text in sync with `index.html`.

## Preview locally

Open `index.html` in a browser.

## Publish with GitHub Pages

1. Create a public repository named `<username>.github.io` (your GitHub username).
2. Upload or push these files to the `main` branch, with `index.html` at the repository root.
3. In the repository, go to **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
4. After a minute or two the site is live at `https://<username>.github.io/`.

## Update content through Git

```bash
git add .
git commit -m "Update resume content"
git push
```

Edit text in `index.html`. Search for `[PLACEHOLDER` to find every value still to be filled in, and replace the whole bracketed text. Replace `assets/Stephen-Miller-Resume.pdf` with a new file of the same name to update the download.
