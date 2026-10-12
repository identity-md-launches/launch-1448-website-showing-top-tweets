# The Pond design system

## Overview

The Pond is an independent, static reading list for people following IdentityMD and AI agents. The requested dark green, Pepe-with-AI direction appears in forest surfaces, lime accents, a frog mark, and a textured illustration of two AI-equipped Pepes. The feed favors readable post excerpts and summaries, clear attribution, and direct source links. “Top” means editorial selection, not measured engagement.

The implementation lives in [src/styles.css](src/styles.css), [src/App.tsx](src/App.tsx), and [src/posts.ts](src/posts.ts). React components and CSS patterns are local to this page, not a separately exported component library. Reusable hierarchy: one prominent action, compact controls, readable content cards, and quieter supporting information. The split hero is this page’s composition, not a requirement for every future page.

## Colors

Canonical colors are hexadecimal CSS custom properties in `src/styles.css :root`. Components primarily use the semantic aliases below. This product has one deliberate dark theme and no theme switch.

| Semantic token | Primitive / value | Implemented role |
| --- | --- | --- |
| `--bg`, `--on-accent` | `--forest-950` / `#0a120e` | Page background; text on lime actions |
| `--surface` | `--forest-900` / `#101b14` | Hero, cards, fields, dialog |
| `--raised` | `--forest-850` / `#15221a` | Mission panel, active navigation, badges |
| `--hover` | `--forest-800` / `#1c2c21` | Hover/selected surfaces, secondary actions, toast |
| `--border` | `--forest-700` / `#2c4032` | Subtle structural dividers |
| `--control-border` | `--forest-500` / `#617667` | Field, dialog and action boundaries |
| `--muted` | `--forest-300` / `#a5b4a8` | Secondary copy and metadata |
| `--text` | `--forest-100` / `#edf2e9` | Primary text |
| `--accent` | `--lime-400` / `#b9f279` | Primary action, selected controls, brand details |
| `--accent-hover`, `--focus` | `--lime-300` / `#cdf79f` | Action hover and focus perimeter |

The first pick additionally uses border `#56754a`. Four `.avatar-*` color pairs distinguish decorative initials; they encode no account status. There are no warning or destructive color ramps. Storage problems use explanatory text in the existing notification treatment.

WCAG luminance calculations from declared opaque token pairs: text/surface **15.54:1**, muted/surface **8.15:1**, muted/raised **7.60:1**, muted/hover **6.77:1**, accent/hover **11.20:1**, on-accent/accent **14.51:1**, control-border/surface **3.61:1**, focus/background **15.74:1**. These are identified source-pair calculations, not measurements of every rendered image or overlay. See [validation](artifacts/validation.md) for review coverage.

## Typography

The family is `Manrope, ui-sans-serif, system-ui, sans-serif`. [The local variable WOFF2](public/fonts/manrope-latin-variable.woff2) supplies normal weights 400–800; `@font-face` declares that range with `font-display: swap`. Browser validation confirmed Manrope loaded. Its license is [public/fonts/OFL.txt](public/fonts/OFL.txt).

| Token | Default size | Role |
| --- | --- | --- |
| `--caption` | 0.75rem / 12px | Metadata, badges, category controls |
| `--small` | 0.875rem / 14px | Navigation, descriptions, author names |
| `--body` | 1rem / 16px | Post text, mobile field/select text |
| `--subhead` | 1.25rem / 20px | Feed heading, compact section headings |
| `--heading` | 2rem / 32px | Mobile hero, mission/dialog heading |
| `--display` | 3.25rem / 52px | Wide hero heading |

Root size is 16px with unitless line-height 1.6. Post text is weight 500 / line-height 1.65; controls use 600–800, author/feed headings 750. The display headline uses weight 800, line-height 1.08, and −2.1px tracking; mobile tracking is −1px. Supporting prose uses 1.7–1.8 where appropriate. Headings balance; short paragraphs wrap prettily. Names, handles, post text and result summaries can break long strings. Counts, ranks and dates use tabular numerals. No post text is truncated. Text remains selectable.

## Layout

`.header-inner` and `.page-shell` share a centered 1312px maximum width. Desktop page gutters are 32px. The spacing vocabulary declares `--space-1` through `--space-7`: 4, 8, 12, 16, 24, 32, and 48px. Existing components also use explicit optical/density adjustments; these variables are not a claim that every gap is tokenized.

The desktop `.content-layout` pairs a flexible feed with a 286px sidebar and 30px gap. `.posts-grid` has two equal columns and 16px gaps. Cards use flexible content height and wrapping footers. Grids use `minmax(0, 1fr)` and content columns use `min-width: 0` to contain long text.

| CSS breakpoint | Adaptation |
| --- | --- |
| ≥76rem / 1216px | Filters and search share one row; filter targets grow to 46px high |
| ≥90rem / 1440px | Hero minimum height becomes 320px; copy padding is 28px vertically |
| ≤72rem / 1152px | Hide brand descriptor; 260px sidebar, 24px gap, one feed-card column |
| ≤56rem / 896px | 24px page gutters; sidebar moves below feed; feed returns to two columns; hide header external link and curation panel; hero headline becomes 32px |
| ≤36rem / 576px | 16px gutters, stacked hero, one card column; hide mission panel; auto-fitting topic buttons; 16px search/select text; navigation/footer wrap |
| ≤23rem / 368px | 12px gutters, tighter brand/navigation, smaller card insets; hide saved-count badge and feed-heading icon |

At mobile size the hero copy and main action precede its 126px artwork strip; the strip becomes 130px below 368px. Content flows in DOM reading order. The mobile feed heading can wrap independently of sorting controls.

Production browser checks found no horizontal overflow at 320, 390, 768, 1024 and 1440 CSS pixels. At 390px the main action ends around y=335px. Doubling root text to 32px at 390px also passed reflow; this was text enlargement, not native browser zoom. Evidence: [desktop](artifacts/desktop.jpg), [mobile](artifacts/mobile.jpg), [focused mobile feed](artifacts/mobile-feed-focus.jpg), and [browser results](artifacts/browser-results.json).

## Elevation & Depth

The content system is mostly flat: tonal surfaces and 1px borders separate regions. The image uses a low-opacity white inset outline. The decorative chip uses concentric surface/border rings.

Only overlays receive substantial shadows: `.toast` uses `0 8px 32px #0006` at z-index 10; `.about-dialog` uses `0 16px 80px #0008` in the native dialog top layer. Its backdrop is `#030805c9` with 5px blur. The skip link sits at z-index 30; the header is not sticky.

## Shapes

`--radius: 16px` shapes cards and empty states. Hero/dialog use 20px, with mobile hero reduced to 16px. Actions, navigation and search use 8px; icon controls/select use 7px; compact badges use 4–6px. Avatars are circular. The hero clips artwork to its corners; mobile copy and image manage their own clipping. Controls use minimum heights rather than fixed text-container heights.

## Components

All patterns below live in `src/App.tsx` and their matching classes in `src/styles.css`.

- **Navigation:** native hash links select Feed/Saved, reset filters and focus/scroll the feed heading even on repeated activation. Modified link clicks retain native behavior. The skip link targets main without resetting feed state. Active navigation uses `aria-current`.
- **Actions:** `.primary-button` is the lime hero action; `.secondary-button` is a neutral recovery/external action; `.icon-button` is 40px square, increasing to 44px on mobile. Keyboard focus uses a 2px lime outline with 4px offset; forced-colors uses `Highlight`.
- **Feed controls:** category buttons expose `aria-pressed`; labeled native search/select controls filter and order local data. Search has a clear action; result counts are a polite status. Clearing filters returns focus to search. Sidebar topics open the complete feed and focus the selected category.
- **`PostCard({ post, rank, saved, onSave })`:** attributed article, stable editorial rank, labeled excerpt/summary, UTC date, source link and bookmark toggle. Saved bookmarks gain a filled icon and pressed state. Removing a card in Saved focuses the next/previous bookmark or feed heading.
- **Bookmarks and notifications:** storage key `the-pond:saved:v1` persists known post IDs locally. Invalid storage reads fall back to empty; failed writes keep session state and explain the limitation. A persistent dismissible toast accompanies an always-mounted, visually hidden polite status region.
- **Empty states:** distinct empty Saved and no-results guidance provide a feed link or Clear filters action. No network loading state is required: posts ship in the export.
- **About dialog:** named native `<dialog>` opened with `showModal()`, explicit boundary Tab/Shift+Tab loop, Escape/close/backdrop dismissal, trigger focus restoration, bounded viewport height and contained overscroll.
- **Assets:** `FrogMark` reuses [favicon.svg](public/favicon.svg). [pond-agents.webp](public/images/pond-agents.webp) is the local 1536×1024 hero artwork; [og-pond.png](public/images/og-pond.png) is the share image. Lucide icons use `currentColor` and 1.7px strokes.

Hover rules only run on hover-capable devices. Under `prefers-reduced-motion: no-preference`, action color/border/transform transitions last 150ms and button presses scale to 0.96. Reduced motion removes those transitions; there is no autoplay or entrance animation.

## Do’s and Don’ts

- Start another view inside `.page-shell`; reuse existing surface, type and action tokens, then add a descriptive heading and focus destination.
- Keep one filled primary action, native controls, visible labels and working empty-state recovery. Reuse the existing dialog/focus patterns for explanatory overlays.
- Add posts through `src/posts.ts`, preserving real source IDs and the excerpt/summary distinction; update the source ledger and rebuild the export.
- Keep imagery local and text readable over solid surfaces. Preserve the dark green/Pepe identity and responsive reading order.
- Do not invent engagement metrics, live-feed behavior, verified badges, additional type sizes or status colors to fill visual space. Do not hide source attribution or rely on motion alone for feedback.
