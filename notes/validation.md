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
