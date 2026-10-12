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
- Posts are labeled as excerpts or summaries. [The source ledger](artifacts/content-sources.md) records evidence, selection rationale, and date derivation. Direct X access was unavailable during research; indexed mirrors and linked public sources supported the entries. X may require a login, and its content can change.
- Add or edit posts in `src/posts.ts`, verify the source and date, update the ledger and snapshot date, then rebuild. The site does not scrape or fetch new tweets at runtime.
- Bookmarks use `localStorage` key `the-pond:saved:v1`. They are local to the browser/origin, not synced with X. A storage failure preserves the current visit’s selection and shows an explanation. Clearing site data removes bookmarks.
- Search, topic, and sort state reset when switching between Feed and Saved. Sidebar topics always explore the full collection. Empty states provide recovery actions.

## Validation performed

The worker installed packages in an isolated `/tmp/identitymd-pond-build` staging checkout to keep dependency directories outside this repository. Source, configuration, and public files were copied there unchanged; its final export was copied back to `dist/`. The delivered lockfile is the one used in that checkout.

The final production build and TypeScript check passed. The production export was served beneath `/preview/` and checked in Chromium using the available Playwright browser tool:

- **16/16 primary checks passed:** search, all three topic filters, combined/no-result states, clear/reset recovery, all sort orders, bookmark persistence, direct Saved navigation, repeated hash links, keyboard unsave/focus recovery, skip link, sidebar navigation, and dialog Tab/Escape/focus behavior.
- No horizontal overflow at **320, 390, 768, 1024, and 1440px**. At 390×844, the title and main action are on the first screen; the action ends at approximately y=335px. Doubling root text to 32px at 390px also passed reflow and search interaction.
- Axe-core 4.10.3 reported **zero violations** in desktop/mobile feeds, empty search, Saved/notification, and the mobile dialog. The dialog scan marked contrast for manual review; rendered dialog text measured 8.15:1 and its heading 15.54:1 against the opaque panel.
- Blocked storage and malformed saved data recovered as intended. Reduced-motion transitions were disabled. The tested production flow had no console warnings/errors or failed resource requests.

Actual outputs and the six-domain Better Interface review are in [artifacts/validation.md](artifacts/validation.md), [browser-results.json](artifacts/browser-results.json), and [accessibility-details.json](artifacts/accessibility-details.json). [DESIGN.md](DESIGN.md) documents the final source. Screenshots: [desktop](artifacts/desktop.jpg), [390px first screen](artifacts/mobile.jpg), and [mobile feed with keyboard focus](artifacts/mobile-feed-focus.jpg).

These are worker-side checks, not independent certification. Native browser 200% zoom, physical mobile devices, Safari/Firefox, actual screen-reader announcements, translated/RTL content, and public social crawlers were not tested. Text enlargement is not a substitute claim for native zoom. The app is English-only with one intentional dark theme.

## Delivery and attribution

Source is in `src/`; reusable assets are in `public/`; `dist/` includes everything needed at runtime. Only these deliverables, package/configuration files, documentation, licenses, and the selected evidence belong in the submission. No ignore file was created or changed. No dependency directory, vendored registry, cache, submodule, or package archive is required. [The size report](artifacts/bundle-size.json) records the final path budget and measured deliverable size against the 8 MiB limit.

The custom illustration was created with the built-in imagegen tool; [its final prompt and asset record](artifacts/image-generation.md) identify the saved artwork. The social card is a browser-rendered composition using that artwork, the local typeface, and the frog mark.

Manrope is bundled under the [SIL Open Font License](public/fonts/OFL.txt). React, React DOM, and Lucide notices are in [licenses/](licenses/). Design review applies Jakub Krehel’s Better Interface, pinned at `267330e1adfc66a718fb65fa6918c1f06d0a689e` (MIT); the documentation method adapts Paul Bakaus’s Impeccable, pinned at `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8` (Apache-2.0). The provided license notices are preserved in [licenses/interface-guidance.txt](licenses/interface-guidance.txt). The website is an independent community project and is not affiliated with X.
