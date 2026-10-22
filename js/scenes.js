/* Next Digital Level — home page scenes (scale.com-style).
   A+B hero → pull-apart stack   [data-pull]
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

  /* ---------- A+B · Hero → pull-apart stack (scale.com-style) ----------
     One tall section with a sticky stage. Scroll progress p (0..1) drives:
       0 → 0.12   the full-width hero card shrinks into a tilted 3D panel,
                  the page turns black, glass plates fan out behind it;
       then four chapters, the stack moving centre → right → left → right.
     Keyframes are [p, x (vw from centre), y (vh from centre), w (vw), rx, ry, gap px]. */
  (function pull() {
    const root = $('[data-pull]');
    if (!root) return;
    const stage = $('.pull__stage', root), rig = $('[data-pull-rig]', root), card = $('[data-pull-card]', root);
    const hero = $('[data-pull-hero]', root), foot = $('[data-pull-foot]', root);
    const clips = $$('.pull__clip', root), media = $$('[data-media]', root), chapters = $$('[data-ch]', root);
    const lines = $('[data-pull-lines]', root), plateLines = $('[data-pull-plate-lines]', root);
    const label = $('[data-pull-label]', root), bars = $$('.reel__bars i', root);
    const saveData = navigator.connection && navigator.connection.saveData;
    const usePosters = reduced || saveData;
    const mobile = () => window.innerWidth <= 900;
    const KD = [[0.12, 0, -0.05, 0.46, 10, 16, 56], [0.30, 0, -0.06, 0.46, 9, 10, 62], [0.37, 0.19, 0, 0.40, 9, 34, 84], [0.55, 0.19, 0, 0.40, 8, 28, 90],
                [0.62, -0.19, 0, 0.40, 9, -34, 84], [0.79, -0.19, 0, 0.40, 8, -28, 90], [0.86, 0.19, 0, 0.40, 9, 34, 84], [1, 0.19, 0, 0.40, 8, 28, 90]];
    const KM = [[0.12, 0, -0.2, 0.8, 10, 14, 34], [0.30, 0, -0.21, 0.8, 9, 9, 38], [0.37, 0.02, -0.21, 0.76, 9, 22, 46], [0.55, 0.02, -0.21, 0.76, 8, 18, 50],
                [0.62, -0.02, -0.21, 0.76, 9, -22, 46], [0.79, -0.02, -0.21, 0.76, 8, -18, 50], [0.86, 0.02, -0.21, 0.76, 9, 22, 46], [1, 0.02, -0.21, 0.76, 8, 18, 50]];
    const CH = [['c1', 0.13, 0.33], ['c2', 0.37, 0.57], ['c3', 0.61, 0.81], ['c4', 0.85, 1.01]];
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const sm = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t;

    // reel (hero + first chapter)
    let ri = 0, timer = 0, visible = true, mode = 'reel';
    const name = c => (EN && c.dataset.en) || c.dataset.label;
    function load(v) { if (!usePosters && v && !v.getAttribute('src') && v.dataset.src) { v.src = v.dataset.src; v.preload = 'auto'; } }
    function setLines(src) { if (src && lines.getAttribute('src') !== src) { lines.src = src; if (plateLines) plateLines.src = src; } }
    function mark() {
      bars.forEach((b, k) => { b.classList.toggle('is-done', k < ri); b.classList.remove('is-on'); });
      void (bars[ri] && bars[ri].offsetWidth); bars[ri] && bars[ri].classList.add('is-on');
      if (label) label.textContent = name(clips[ri]);
    }
    function showClip(n) {
      const prev = clips[ri]; ri = n; const cur = clips[ri];
      load(cur); load(clips[(ri + 1) % clips.length]);
      if (!usePosters) { try { cur.currentTime = 0; } catch (e) {} cur.play().catch(() => {}); }
      cur.classList.add('is-on'); if (prev !== cur) { prev.classList.remove('is-on'); setTimeout(() => { if (!prev.classList.contains('is-on')) prev.pause(); }, 1100); }
      setLines(cur.dataset.lines); mark();
    }
    function schedule() { clearTimeout(timer); if (mode === 'reel' && visible && !document.hidden && !reduced) timer = setTimeout(() => { showClip((ri + 1) % clips.length); schedule(); }, 4200); }
    function setMode(m) {
      if (m === mode) return; mode = m;
      if (m === 'reel') { media.forEach(x => { x.classList.remove('is-on'); if (x.tagName === 'VIDEO') x.pause(); }); showClip(ri); schedule(); return; }
      clearTimeout(timer); clips.forEach(c => { c.classList.remove('is-on'); c.pause(); });
      media.forEach(x => { const on = x.dataset.media === m; x.classList.toggle('is-on', on); if (x.tagName === 'VIDEO') { if (on) { load(x); if (!usePosters) x.play().catch(() => {}); } else x.pause(); } });
      const cur = media.find(x => x.dataset.media === m);
      setLines(cur && cur.dataset.lines ? cur.dataset.lines : (m === 'audit' ? '/assets/scene/verre-lines.svg' : '/assets/scene/tours-lines.svg'));
    }
    if (usePosters) clips.forEach(c => { c.removeAttribute('src'); c.preload = 'none'; }); else { clips[0].play().catch(() => {}); load(clips[1]); }
    mark(); schedule();
    if ('IntersectionObserver' in window) new IntersectionObserver(en => {
      visible = en[0].isIntersecting;
      if (visible) { if (mode === 'reel' && !usePosters) clips[ri].play().catch(() => {}); schedule(); }
      else { clearTimeout(timer); clips.forEach(c => c.pause()); media.forEach(x => x.tagName === 'VIDEO' && x.pause()); }
    }).observe(root);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else schedule(); });

    let lastCh = '';
    scenes.push(() => {
      const r = root.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const p = progress(root), vw = window.innerWidth, vh = window.innerHeight, M = mobile();
      const K = M ? KM : KD;
      // full hero rect
      const fx = M ? 8 : 14, fy = M ? 84 : 92, fw = vw - fx * 2, fh = vh - fy - (M ? 8 : 14);
      // target values at this p
      let k1 = K[0], k2 = K[0], t = 0;
      if (p > K[0][0]) { for (let i = 0; i < K.length - 1; i++) if (p >= K[i][0] && p <= K[i + 1][0]) { k1 = K[i]; k2 = K[i + 1]; t = sm(K[i][0], K[i + 1][0], p); break; } if (p > K[K.length - 1][0]) { k1 = k2 = K[K.length - 1]; } }
      const at = i => lerp(k1[i], k2[i], t);
      const sx = at(1), sy = at(2), sw = at(3) * vw, sh = sw * 9 / 16, rx = at(4), ry = at(5), gap = at(6);
      const s0 = ease(clamp(p / K[0][0]));          // hero → stack
      const w = lerp(fw, sw, s0), h = lerp(fh, sh, s0);
      const cx = lerp(fx + fw / 2, vw / 2 + sx * vw, s0), cy = lerp(fy + fh / 2, vh * (0.45 + sy), s0);
      rig.style.left = (cx - w / 2).toFixed(1) + 'px'; rig.style.top = (cy - h / 2).toFixed(1) + 'px';
      rig.style.width = w.toFixed(1) + 'px'; rig.style.height = h.toFixed(1) + 'px';
      rig.style.transform = `rotateX(${(rx * s0).toFixed(2)}deg) rotateY(${(ry * s0).toFixed(2)}deg)`;
      card.style.setProperty('--r', lerp(26, 12, s0).toFixed(1) + 'px');
      rig.style.setProperty('--gap', (gap * s0).toFixed(1) + 'px');
      // plates fan out away from the side the stack turns towards, a little larger each step back
      rig.style.setProperty('--px', ((ry >= 0 ? -1 : 1) * (M ? 10 : 20) * s0).toFixed(1) + 'px');
      rig.style.setProperty('--py', (-8 * s0).toFixed(1) + 'px');
      rig.style.setProperty('--ps', (0.035 * s0).toFixed(4));
      rig.style.setProperty('--po', sm(0.04, 0.12, p).toFixed(3));
      card.style.setProperty('--lo', (0.5 * sm(0.05, 0.14, p)).toFixed(3));
      card.style.setProperty('--hs', (1 - 0.8 * sm(0.02, 0.12, p)).toFixed(3));
      const out = sm(0.965, 1, p);                   // hand back to the light page
      stage.style.setProperty('--d', (sm(0.0, 0.1, p) * (1 - out)).toFixed(3));
      rig.style.opacity = (1 - out).toFixed(3);
      const ho = 1 - sm(0.005, 0.06, p);
      root.style.setProperty('--ho', ho.toFixed(3)); hero.style.setProperty('--ho', ho.toFixed(3)); foot.style.setProperty('--ho', ho.toFixed(3));
      hero.style.setProperty('--hy', (-60 * (1 - ho)).toFixed(1) + 'px');
      if (ho < 0.2) root.setAttribute('data-past-hero', ''); else root.removeAttribute('data-past-hero');
      const cur = (CH.find(c => p >= c[1] && p < c[2]) || [''])[0];
      if (cur !== lastCh) { lastCh = cur; chapters.forEach(c => c.classList.toggle('is-on', c.dataset.ch === cur)); }
      setMode(p < 0.345 ? 'reel' : p < 0.585 ? 'audit' : p < 0.83 ? 'chantier' : 'calls');
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
