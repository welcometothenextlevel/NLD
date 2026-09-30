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

# Validation — 29 September 2026 (privacy policy)

- New page `/confidentialite` generated by scripts/build-legal.py from the
  shared chrome of websites.html (same convention as build-services.py), so
  header, drawer, footer, fonts and stylesheets stay in sync.
- Third parties actually loaded, verified in code (not assumed): Google Fonts
  (fonts.googleapis.com + fonts.gstatic.com, every page), GitHub Pages
  (hosting), Meta (Facebook/Instagram lead forms, WhatsApp links), and client
  sites embedded in an iframe only after an explicit click on "Aperçu en
  direct". No analytics, no pixel, no tag manager, no cookie: grep for
  gtag/GTM/analytics/fbq/hotjar/plausible/matomo/clarity returns nothing (the
  only hit was `devicePixelRatio`). The chat worker is never wired up
  (NDL_CHAT_ENDPOINT unset), so the assistant runs entirely client-side.
- Browser storage is functional only: localStorage ndl-theme, ndl-lang;
  sessionStorage ndl-chat, ndl-loader. Described honestly in section 7.
- EN follows the site convention (runtime dictionary in js/i18n.js, same URL),
  not a separate /en/ path, which would break the language toggle. All 30
  strings translated; title switches via the TITLES map; 0 untranslated
  strings measured in the DOM.
- Footer link added to all 23 existing pages plus the generators, so it
  survives regeneration. Added to sitemap.xml.
- Checked at 360, 390, 768 and 1440 px: no horizontal overflow, 16px body
  text on mobile, section numbers aligned (an early hanging-indent rule hid
  them on mobile and was replaced by a flex marker).
- `python3 scripts/check-site.py`: 29 pages pass. `node --check`,
  `git diff --check` clean. Domain spelled with a single L everywhere (0
  occurrences of the double-L form).

# Validation — 30 September 2026 (GS Service added to the portfolio)

- GS Service Gotsevski (Puidoux, Vaud — peinture, façades, rénovation) added as
  the first entry of the portfolio strip and the first slide of the homepage
  showcase: the only Swiss reference, and the one Swiss prospects look for.
- Screenshot captured with headless Chrome at 1440×1000 and exported to
  assets/work/gsservice.webp (74 KB) and -sm.webp (31 KB), same pipeline as the
  other eleven.
- The "Réalisations" heading and intro claimed every client was Australian,
  which this addition made untrue; both were rewritten and their English
  entries in js/i18n.js retargeted to the new French keys. The assistant's
  "réalisations" answer (FR and EN) now names the Swiss client first.
- Checked: 12 WORK entries against 12 FR and 12 EN category labels; showcase
  slide and tab indices 0–5 with no duplicate; browser-bar host and CTA link
  default to GS Service; EN toggle renders all new strings; no console errors;
  no horizontal overflow at 390 px.
- `python3 scripts/check-site.py`: 29 pages pass. `node --check` on main.js,
  chat.js, i18n.js and `git diff --check` clean.

# Validation — 30 September 2026 (local SEO: town tier)

- Nine town pages added on top of the six canton pages, generated by
  scripts/build-cities.py: Nyon, Morges, Vevey-Montreux, Yverdon-les-Bains,
  Bulle, Martigny, Sierre, Monthey, La Chaux-de-Fonds.
- Deliberately NOT one page per commune. Near-identical pages spun up for
  hundreds of localities are doorway pages under Google's spam policy and earn
  a manual action. Each town page has its own economy, sectors, local-search
  paragraph and FAQ, written from that bassin's real activity.
- Head terms varied so the pages do not compete with each other: "agence web"
  (Nyon, Monthey), "création de site web" (Morges, Sierre), "créateur de site
  internet" (Yverdon), "site internet" (Martigny), "création de site internet"
  (the rest). All 16 H1s unique, no duplicates.
- Cannibalisation resolved: the Fribourg, Valais and Neuchâtel canton pages no
  longer claim Bulle, Martigny/Sierre and La Chaux-de-Fonds in their titles,
  descriptions or H1s — those queries belong to the town pages now.
- Hierarchy: hub → canton → town, each town linking back to its canton, three
  siblings and the hub; every town page has 2–5 inbound internal links.
  Breadcrumb schema is four levels deep on town pages.
- Organisation schema on all 33 pages now carries the real postal address
  (Rue de la Mouline 2, 1022 Chavannes-près-Renens, Vaud, CH) and 22
  areaServed entries (6 cantons + 16 towns). No `geo` pin: this is a
  service-area business, and a precise coordinate would imply a walk-in
  address.
- Service schema on town pages uses City → AdministrativeArea → Country.
- sitemap.xml: 32 URLs. `python3 scripts/check-site.py`: 38 pages pass.

# Validation — 30 September 2026 (Google Business Profile wired into the schema)

- The profile exists and is owner-managed. Its feature id was recovered from
  the `stick=` parameter of the owner's Google search URL (base64url + gzip →
  `0x948960c29e3110f:0x91054cad746ed963`, entity "Next Digital Level"), and the
  place ID derived from that pair per notes in memory:
  `ChIJDxHjKQyWSAkRY9ludK1MBZE`, CID `10449842818249578851`.
- Verified in the browser before use: `maps.google.com/?cid=…` resolves to
  Next Digital Level, Website designer, nextdigitalevel.com, 076 263 28 17 —
  the same feature id appears in the resulting Maps URL. The write-review link
  redirects to Google sign-in, which is the expected flow.
- Schema on all 33 pages: `openingHoursSpecification` now 00:00–23:59 every
  day, matching the profile's "Open 24 hours" — the owner confirmed
  availability is genuinely 24/7 after the mismatch was raised. The profile is
  added to `sameAs` and `hasMap`, tying site and listing to one entity.
- Profile still shows no reviews and 4 photos; those remain the owner's
  highest-value actions.

# Validation — 30 September 2026 (Meta / Google Ads certifications)

- New "Certifications" section on the homepage (before the sectors) and on
  /advertising (before the "Suivi" section), naming Meta Business Partner and
  Google Ads.
- Logos are the official vectors from Wikimedia Commons, not redrawn: Meta
  Platforms mark and the Google Ads icon. The Meta file's dark "Meta" wordmark
  was removed and only the infinity mark kept, because the wordmark would have
  disappeared against the dark theme; both marks were rendered on the ivory and
  the dark canvas to confirm they read on each.
- Wording deliberately mirrors exactly what the owner claimed: "Meta Business
  Partner" and "Google Ads". It does NOT say "Google Partner", which is a
  separate badge programme with its own requirements, and does not claim any
  certification the owner did not state.
- A trademark attribution line sits under the two cards.
- Translated in js/i18n.js. Checked at 390 px and 1440 px, light and dark: no
  overflow, logos legible on both themes.
- `python3 scripts/check-site.py`: 38 pages pass.
