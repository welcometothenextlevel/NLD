/* Next Digital Level — motion layer.
   Everything here is progressive enhancement: the page reads fine without it,
   under reduced motion, and on coarse pointers (where cursor/tilt/magnetic are off). */
(function () {
  'use strict';
  const doc = document.documentElement;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Inner pages: same motion vocabulary without touching their markup ---------- */
  (function enhance() {
    const hero = $('.hero');
    if (hero && !$('[data-dots]', hero)) {
      const c = document.createElement('canvas'); c.className = 'dot-canvas'; c.setAttribute('data-dots', ''); c.setAttribute('aria-hidden', 'true');
      hero.setAttribute('data-dots-region', ''); hero.prepend(c);
    }
    $$('h1.hero__title:not([data-split])').forEach(h => h.setAttribute('data-split', 'lines'));
    $$('.btn--primary:not([data-magnetic]), .btn--gold:not([data-magnetic])').forEach(b => b.setAttribute('data-magnetic', ''));
  })();

  /* ---------- Loader (first visit of the session only) ---------- */
  (function loader() {
    const el = $('.loader');
    if (!el) return;
    let seen = false;
    try { seen = sessionStorage.getItem('ndl-loader') === '1'; } catch (e) { /* private mode */ }
    if (seen || reduced.matches) { el.remove(); return; }
    doc.classList.add('is-loading');
    const leave = () => {
      doc.classList.remove('is-loading');
      doc.classList.add('is-leaving');
      try { sessionStorage.setItem('ndl-loader', '1'); } catch (e) { /* ignore */ }
      setTimeout(() => { el.remove(); doc.classList.remove('is-leaving'); }, 1000);
      // overflow:hidden during the curtain blocks the initial #hash jump; redo it now
      if (location.hash) { const t = $(decodeURIComponent(location.hash)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
    };
    // Wait for fonts so the reveal never flashes fallback type, but never longer than 1.6 s.
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([ready, new Promise(r => setTimeout(r, 1600))]).then(() => setTimeout(leave, 1250));
  })();

  /* ---------- Scroll progress ---------- */
  (function progress() {
    const bar = $('.scroll-progress');
    if (!bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = doc.scrollHeight - window.innerHeight;
      bar.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  })();

  /* ---------- Custom cursor ---------- */
  (function cursor() {
    if (!fine.matches || reduced.matches) return;
    const dot = document.createElement('div'); dot.className = 'cursor';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    ring.innerHTML = '<span>Voir</span>';
    document.body.append(dot, ring);
    doc.classList.add('has-cursor', 'cursor--hidden');
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false;
    function frame() {
      rx = lerp(rx, x, 0.18); ry = lerp(ry, y, 0.18);
      dot.style.transform = `translate3d(${x}px,${y}px,0)` + (doc.classList.contains('cursor--link') ? ' scale(.6)' : '');
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      if (Math.abs(rx - x) + Math.abs(ry - y) > 0.1) raf = requestAnimationFrame(frame); else raf = 0;
    }
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    window.addEventListener('pointermove', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = x; ry = y; doc.classList.remove('cursor--hidden'); }
      const t = e.target.closest ? e.target : null;
      const view = t && t.closest('[data-cursor="view"], .wcard');
      const link = t && t.closest('a, button, summary, label, [data-cursor]');
      const text = t && t.closest('input, textarea, select, [contenteditable]');
      const dark = t && t.closest('.guarantee, .cta-band, .panel, .drawer, .chat');
      doc.classList.toggle('cursor--view', !!view);
      doc.classList.toggle('cursor--link', !!link && !view);
      doc.classList.toggle('cursor--text', !!text);
      doc.classList.toggle('cursor--dark', !!dark);
      start();
    }, { passive: true });
    document.addEventListener('mouseleave', () => doc.classList.add('cursor--hidden'));
    document.addEventListener('mouseenter', () => doc.classList.remove('cursor--hidden'));
    window.addEventListener('pointerdown', () => dot.style.transition = 'transform .1s', { passive: true });
    fine.addEventListener('change', e => { if (!e.matches) { doc.classList.remove('has-cursor'); dot.remove(); ring.remove(); } });
  })();

  /* ---------- Reactive dot canvas ----------
     A grid of dots drawn on canvas. Each dot has a rest position; the pointer
     pushes nearby dots away and brightens them toward gold. A slow ambient
     wave keeps the field alive on touch devices, where there is no pointer. */
  (function dots() {
    $$('[data-dots]').forEach(canvas => {
      const region = canvas.closest('[data-dots-region]') || canvas.parentElement;
      const dark = canvas.dataset.dotsTheme === 'dark';
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;
      const GAP = 26, RADIUS = 170, PUSH = 22;
      const base = dark ? [201, 162, 39] : [11, 110, 79];   // resting tint
      const hot = dark ? [224, 191, 82] : [201, 162, 39];   // near-cursor tint
      const restAlpha = dark ? 0.22 : 0.30;
      let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, pts = [];
      let mx = -9999, my = -9999, tx = -9999, ty = -9999;
      let raf = 0, visible = false, t0 = performance.now(), idle = 0;
      const still = reduced.matches;

      function resize() {
        const r = region.getBoundingClientRect();
        w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr; canvas.height = h * dpr;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
        pts = [];
        const ox = (w - (cols - 1) * GAP) / 2, oy = (h - (rows - 1) * GAP) / 2;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pts.push({ x: ox + i * GAP, y: oy + j * GAP, dx: 0, dy: 0, g: 0 });
        draw(performance.now());
      }

      function draw(now) {
        raf = 0;
        const t = (now - t0) / 1000;
        mx = lerp(mx, tx, 0.12); my = lerp(my, ty, 0.12);
        ctx.clearRect(0, 0, w, h);
        let active = false;
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k];
          const ddx = p.x - mx, ddy = p.y - my;
          const d = Math.hypot(ddx, ddy);
          let fx = 0, fy = 0, g = 0;
          if (d < RADIUS) {
            const f = (1 - d / RADIUS);
            const e = f * f * (3 - 2 * f); // smoothstep
            fx = (ddx / (d || 1)) * e * PUSH; fy = (ddy / (d || 1)) * e * PUSH; g = e;
          }
          p.dx = lerp(p.dx, fx, 0.14); p.dy = lerp(p.dy, fy, 0.14); p.g = lerp(p.g, g, 0.14);
          if (Math.abs(p.dx) + Math.abs(p.dy) + p.g > 0.02) active = true;
          // ambient wave: gentle breathing so the field is never dead
          const wave = still ? 0 : (Math.sin(t * 0.7 + p.x * 0.012 + p.y * 0.008) + 1) * 0.5;
          const a = restAlpha * (0.55 + 0.45 * wave) + p.g * 0.6;
          const r = 0.9 + wave * 0.35 + p.g * 1.7;
          const c0 = base[0] + (hot[0] - base[0]) * p.g, c1 = base[1] + (hot[1] - base[1]) * p.g, c2 = base[2] + (hot[2] - base[2]) * p.g;
          ctx.beginPath();
          ctx.arc(p.x + p.dx, p.y + p.dy, r, 0, 6.2832);
          ctx.fillStyle = `rgba(${c0 | 0},${c1 | 0},${c2 | 0},${a.toFixed(3)})`;
          ctx.fill();
        }
        if (visible && !document.hidden && (!still || active)) raf = requestAnimationFrame(draw);
      }
      const start = () => { if (!raf) raf = requestAnimationFrame(draw); };

      region.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top; idle = 0; start();
      }, { passive: true });
      region.addEventListener('pointerleave', () => { tx = ty = -9999; start(); });
      region.addEventListener('touchmove', e => {
        const r = canvas.getBoundingClientRect(); const c = e.touches[0];
        if (c) { tx = c.clientX - r.left; ty = c.clientY - r.top; start(); }
      }, { passive: true });
      region.addEventListener('touchend', () => { tx = ty = -9999; start(); }, { passive: true });

      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(region); else window.addEventListener('resize', resize);
      if ('IntersectionObserver' in window) new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible) start(); }).observe(region);
      else { visible = true; }
      document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
      resize(); start();
    });
  })();

  /* ---------- Split text (words / lines) ----------
     Wraps each word in a masked span; the reveal is CSS-driven via .is-in. */
  (function split() {
    const targets = $$('[data-split]');
    if (!targets.length) return;
    let wi = 0, li = 0;
    function wrap(node) {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span'); outer.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part;
            inner.style.setProperty('--i', wi++); inner.style.setProperty('--l', li);
            outer.appendChild(inner); frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeName === 'BR') { li++; }
        else if (child.nodeType === 1) wrap(child);
      });
    }
    targets.forEach(el => { wi = 0; li = 0; wrap(el); });
    if (reduced.matches || !('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => {
      // The hero title reveals as soon as the loader lifts, not on scroll.
      if (el.closest('.hero')) {
        const go = () => el.classList.add('is-in');
        if (doc.classList.contains('is-loading')) { const mo = new MutationObserver(() => { if (!doc.classList.contains('is-loading')) { go(); mo.disconnect(); } }); mo.observe(doc, { attributes: true, attributeFilter: ['class'] }); }
        else setTimeout(go, 80);
      } else io.observe(el);
    });
  })();

  /* ---------- Magnetic buttons ---------- */
  (function magnetic() {
    if (!fine.matches || reduced.matches) return;
    $$('[data-magnetic]').forEach(el => {
      let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
      const STRENGTH = 0.28, LIMIT = 14;
      const frame = () => {
        raf = 0; cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
        el.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
        if (Math.abs(cx - tx) + Math.abs(cy - ty) > 0.05) raf = requestAnimationFrame(frame);
      };
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        tx = Math.max(-LIMIT, Math.min(LIMIT, (e.clientX - r.left - r.width / 2) * STRENGTH));
        ty = Math.max(-LIMIT, Math.min(LIMIT, (e.clientY - r.top - r.height / 2) * STRENGTH));
        if (!raf) raf = requestAnimationFrame(frame);
      }, { passive: true });
      el.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(frame); });
    });
  })();

  /* ---------- Spotlight cards ---------- */
  (function spot() {
    if (!fine.matches) return;
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('[data-spot]');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }, { passive: true });
  })();

  /* ---------- Hero panel tilt ---------- */
  (function tilt() {
    if (!fine.matches || reduced.matches) return;
    $$('[data-tilt]').forEach(el => {
      const region = el.closest('.hero') || el;
      region.addEventListener('pointermove', e => {
        const r = region.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--tx', (px * 7).toFixed(2) + 'deg');
        el.style.setProperty('--ty', (-py * 7).toFixed(2) + 'deg');
      }, { passive: true });
      region.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg'); });
    });
  })();

  /* ---------- Portfolio card tilt (cards are built by main.js) ---------- */
  (function workTilt() {
    if (!fine.matches || reduced.matches) return;
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.wcard');
      if (!card || card.querySelector('iframe:not([hidden])')) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${(px * 6).toFixed(2)}deg) rotateX(${(-py * 6).toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const card = e.target.closest && e.target.closest('.wcard');
      if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
  })();

  /* ---------- Counters ---------- */
  (function counters() {
    const els = $$('[data-count]');
    if (!els.length) return;
    const run = el => {
      const end = parseFloat(el.dataset.count), dur = 1400, t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(step); else el.textContent = el.dataset.count;
      };
      requestAnimationFrame(step);
    };
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }), { threshold: 0.6 });
    els.forEach(el => io.observe(el));
  })();

  /* ---------- Sticky method: active step drives the big number ---------- */
  (function method() {
    const root = $('[data-method]');
    if (!root) return;
    const steps = $$('.method__step', root), num = $('[data-method-num]', root), bar = $('[data-method-bar]', root);
    if (!steps.length || !('IntersectionObserver' in window)) { steps.forEach(s => s.classList.add('is-active')); return; }
    let current = -1;
    const set = i => {
      if (i === current) return; current = i;
      steps.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-past', k < i); });
      if (num) { num.textContent = steps[i].dataset.step; num.classList.remove('is-flip'); void num.offsetWidth; num.classList.add('is-flip'); }
      if (bar) bar.style.transform = `scaleX(${(i + 1) / steps.length})`;
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) set(steps.indexOf(en.target)); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach(s => io.observe(s));
    set(0);
  })();

  /* ---------- Extra reveal targets not covered by main.js ---------- */
  (function reveals() {
    const targets = $$('.compare, .included__list');
    if (!targets.length) return;
    if (reduced.matches || !('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } }), { threshold: 0.15 });
    targets.forEach(el => io.observe(el));
  })();
})();
