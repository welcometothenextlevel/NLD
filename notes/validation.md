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

# Validation — 30 September 2026 (advertising pages)

- Two pages generated by scripts/build-ads.py: /publicite-meta and /google-ads.
- They do NOT reuse build-services.py: that builder asserts the service is
  "compris dans chaque site · sans frais récurrents", which is true of the six
  craft services and false of advertising. Both new pages state instead that
  the ad budget goes directly to the platform, is set by the client and is
  separate from the site's one-off cost — so the site's "sans frais
  récurrents" promise is not contradicted.
- Tagline used on both: "Des sites qui attirent des clients. Construits pour
  les convertir." with the three-card positioning argument (a beautiful site is
  not enough / designed to convert / advertising on top when it helps).
- Claims kept to what the owner stated: "Meta Business Partner" and "Google
  Ads", never "Google Partner". No guarantee of ranking, volume or position —
  the FAQ says explicitly that nobody can promise first place.
- No figures anywhere, so the validator's no-prices rule still holds.
- Discovery: the partner cards on the homepage and /advertising are now links
  to these pages, both added to the footer services column on all 35 pages and
  to sitemap.xml (34 URLs).
- Hero verified in a real browser (h1, badge and logo at opacity 1, logo
  47×30): the blank hero in headless captures is the entrance animation not
  running there, not a layout fault.
- `python3 scripts/check-site.py`: 40 pages pass.

# Validation — 30 September 2026 (navigation + "brings you clients" repositioning)

- Navigation: "Sites sur mesure" becomes a "Prestations" panel holding all
  eighteen destinations in three columns — Création de site (the six services
  + the full offer), Publicité (Meta, Google Ads, Visibilité) and Votre région
  (six cantons + the hub). Réalisations / La méthode / Le studio stay flat, so
  the item count is unchanged.
- The panel is anchored to the nav pill, not to the trigger: anchored to the
  trigger it overflowed the left viewport edge (measured left: -21px). Now
  left 260, width 920, fits the viewport.
- Opens on click everywhere and on hover after 90 ms on fine pointers; closes
  on Escape, outside click, link click, scroll and focus leaving the panel.
  aria-expanded / aria-controls / aria-haspopup set.
- Mobile drawer regrouped: three headed groups, 17 sub-links, scrollable, no
  horizontal overflow at 390 px.
- Copy: the homepage hero lead, the services section (eyebrow, heading, intro
  and all six card bodies), the included section, and the websites.html hero
  and heading now lead with what the site is for — attracting visitors and
  turning them into clients, with or without advertising. Each of the six
  cards opens on what is at stake rather than on the feature.
- The positioning band from the advertising pages is now on all six service
  pages too, via build-services.py, so the stance is consistent.
- All eleven reworded strings were retargeted in js/i18n.js; verified in the
  browser that the English toggle leaves 0 French strings in that section.
- `python3 scripts/check-site.py`: 40 pages pass; JS syntax and
  `git diff --check` clean.

# Validation — 1 October 2026 (technical SEO: structured data)

- New scripts/structured_data.py owns all JSON-LD; every page generator now
  ends by running it, and it is idempotent (`--check` reports 0 changes).
- lang: all 40 HTML files (35 root + 5 redirect stubs) already carried
  `lang="fr-CH"`; nothing to fix.
- Business entity: the previous `#organization` block (which exposed the
  street address) is replaced on every page by one `#business` entity per the
  owner's brief — no streetAddress; locality, postcode, region VD, country CH;
  telephone "+41 76 263 28 17"; areaServed = the six cantons; IG + FB in
  sameAs. Kept from earlier owner requests: the Google Business Profile in
  sameAs + hasMap (2026-09-30) and 24/7 opening hours. It is identical on every
  page so `provider: {"@id": …/#business}` resolves on the page itself; a
  second, different entity on the homepage would have contradicted the first.
- Service on all 16 /creation-site-internet-* pages, provider by @id only;
  areaServed City for towns (with containing canton), AdministrativeArea for
  cantons, the six cantons for the Suisse romande hub (which had none). Canton
  names normalised to plain "Valais", "Jura" — the generator had produced
  "Canton de Valais" / "Canton de Jura".
- FAQPage rebuilt from the visible <details> FAQ on 25 pages. Before the
  change, the 24 existing blocks already matched word for word; websites.html
  showed 5 FAQs with no schema and now has one. Older trade pages have no FAQ.
- BreadcrumbList added (Accueil > page) to the 8 indexable pages that lacked
  one, using the footer labels; homepage and 404 deliberately excluded. Stray
  breadcrumbs inherited by generators copying websites.html's <head> are
  dropped — only a trail ending on the page itself is kept.
- Sitemap: 34 URLs, each maps to a page whose canonical is itself; no
  indexable page missing; 404 excluded. lastmod set to 2026-10-01 on all 34,
  because the business entity changed on every one (derived from git, not
  assumed).
- Proven no visible change: with JSON-LD stripped, all 35 changed HTML files
  are byte-identical to the previous commit.
- check-site.py now enforces: one #business entity per page, no street
  address, no #organization, FAQPage == visible FAQ, Service on local pages.

# Validation — 1 October 2026 (portfolio clicks)

- Reproduced with a real mouse click: "Aperçu en direct" landed on
  DIV.container, never on the button. pointerdown put the strip in drag mode
  at once, and drag mode sets pointer-events:none on the cards — before the
  button was released. The release landed behind the card, so the browser
  dispatched the click to the common ancestor. Every click in the strip was
  lost on desktop.
- Phones had a separate fault: the drag-vs-click check compared against a
  start position only mouse presses ever set; on touch it stayed 0, so once
  the strip had drifted a few pixels every tap on "Voir le site" was cancelled.
- The duplicate cards (seamless loop) were cloneNode() copies whose preview
  button forwarded to the original card, often off-screen.
- Fix: a press becomes a drag only after 6 px of movement; only a real drag
  swallows the click that follows it; touch keeps native scrolling with no
  interference; every card, copies included, is built by one function with its
  own handlers; the screenshot is now itself a link to the site, matching the
  "VOIR" cursor shown over it.
- Verified with real clicks: preview button → iframe of the right site renders
  in that card; screenshot click → reaches the link, not prevented; a 320 px
  mouse drag scrolls 576 px and opens nothing; a copy's preview opens in the
  copy and leaves the original alone. All 12 client sites send no
  X-Frame-Options / frame-ancestors, so every live preview can load.

# Validation — 4 October 2026 (Google Ads Certified Partner badge)

- The owner has received the Google Ads Certified Partner badge. This
  supersedes the 30 September rule of writing only "Google Ads": the
  accreditation is now real and named as such.
- Badge installed exactly as supplied — no recolouring, cropping or
  transparency — as assets/partners/google-ads-certified-partner.{webp,png}
  (14 KB lossless WebP, PNG fallback). It ships on solid white, so it sits on
  its own white plate in both themes instead of being altered to fit dark mode.
- Placed on the Google card of the homepage and /advertising certifications
  sections (heading "Partenaire certifié Google Ads") and in the hero of
  /google-ads, whose title and description now lead with the accreditation.
  The trademark line now mentions the accreditations held.
- The assistant's advertising answer states both accreditations (FR + EN) and
  matches "certifié / certified / partenaire / partner".
- Also fixed: three English assistant answers still linked to /…html — the
  earlier clean-URL pass missed links written as escaped \"…\" strings.
- Checked in a real browser: badge loads as WebP at 170×60 in the hero,
  168×59 on a 390 px phone, no overflow, no console errors; light and dark.
- `python3 scripts/check-site.py`: 40 pages pass.

## 2026-10-13 — Client reviews (Google Business Profile)

- Review texts copied verbatim from the GBP (signed-out Google Search reviews dialog, consent rejected); Omar Silva's full text recovered, Vaciraya Pechlak kept in the original English.
- `scripts/reviews.py` is the single source: fills `<!-- reviews:* -->` markers (home, websites, lausanne, marketing x3, suivi, score chips on / and /book), builds /avis, writes the EN strings into i18n.js, then runs structured_data.py. All four generators now chain through it.
- Bruce's review held back (`show=False`): the profile shows it as the signed-in owner's own review. TheRoyalCharme left a rating with no text: counted in "9 avis", no card.
- No Review/AggregateRating schema (self-serving LocalBusiness reviews are not eligible for stars).
- Nav "Avis", drawer "04 Avis clients" and footer link on all 35 pages; nav links set nowrap (checked 1440/1200/1060, no overflow).
- Puppeteer: strips drift, no horizontal overflow at 1440 or iPhone 13, dark mode OK, EN toggle translates every block with no console errors.
- check-site.py PASS (41 pages), structured_data --check: 0 changes. Assets bumped to v=20261013a.

## 2026-10-14 — Founder, no middleman, reviews first

- Home: hero badge "Entreprise suisse · sans intermédiaire", hero note "Vous parlez directement au fondateur", offer strip "5 ans d'expérience", studio section rewritten around Amin Hamdi (founder card: Fondateur · Suisse, 5 ans). Footer on every page: "Entreprise suisse fondée par Amin Hamdi… sans intermédiaire". Local pages' hero note gains "sans intermédiaire". Schema: `founder` Person on #business. Chat "who" intent names Amin.
- Reviews moved up to right after the hero on the home page; the strip now also sits on every service, canton, town and hub page and on /book (28 pages). Prev/next arrows added.
- Phone fix: the drift added ~0.5 px per frame to scrollLeft, which WebKit rounds to whole pixels, so the strips never moved on iPhone. Position is now accumulated in JS (portfolio strip too). Verified in puppeteer with a scrollLeft setter that rounds like WebKit: 14 -> 73 px in 2 s.
- Rail cards stretch to equal height, name pinned to the bottom (no empty band under short cards on phone).
- EN toggle checked for every new string, no console errors; check-site PASS (41 pages). Assets v=20261014a.

## 2026-10-14 — 10th review (Charmayne Grech)

- Added verbatim from the GBP screenshot (Char's Beauty Room, EN, original spelling kept). RATED 9 -> 10; shows on 24 pages (all general blocks + /avis), not the Lausanne, ads or follow-up blocks. check-site PASS. Assets v=20261014b.

## 2026-10-14 — Swiss flag + review link on the portfolio

- Swiss flag next to the logo in the header of all 36 pages (role=img, "Entreprise suisse" / EN "Swiss company"), on the home hero badge, on the founder monogram and in the local pages' hero note.
- Phone header: flag would clip "Aperçu gratuit" at 390px; ≤480px uses a 15px flag, 7px nav gap and drops the CTA arrow. Measured at 320/375/390/430: no overflow.
- Char's Beauty Room portfolio card gets "★ Avis client" -> /avis#charmayne-grech; /avis cards carry ids, the target card is outlined in gold; Charmayne's card shows "Char’s Beauty Room · Melbourne".
- check-site PASS. Assets v=20261014d.

## 2026-10-14 — 48 hours, 999 CHF all included

- Owner decisions (asked in chat): 999 CHF fixed, paid once; the client buys their own domain; no mention of AI; free preview and 12 months of follow-up kept.
- Every "7 jours" turnaround → "48 heures" (FR, EN, chat, meta descriptions, FAQ, schema description, generators, demo and method timelines now 0h–48h). "7 jours sur 7" availability untouched. The clock now starts at preview approval, since text and images are included.
- `scripts/offer.py` (run by reviews.py): `offer:full` price card + agency comparison (2–4 months / 3'000–8'000 CHF vs 48 h / 999 CHF) on / and /websites, `offer:note` on /book, EN strings in i18n.js. Fine print names the only outside costs: domain (~15–20 CHF/yr, client's name), payment-provider commission, optional ad budget.
- Home: removed the "template vs sur mesure" table and the "Compris dans chaque site" list (folded into the price card); hero line and key figures show 999 CHF; FAQ gains "Combien coûte un site ?", subscription answer rewritten. Chat price/subscription/content answers rewritten. Content and photo FAQs now say text and images are included.
- check-site: CHF amounts restricted to 999 / 0 / 20 / 3’000 / 8’000; offer tokens updated. PASS (41 pages).
- Verified desktop, iPhone 13, dark + EN: no overflow, no console errors. Assets v=20261014f.

## 2026-10-14 — October promotion 799 CHF

- `scripts/offer.py` PROMO_PRICE 799 until 31 October: price card (999 struck, 799, gold "Offre d’octobre" ribbon), comparison box, key figures, hero pill on / and every local page, booking line, chat price answer. Home hero line "999 CHF tout compris" hidden during the promo.
- Auto-expiry: the inline head script on all 36 pages adds `.promo-over` from 2026-11-01T00:00+01:00; CSS then hides `[data-promo]` and shows `[data-promo-else]` (999). Verified in puppeteer with Date.now set to 1 Nov: no 799 left anywhere, 999 back on card, strip, hero line and booking line.
- FAQ and structured data keep the regular 999 (schema can’t expire on its own). check-site allows 799. Assets v=20261014g.
- After 31 October: set PROMO_PRICE = None in offer.py and rerun scripts/reviews.py to drop the dead markup.

## 2026-10-19 — Pivot: quote requests and bookings (client acquisition)

- Owner decisions (asked in chat): website offer folded into the new service (no separate 999 CHF product); from 1’700 CHF/month, ad budget included, shown without a split; no commitment, monthly; free audit is the main call to action.
- Home rewritten around exclusive enquiries: hero, 4-step demo (audit → plan & page → campaigns → enquiries), ticker, key figures, channel cards with new icons, method + scenes, commitments, studio, FAQ (9 new Q&As), CTA. Old October promo and its head-script expiry removed.
- `scripts/offer.py` now renders the monthly offer (lead platforms vs us, price card, fine print: no promised volume before the audit). /websites rebuilt as "L’offre"; /book is the audit request (form labels, WhatsApp message text, English for the form).
- New page /recherche-ia (ChatGPT / AI search) from build-ads.py; Meta and Google Ads pages: budget now included, "account in your name" claims removed (not confirmed for the new model), exclusivity FAQs. /advertising = "Nos canaux".
- Service pages reframed as "site included"; suivi-12-mois page rewritten as monthly tracking and reports (slug kept). City/town/hub pages keep their URLs and titles; meta descriptions, hero line, included list, FAQs and CTA moved to the new offer.
- Menu: "Le service" / "Nos canaux" / "Votre région"; drawer and footer to match; nav CTA "Audit gratuit".
- Chat knowledge base rewritten (price, ad budget, commitment, exclusivity, audit, volume, channels, website, report…); 8 test questions answered correctly. Worker system prompt updated.
- check-site: only CHF amount allowed is 1’700; home tokens updated. PASS (42 pages). EN check: no French left on /, /websites, /book, /advertising, /avis beyond the JS step counter. No horizontal overflow at 1440 or iPhone 13. Assets v=20261019b.

## 2026-10-19 — Calls, separate channels, 1’200 CHF, canton flags

- Price everywhere 1’700 → 1’200 CHF (offer.py, pages, generators, chat, worker, check-site allowlist).
- Calls added next to quotes and bookings (hero "Des appels, des devis, des réservations.", titles, offer, method, FAQ, chat).
- Channels are separate services: the free audit picks the best one and we start there. Removed every "we combine the channels" line; price card lists one chosen channel; "ad budget included" now scoped to Google Ads and Meta. New FAQ "Travaillez-vous sur tous les canaux à la fois ?".
- Ticker: square canton flags (GE, VD for Lausanne and Vaud, FR, NE, VS, JU, CH for Suisse romande). First build left the SVGs unclosed and hid the names; fixed and verified desktop + iPhone.
- check-site PASS (42 pages). Assets v=20261019c.

## 2026-10-19 — scale.com-style scenes on the home page

- Owner picked A–F from a proposal based on their screen recording of scale.com.
- A · Hero is now a rounded full-width video reel: 8 royalty-free Pexels clips (coiffure, plomberie, menuiserie, onglerie, électricité, jardin, peinture, garage), trimmed to 4.6 s, 960×540, ~0.9 Mb/s, no audio, faststart (Swift AVAssetWriter: no ffmpeg here). assets/reel/ ≈ 4.5 MB incl. posters; only the current and next clip load. Reduced motion or Save-Data → posters only. Same headline/lead/buttons (EN keys unchanged); old 4-step tablet removed.
- B · Method replaced by a sticky 3D layer stack (Audit → Page → Canal → Appels), scroll-driven.
- C · "Votre téléphone sonne" sticky phone; 5 example notifications with source logos, marked "Exemple de journée, à titre d’illustration". Phones show the latest 3.
- D · Sectors: "Des clients pour [les plombiers…]" rotating word, 12 floating tiles (trade stills + client-site screenshots), scroll parallax, matching tile highlighted. Width re-measured after fonts load (italic was clipped).
- E · Expanding green card after the reviews, words light up with scroll.
- F · Channel cards fill dark green on hover (and when centred on touch screens).
- js/scenes.js (home only). Ticker row 2 got brand logos (Simple Icons, CC0; Google Ads official SVG).
- Puppeteer desktop + iPhone 13 + dark mode: videos play and advance, no overflow, no console errors; EN check clean. check-site PASS. Assets v=20261019e.

## 2026-10-22 — scale.com hero → pull-apart stack, premium footage

- Owner: hero videos showed small trades they no longer target, and the text was hard to read; wanted the scroll from the hero to match scale.com exactly.
- Analysed the owner's recording frame by frame (0.125 s steps) and the live site: scale.com renders the stack in WebGL (`<canvas>`), with HTML text in `.PullApartContent` layers (perspective 800px) on top. Rebuilt in CSS 3D (`[data-pull]`, js/scenes.js `pull()`): the hero card shrinks and tilts into a stack as the page turns black; 3 glass plates fan out (contour line art traced from each clip with potracer, flow paths, canton coordinates/postcodes); then 4 chapters, centre → right → left → right, with the matching text and media (reel → audit screen → construction at dusk → monthly report).
- New footage: 10 Pexels clips (Geneva aerial, glass towers, construction, harbour at dusk, luxury residence, robotised factory, boardroom, clinic, glass facade, construction at dusk), 1280×720, 5 s, no audio, ffmpeg via imageio-ffmpeg, ≈4.7 MB total, lazy-loaded. Old small-trade reel removed (assets/reel).
- Hero copy now centred on a darker radial overlay with text shadow. Old method layer stack folded into the chapters (anchor #process kept). Orbit words/tiles, phone notifications and the green card switched to bigger-company examples.
- Puppeteer desktop + iPhone 13: no overflow, no console errors; EN check clean; check-site PASS. Assets v=20261022a.

## 2026-10-22 (b) — Mobile fixes, scale.com orbit ring, guarantee, local SEO tier

- Fixes from owner feedback: last chapter's white text showed on the cream background (c4 now ends at p .92, stack fades .92–.985, background returns .925–1); transitions softened (shrink over 0–.15, darkening 0–.15); hero card corners clipped with `clip-path: inset(0 round r)` (iOS ignored overflow+radius on video); phone hero scaled down (note/foot hidden, lead smaller). Swiss flag next to the logo removed on every page (badge flag kept).
- Orbit rebuilt after measuring scale.com live: 12 square tiles on a tilted ellipse (~0.72W × 0.66H), size 27–100 % by depth (near side bottom-left), clockwise, one turn ≈ 46 s; click stops the ring and zooms the tile with its sector name. Mobile: 72 px tiles, wider ellipse, text above tiles.
- Guarantee (owner: "just say garanti"): worded as a monthly volume fixed after the free audit, for eligible businesses — hero note, offer card, fine print, FAQ, commitments, Meta/advertising pages, chat, worker prompt.
- SEO: home title/description/H1 now target "agence marketing de performance en Suisse romande" (tagline kept as a styled paragraph); 7 new pages from scripts/build-agency.py (hub + Genève, Lausanne/Vaud, Fribourg, Neuchâtel, Valais, Jura) with unique local copy, FAQ, Service (Marketing de performance) + BreadcrumbList; nav region column, drawer, footer and home regions now point to them; business JSON-LD gains slogan/knowsAbout and the guarantee; llms.txt added; sitemap 43 URLs.
- Puppeteer desktop + iPhone 13: no overflow, no console errors; EN check clean; check-site PASS (49 pages). Assets v=20261022b.

## 2026-10-24 — Phone hero pushed to the right

- Owner screenshot (iPhone): hero text and buttons were offset right and cut off. Cause: `.pull__hero` also carries `.container` (`width: 100%`), which overrides the left/right insets on an absolutely positioned box, so it sat 18px right and 36px too wide. Fixed with `width: auto`.
- Phone only: hid the hero's "Nous appeler" button (the sticky bar already has "Appeler", and the chat launcher covered it); title 8.1vw so "Des appels, des devis," stays on one line.
- Puppeteer 375/390/430/1440: hero, title, badge and button now have equal left/right margins. Assets v=20261024.

## 2026-10-24 (b) — Review from Ahmet Hoti

- Added Ahmet Hoti's 5-star review (dépannage sanitaire: site + advertising, new clients), copied word for word from the profile; tags marketing + results, so it leads the home, Google Ads and agency-page blocks. RATED 10 → 11 (profile shows 11). Now on 35 pages; check-site PASS.

## 2026-10-24 (c) — Showcase: Bluetech Sanitaire runs live

- Owner asked to replace GS Service in the home showcase with https://welcometothenextlevel.github.io/bluetech-sanitaire/ and to see its 3D animation, i.e. the site running inside ours. Slide 0 is now an iframe (no X-Frame-Options / frame-busting on that site) laid out at 1440×1000 (1024 wide on phones) and scaled into the frame by a ResizeObserver; global `iframe { max-width:100% }` had to be overridden or it rendered the tablet layout. Loaded when the showcase is 1.5 viewports away; poster assets/work/bluetech.webp under it. Bluetech pauses its own render loop off-screen.
- The iframe ignores the pointer (home page keeps scrolling, filmstrip keeps dragging) until « Essayer le site » in the browser bar; then the cycle holds; it ends on « Fermer », pointer leaving the frame (desktop), a tap outside, or the showcase collapsing. Slide 0 lasts 11 s.
- Puppeteer (Metal) 1440×900 and iPhone 390: frame fills the screen, 3D renders, try/hold/leave work, no errors, no overflow; EN check 0. Assets v=20261024b.
