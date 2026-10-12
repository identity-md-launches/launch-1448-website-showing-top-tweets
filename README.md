# The Pond

A responsive, dark green website collecting eight public posts about IdentityMD, with custom AI-equipped Pepe artwork. Search by text or author, filter by topic, sort the collection, open the original posts on X, and save favorites in this browser.

**The ready-to-serve website is in `dist/`.** Source, exact dependency versions, and `package-lock.json` accompany it. The export needs no backend, API key, wallet, remote font, or X embed.

## Install and develop

Use Node.js 22.12 or newer and npm. From a normal development checkout:

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. Dependencies are development tools; never include `node_modules/`, package caches, or dependency archives in a submission or static upload.

## Typecheck, rebuild, and preview

```sh
npm run typecheck
npm run build
npm run preview
```

The build replaces `dist/`. Preview serves that production export. To preview without installing anything, use `python3 -m http.server 4173 --directory dist` and open `http://localhost:4173/`. Use an HTTP server rather than opening `index.html` with `file://`.

Vite uses `base: './'`. HTML, CSS, fonts, illustrations, and JavaScript resolve relative to the export. The app uses hash navigation (`#feed`, `#saved`), so it also works beneath a gateway subpath without server-side route rewrites. Serve a directory URL with its trailing slash, or its explicit `index.html`.

## Publish the static export

Upload the **contents of `dist/`**, preserving `assets/`, `fonts/`, and `images/`, to a static host or an IPFS directory. `dist/index.html` is the entry point. The assignment publisher consumes the supplied export rather than rebuilding it. No publishing command was run during this task.

Title, description, SVG favicon, Open Graph metadata, and a local 1200×630 PNG share image are included. The share-image path is relative for portable hosting. If a social crawler requires an absolute `og:image`/`twitter:image` URL, set those two metadata values to the deployed image URL after the final host is known and rebuild. Public-host crawler unfurling was not tested locally.

## Content and behavior

- `src/posts.ts` contains the source-linked reading list and its research date, 12 October 2026. “Top” means editorial picks, not a leaderboard by engagement. No fabricated metrics, verified badges, or live-update claims are displayed.
- Posts are labeled as excerpts or summaries. Post text, dates, source URLs and the research date are preserved unchanged in this revision. External X content was not researched again; X may require a login, and its content can change.
- Add or edit posts in `src/posts.ts`, verify the source and date, update the snapshot date, then rebuild. The site does not scrape or fetch new tweets at runtime.
- Bookmarks use `localStorage` key `the-pond:saved:v1`. They are local to the browser/origin, not synced with X. A storage failure preserves the current visit’s selection and shows an explanation. Clearing site data removes bookmarks.
- Search, topic, and sort state reset when switching between Feed and Saved. Sidebar topics always explore the full collection. Empty states provide recovery actions.

## Validation performed

This revision reproduced and fixed all three reviewer findings: the hidden first mobile tweet, six competing font weights, and repeated promotional copy. The existing post data, artwork, palette, six-size type scale and interaction logic remain unchanged. Finding-by-finding answers are in [.imd-responses.json](.imd-responses.json).

Dependencies were installed from the unchanged lockfile in `/tmp/identitymd-pond-revision-build`, outside this repository. The final source/config/public files were copied there, and its production export replaced `dist/`:

```sh
npm ci --prefix /tmp/identitymd-pond-revision-build --cache /tmp/identitymd-pond-revision-npm-cache --no-audit --no-fund
npm run typecheck --prefix /tmp/identitymd-pond-revision-build
npm run build --prefix /tmp/identitymd-pond-revision-build
```

All three commands passed. Vite 7.1.12 built 1,580 modules; the JavaScript is 219.33 kB and CSS 22.26 kB before compression. Node was 24.21.0 and npm 11.19.0. The install reported an esbuild install-script notice; typecheck and build both completed successfully without additional approval or scripts.

The supplied browser connector could not start because `/opt/google/chrome/chrome` was absent. The worker instead used the installed Playwright library and Chromium headless shell 153.0.8010.12, serving the **actual `dist/` under `/preview/`** in a bounded script that closes its browser and HTTP server:

```sh
POND_PLAYWRIGHT_MODULE=/opt/imd-website-stack/node_modules/playwright/index.mjs \
POND_CHROMIUM=/home/imd-worker/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
POND_AXE_SCRIPT=/tmp/identitymd-pond-revision-tools/node_modules/axe-core/axe.min.js \
node scripts/check-revision.mjs
```

For another machine, point those variables to its Playwright module, Chromium executable, and axe-core script. `POND_PLAYWRIGHT_MODULE` and `POND_CHROMIUM` may be omitted when Playwright and its browser are available normally; axe scans are explicitly marked unperformed when `POND_AXE_SCRIPT` is absent. These are verification tools only, not runtime dependencies. Axe-core 4.10.3 was installed separately under `/tmp/identitymd-pond-revision-tools`.

- **24/24 checks passed**, including filters, combined search/no-results recovery, sorting, first-screen bookmark use, persistence, Saved storage copy, keyboard unsave, navigation, snapshot dialog, skip link and storage failure recovery.
- No horizontal overflow at **320, 390, 576, 577, 768, 1024 and 1440px**. At 390×844, the complete first excerpt now spans **y=717.66–796.83px** and its bookmark spans **y=653.66–697.66px** without scrolling. The source link is further down the card. The previous excerpt began at y=946.02px.
- The rendered feed uses exactly **400, 600 and 800** weights. Doubling root text at 390px passed reflow and search interaction.
- Five axe-core scans reported **zero violations**: desktop/mobile feeds, mobile dialog, empty search and empty Saved/notification. The dialog scan left contrast as incomplete; a full manual dialog contrast audit was not repeated. Measured opaque foreground/background pairs for post text, hero description and primary action passed at 15.54:1, 8.15:1 and 14.51:1 respectively.
- No console warnings/errors or failed resource requests occurred. Metadata assets loaded from the subpath; all eight source links retain their X destinations. External X navigation and public-host social unfurling were not exercised.

The [six-domain review](artifacts/validation.md), [original measurements](artifacts/reproduction.json), [final browser results](artifacts/browser-results.json), and [design documentation](DESIGN.md) record scope and limitations. Screenshots: [before](artifacts/before-390.jpg), [final 390px first screen](artifacts/final-390.jpg), [desktop](artifacts/final-1440.jpg), [full desktop feed](artifacts/final-desktop-full.jpg), and [keyboard focus](artifacts/final-focus.jpg).

These are worker-side checks, not independent certification. The reviewer's `taste@1` script was not available; the reported issues were reproduced directly using browser measurements and screenshots. Native 200% zoom, physical devices, Safari/Firefox, actual screen-reader announcements, translated/RTL content and slowed animation inspection were not tested. The app is English-only with one intentional dark theme.

## Delivery and attribution

Source is in `src/`; reusable assets are in `public/`; `dist/` includes everything needed at runtime. Only these deliverables, package/configuration files, documentation, licenses, and the selected evidence belong in the submission. No ignore file was created or changed. No dependency directory, vendored registry, cache, submodule, or package archive is required. [The size report](artifacts/bundle-size.json) records the final path budget and measured deliverable size against the 8 MiB limit.

The existing custom illustration and social card are preserved unchanged. The social card combines that artwork, the local typeface, and the frog mark.

Manrope is bundled under the [SIL Open Font License](public/fonts/OFL.txt). React, React DOM, and Lucide notices are in [licenses/](licenses/). Design review applies Jakub Krehel’s Better Interface, pinned at `267330e1adfc66a718fb65fa6918c1f06d0a689e` (MIT); the documentation method adapts Paul Bakaus’s Impeccable, pinned at `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8` (Apache-2.0). The provided license notices are preserved in [licenses/interface-guidance.txt](licenses/interface-guidance.txt). The website is an independent community project and is not affiliated with X.
