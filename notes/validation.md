# Validation — 20 September 2026

This is a buildless static site. No package manager, compilation step or existing
lint/test runner was configured; the deployment still serves the repository root.

- `python3 scripts/check-site.py`: 15 HTML files, local assets, internal links and
  fragments, unique IDs, one H1 per main page, metadata, valid JSON-LD, Swiss
  contact links, required offer copy, no public prices or Australian phone number.
- `node --check js/main.js` and `git diff --check`: passed.
- Chrome / Playwright: all 10 main pages at widths 320, 390, 768, 1024 and 1440;
  no horizontal document overflow, broken local images or JavaScript exceptions.
- Mobile drawer: open, close, Escape, destination navigation, focus handling.
- Native FAQ disclosure; usable page and FAQs with JavaScript disabled.
- Preview request: required fields, encoded accents and special characters,
  WhatsApp/email draft links, invalidating the draft after editing. No message sent.
- Portfolio: navigation controls, explicit iframe activation and closing;
  zero automatic third-party iframe loads.
- Dot motion: approximately 1.2px after 120ms and 8.2px after another 1.8s for the
  tested pointer position; maximum 12px per axis, 1.4s interpolation constant.
  Reduced-motion disables movement; code stops frames offscreen/hidden/settled.
- Visual review: desktop, tablet, mobile, fully opaque open menu, contact form.
- Original client project URLs and the five legacy redirects retained.

External site previews depend on each client's embedding policy and availability;
all retain a direct link and an explanatory fallback. Phone/WhatsApp destinations
were validated without placing calls or sending messages. Account-level Google
Business Profile and Search Console operations are outside this website update.

# Validation — 21 September 2026 (premium motion layer + assistant)

- New files: `css/motion.css`, `css/chat.css`, `js/motion.js`, `js/chat.js`,
  `worker/chat-worker.js` (optional Claude backend, see `worker/README.md`).
- `python3 scripts/check-site.py`, `node --check` on all scripts, `git diff --check`: passed.
- Homepage: hero reactive dot canvas (pointer push + gold tint, ambient wave on
  touch), split-text reveals, magnetic buttons, 3D tilt on the preview panel,
  spotlight cards, sticky method counter, comparison table, included checklist,
  studio tenets, expanded FAQ, dark CTA. Every other page inherits the canvas,
  split H1, magnetic CTAs, loader and assistant automatically via `motion.js`.
- Assistant: opens/closes, Escape, Enter submits, chips, WhatsApp/tel/mail links,
  history kept across pages for the session, unknown questions fall back to a
  human handoff. Verified in the Claude desktop browser at 1440 and 390 px.
- Cursor / tilt / magnetic are disabled on coarse pointers and under
  `prefers-reduced-motion`; the loader is skipped under reduced motion and
  after the first page of a session.
- Headless Chrome full-page captures at 1440 px and the in-app browser at
  390 px: no horizontal overflow, no console errors.

# Validation — 21 September 2026 (real previews, showcase, glass buttons, rail)

- `assets/work/*.webp`: hero-height captures of the 11 client sites (headless
  Chrome, 1440×1000), 31–74 KB each; used in the portfolio cards and showcase.
- Showcase: native-scroll expansion (no wheel hijack), sticky child, --p driven
  by scroll position; frame capped to viewport height; tabs auto-cycle only
  while expanded and visible; reduced motion renders it static and expanded.
- `overflow-x: hidden` on body was silently breaking every position: sticky
  block (method counter, included/studio/FAQ pins); switched to `clip`.
- Glass buttons are CSS only (layered inset shadows, backdrop blur, optional
  SVG displacement under Chromium); the SVG filter is injected once by motion.js.
- Scroll rail: fixed hairline + bead + section label + percentage on desktop,
  hairline + bead on phones; hidden until 120 px of scroll.
- Mobile: ticker skews with scroll velocity, hero panel tilts with the
  gyroscope on Android (iOS would need a permission prompt, so it is skipped),
  parallax on the hero panel and commitments panel, press feedback on cards.
- Checked at 1440 px (headless) and 390 px (in-app browser); validator passes.

# Validation — 22 September 2026 (carousels, guided demo, method scenes, service pages)

- Showcase: filmstrip track (translateX) with drag/swipe, tabs and auto-advance.
- Portfolio: cards duplicated once; continuous drift via requestAnimationFrame,
  paused on hover / focus / touch / drag / open preview; drag-to-scroll on mouse.
- Hero demo: four step slides with their own CSS vignettes; tiles, "Étape
  suivante" and the screen itself advance; a drawn cursor performs the tour on
  fine pointers only, pausing 12 s after any manual click.
- Method: one animated vignette per step under the sticky counter.
- All text arrows (↗ ↓ → ←) replaced by inline SVG icons on every page.
- Six service pages generated by scripts/build-services.py, linked from the
  homepage cards, the footer and sitemap.xml.
- `python3 scripts/check-site.py`: 21 pages pass; `node --check` and
  `git diff --check` clean. Checked at 1440 px (headless) and 390 px (in-app).

# Validation — 22 September 2026 (dark mode, English, socials, mobile fixes)

- Dark mode: token overrides under `:root[data-theme="dark"]`, applied before
  first paint by an inline head script (saved choice, else OS preference);
  toggles in the nav (≥1200 px) and in the mobile drawer; dot canvases re-read
  the theme every frame.
- English: `js/i18n.js` swaps French markup for English from a dictionary
  matched on each element's own innerHTML (SVG icons preserved); reloads on
  toggle so headings re-split cleanly. Covers the shared chrome, the whole
  homepage, the service-page scaffolding, the portfolio labels and the
  assistant (English answers + keywords for every intent).
- Instagram and Facebook links in every footer and in the Organization
  `sameAs`.
- Portfolio drift no longer pauses forever on touch (pointerenter from a touch
  pointer was treated as a hover).
- Hero demo: no auto-advance on touch devices; the guided cursor only runs on
  fine pointers after 6.5 s idle; a pulsing ring on "Voir l’étape suivante"
  until the first interaction.
- Method: on ≤900 px each vignette moves inside its step and plays when it
  scrolls into view.
- Validator: 21 pages pass; JS syntax and `git diff --check` clean.

# Validation — 22 September 2026 (light default, Swiss badge, local SEO)

- Theme defaults to light; dark only when the visitor chose it (stored).
- "Conçu et codé en Suisse" badge with flag in every footer (translated in EN).
- Local SEO: 6 canton landing pages + a Suisse romande hub generated by
  scripts/build-cities.py, each with unique copy, FAQPage, BreadcrumbList and
  Service schema; linked from a new homepage "Regions" section, the footer on
  every page and sitemap.xml. Organization upgraded to ProfessionalService with
  areaServed cantons, address CH, sameAs, languages; WebSite + FAQPage on the
  homepage; FAQPage + BreadcrumbList on the six service pages; geo meta.
- Validator: 28 pages pass.
