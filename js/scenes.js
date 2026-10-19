/* Next Digital Level — home page scenes (scale.com-style).
   A  video reel hero            [data-reel]
   B  3D layer stack on scroll   [data-stack]
   C  phone that rings           [data-ring]
   D  rotating word + photos     [data-orbit]
   E  expanding statement card   [data-grow]
   F  channel cards light up     #services .card (touch screens)
   Scroll-linked scenes read one shared rAF-throttled scroll handler; nothing
   runs for a scene that is not on the page. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EN = window.NDL_LANG === 'en' || document.documentElement.lang === 'en';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const scenes = [];

  // Progress of a tall section through its sticky range: 0 at the top, 1 at the end.
  function progress(el) {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total) : clamp(1 - r.top / window.innerHeight);
  }

  /* ---------- A · Video reel ---------- */
  (function reel() {
    const root = $('[data-reel]');
    if (!root) return;
    const clips = $$('.reel__clip', root), bars = $$('.reel__bars i', root), label = $('[data-reel-label]', root);
    const saveData = navigator.connection && navigator.connection.saveData;
    const usePosters = reduced || saveData;
    let i = 0, timer = 0, visible = true;
    const HOLD = 4200;
    const name = c => (EN && c.dataset.en) || c.dataset.label;
    function load(c) { if (!usePosters && !c.getAttribute('src') && c.dataset.src) { c.src = c.dataset.src; c.preload = 'auto'; } }
    function mark() {
      bars.forEach((b, k) => { b.classList.toggle('is-done', k < i); b.classList.remove('is-on'); });
      void (bars[i] && bars[i].offsetWidth);
      bars[i] && bars[i].classList.add('is-on');
      if (label) label.textContent = name(clips[i]);
    }
    function show(n) {
      const prev = clips[i]; i = n; const cur = clips[i];
      load(cur); load(clips[(i + 1) % clips.length]);
      if (!usePosters) { try { cur.currentTime = 0; } catch (e) {} cur.play().catch(() => {}); }
      cur.classList.add('is-on');
      if (prev !== cur) { prev.classList.remove('is-on'); setTimeout(() => { if (!prev.classList.contains('is-on')) prev.pause(); }, 1200); }
      mark();
    }
    function schedule() { clearTimeout(timer); if (visible && !document.hidden && !reduced) timer = setTimeout(() => { show((i + 1) % clips.length); schedule(); }, HOLD); }
    if (usePosters) clips.forEach(c => { c.removeAttribute('src'); c.preload = 'none'; });
    else { clips[0].play().catch(() => {}); load(clips[1]); }
    mark(); schedule();
    if ('IntersectionObserver' in window) new IntersectionObserver(en => {
      visible = en[0].isIntersecting;
      if (visible) { if (!usePosters) clips[i].play().catch(() => {}); schedule(); }
      else { clearTimeout(timer); clips[i].pause(); }
    }, { threshold: 0.15 }).observe(root);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else schedule(); });
  })();

  /* ---------- B · 3D layer stack ---------- */
  (function stack() {
    const root = $('[data-stack]');
    if (!root) return;
    const layers = $$('[data-stack-layer]', root), steps = $$('[data-stack-step]', root);
    const num = $('[data-stack-num]', root), bar = $('[data-stack-bar]', root), world = $('[data-stack-world]', root);
    let last = -1;
    scenes.push(() => {
      const p = progress(root);
      const open = clamp(p / 0.14);                       // layers separate first
      const active = Math.min(layers.length - 1, Math.floor(clamp((p - 0.1) / 0.86) * layers.length));
      const gap = 18 + 92 * open;
      layers.forEach((l, k) => {
        const z = (k - (layers.length - 1) / 2) * gap + (k === active ? 34 * open : 0);
        l.style.transform = `translate3d(0, 0, ${z.toFixed(1)}px)`;
        l.classList.toggle('is-on', k === active);
        l.classList.toggle('is-past', k < active);
      });
      world.style.transform = `rotateX(58deg) rotateZ(${(-42 + 14 * p).toFixed(2)}deg) translateZ(${(-20 + 20 * open).toFixed(1)}px)`;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
      if (active !== last) {
        last = active;
        steps.forEach((s, k) => s.classList.toggle('is-on', k === active));
        if (num) num.textContent = String(active + 1).padStart(2, '0');
      }
    });
  })();

  /* ---------- C · Phone that rings ---------- */
  (function ring() {
    const root = $('[data-ring]');
    if (!root) return;
    const notes = $$('[data-ring-note]', root), count = $('[data-ring-count]', root), time = $('.phone__time', root);
    const times = notes.map(n => (n.querySelector('.ph-note__via').textContent.match(/\d{2}:\d{2}/) || ['08:00'])[0]);
    let shown = -1;
    scenes.push(() => {
      const p = progress(root);
      const n = reduced ? notes.length : Math.round(clamp((p - 0.06) / 0.78) * notes.length);
      if (n === shown) return;
      shown = n;
      notes.forEach((el, k) => { el.classList.toggle('is-in', k < n); el.classList.toggle('is-old', k < n - 3); });
      if (count) count.textContent = n;
      if (time) time.textContent = n ? times[n - 1] : '08:00';
    });
  })();

  /* ---------- D · Rotating word + floating photos ---------- */
  (function orbit() {
    const root = $('[data-orbit]');
    if (!root) return;
    const rot = $('[data-rot]', root), words = $$('.rot__w', root), tiles = $$('.orb__tile', root);
    if (EN) words.forEach(w => { if (w.dataset.en) w.textContent = w.dataset.en; });
    let i = 0;
    function size() { rot.style.width = words[i].offsetWidth + 'px'; }
    function hot() { tiles.forEach(t => t.classList.toggle('is-hot', t.dataset.tile && t.dataset.tile === words[i].dataset.tile)); }
    function next() {
      const prev = words[i]; i = (i + 1) % words.length;
      prev.classList.remove('is-on'); prev.classList.add('is-out');
      setTimeout(() => prev.classList.remove('is-out'), 700);
      words[i].classList.add('is-on'); size(); hot();
    }
    requestAnimationFrame(() => { size(); hot(); });
    window.addEventListener('resize', size);
    // The display font loads late; measure again once it has, or the italic word is clipped.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    window.addEventListener('load', size);
    if (!reduced) {
      let t = 0, vis = false;
      const run = () => { clearInterval(t); if (vis && !document.hidden) t = setInterval(next, 2300); };
      if ('IntersectionObserver' in window) new IntersectionObserver(en => { vis = en[0].isIntersecting; run(); }).observe(root); else { vis = true; run(); }
      document.addEventListener('visibilitychange', run);
      scenes.push(() => {
        const r = root.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // -1..1 around centre
        tiles.forEach(t => {
          const s = parseFloat(getComputedStyle(t).getPropertyValue('--s')) || 1;
          t.style.setProperty('--py', (c * -90 * s).toFixed(1) + 'px');
        });
      });
    }
  })();

  /* ---------- E · Expanding card, words light up ---------- */
  (function grow() {
    const root = $('[data-grow]');
    if (!root) return;
    const card = $('[data-grow-card]', root), text = $('[data-grow-text]', root);
    const parts = text.textContent.trim().split(/\s+/);
    text.textContent = '';
    const spans = parts.map((w, k) => {
      const s = document.createElement('span'); s.className = 'gw'; s.textContent = w;
      text.appendChild(s); if (k < parts.length - 1) text.appendChild(document.createTextNode(' '));
      return s;
    });
    let lit = -1;
    scenes.push(() => {
      const p = reduced ? 1 : progress(root);
      const g = clamp(p / 0.45);
      card.style.setProperty('--g', g.toFixed(3));
      const n = Math.round(clamp((p - 0.18) / 0.62) * spans.length);
      if (n !== lit) { lit = n; spans.forEach((s, k) => s.classList.toggle('is-lit', k < n)); }
    });
  })();

  /* ---------- F · Channel cards light up on touch screens ---------- */
  (function cards() {
    if (!window.matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
    const cards = $$('#services .card');
    const io = new IntersectionObserver(en => en.forEach(e => e.target.classList.toggle('is-lit', e.isIntersecting)), { rootMargin: '-42% 0px -42% 0px' });
    cards.forEach(c => io.observe(c));
  })();

  if (scenes.length) {
    let raf = 0;
    const tick = () => { raf = 0; scenes.forEach(fn => fn()); };
    const req = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    tick();
  }
})();
