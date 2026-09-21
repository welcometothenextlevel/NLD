/* Next Digital Level — progressively enhanced static pages. */
(function () {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js');

  const burger = $('.nav__burger');
  const drawer = $('.drawer');
  function closeMenu(restoreFocus = false) {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.inert = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('is-locked');
    if (restoreFocus) burger.focus();
  }
  burger?.addEventListener('click', () => {
    if (burger.getAttribute('aria-expanded') === 'true') return closeMenu(true);
    drawer.inert = false;
    drawer.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    document.body.classList.add('is-locked');
    $('a', drawer).focus();
  });
  $$('.drawer a').forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => {
    if (burger?.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') closeMenu(true);
    if (e.key !== 'Tab') return;
    const items = [burger, ...$$('a, button', drawer)];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.matchMedia('(min-width: 1041px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  const header = $('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const targets = $$('.reveal, .stagger, .panel');
  if (!('IntersectionObserver' in window) || reduced.matches) targets.forEach(el => el.classList.add('is-in'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    targets.forEach(el => observer.observe(el));
  }
  reduced.addEventListener('change', e => { if (e.matches) targets.forEach(el => el.classList.add('is-in')); });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Two lightweight dot layers. Only transform is animated; no per-dot canvas loop.
  // 1.4-second time constant: intentionally slow, frame-rate independent trailing.
  // At most 12px displacement. Stop when settled, offscreen, hidden or reduced motion.
  $$('.dot-field').forEach(field => {
    const region = field.parentElement;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, last = 0, visible = true;
    const enabled = () => fine.matches && !reduced.matches && visible && !document.hidden;
    function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
    function frame(now) {
      raf = 0;
      if (!enabled()) return;
      const dt = last ? Math.min(now - last, 50) : 16.67;
      last = now;
      const alpha = 1 - Math.exp(-dt / 1400);
      x += (tx - x) * alpha; y += (ty - y) * alpha;
      field.style.setProperty('--dot-x', x.toFixed(3) + 'px');
      field.style.setProperty('--dot-y', y.toFixed(3) + 'px');
      if (Math.abs(tx - x) + Math.abs(ty - y) > .03) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function start() { if (!raf && enabled()) raf = requestAnimationFrame(frame); }
    region.addEventListener('pointermove', e => {
      if (!enabled()) return;
      const r = region.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 24;
      ty = ((e.clientY - r.top) / r.height - .5) * 24;
      start();
    }, { passive: true });
    region.addEventListener('pointerleave', () => { tx = ty = 0; start(); });
    function reset() { stop(); x = y = tx = ty = 0; field.style.removeProperty('--dot-x'); field.style.removeProperty('--dot-y'); }
    reduced.addEventListener('change', reset); fine.addEventListener('change', reset);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; if (visible) start(); else stop();
    }).observe(region);
  });
  var WORK = [
    { name: "Char's Beauty Room", cat: "Beauty studio · Altona Meadows, Melbourne", url: "https://charsbeautyroom.com.au/", img: "charsbeautyroom" },
    { name: "Talofa Support Services", cat: "NDIS provider · Melbourne", url: "https://talofasupportservices.com.au/", img: "talofa" },
    { name: "The Visa Centre", cat: "Migration agency", url: "https://welcometothenextlevel.github.io/thevisacentre/", img: "thevisacentre" },
    { name: "Christus Jewelry", cat: "Jewellery · E-commerce", url: "https://christusjewelry.com/", img: "christusjewelry" },
    { name: "Ortensia Wedding", cat: "Wedding planning", url: "https://welcometothenextlevel.github.io/ortensiawedding/", img: "ortensia" },
    { name: "Citiport", cat: "Transport & booking", url: "https://welcometothenextlevel.github.io/citiport/", img: "citiport" },
    { name: "Just Quality Lawn Care", cat: "Lawn & garden · Melbourne", url: "https://welcometothenextlevel.github.io/justqualitylawncare/", img: "justquality" },
    { name: "Trident Cross Marine", cat: "Mobile boat detailing", url: "https://tridentcrossmarineservices.com/", img: "trident" },
    { name: "All In 1 Party World", cat: "Party hire · Victoria", url: "https://welcometothenextlevel.github.io/allin1partyworld/", img: "allin1" },
    { name: "E&J Carpet Cleaning", cat: "Carpet cleaning · Liverpool & Fairfield", url: "https://ej-carpetcleaning.com/", img: "ejcarpet" },
    { name: "Everest Badminton", cat: "Sports club", url: "https://welcometothenextlevel.github.io/badminton/", img: "everest" }
  ];  const categories = ['Institut de beauté · Melbourne', 'Services NDIS · Melbourne', 'Agence de migration', 'Bijouterie · E-commerce', 'Organisation de mariages', 'Transport & réservation', 'Jardinage · Melbourne', 'Entretien de bateaux', 'Location événementielle · Victoria', 'Nettoyage de moquettes', 'Club sportif'];
  const viewport = $('[data-work]');
  if (viewport) {
    const rail = document.createElement('div'); rail.className = 'work__rail';
    WORK.forEach((item, index) => {
      const card = document.createElement('article'); card.className = 'wcard';
      const monogram = item.name.split(' ').slice(0, 2).map(w => w[0]).join('');
      const host = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      card.innerHTML = `<div class="project-shot"><div class="project-shot__bar" aria-hidden="true"><i></i><i></i><i></i><span>${host}</span></div><img src="/assets/work/${item.img}-sm.webp" srcset="/assets/work/${item.img}-sm.webp 720w, /assets/work/${item.img}.webp 1280w" sizes="(max-width: 720px) 78vw, 350px" width="720" height="500" loading="lazy" decoding="async" alt="Page d’accueil du site ${item.name}"><span class="project-shot__num" aria-hidden="true">${monogram}</span><span class="project-shot__badge">Projet ${String(index + 1).padStart(2, '0')}</span></div><div class="wcard__meta"><div><b>${item.name}</b><span>${categories[index]}</span></div></div><div class="project-actions"><a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Voir le site ${item.name} (nouvel onglet)">Voir le site ↗</a><button type="button" aria-expanded="false">Aperçu en direct</button></div>`;
      const toggle = $('button', card);
      toggle.addEventListener('click', () => {
        let frame = $('iframe', card);
        if (!frame) {
          frame = document.createElement('iframe');
          frame.className = 'project-frame'; frame.title = 'Aperçu du site ' + item.name;
          frame.loading = 'lazy'; frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
          frame.referrerPolicy = 'no-referrer'; frame.src = item.url;
          card.appendChild(frame);
          const note = document.createElement('p'); note.className = 'project-preview-note';
          note.textContent = 'Site externe. Si l’aperçu est indisponible, utilisez « Voir le site ».';
          card.appendChild(note);
        }
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        frame.hidden = !open; $('.project-preview-note', card).hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Fermer l’aperçu' : 'Aperçu en direct';
      });
      rail.appendChild(card);
    });
    viewport.appendChild(rail);
    function move(direction) { viewport.scrollBy({ left: direction * ($('.wcard', rail).offsetWidth + 22), behavior: reduced.matches ? 'instant' : 'smooth' }); }
    $('[data-work-prev]')?.addEventListener('click', () => move(-1));
    $('[data-work-next]')?.addEventListener('click', () => move(1));
  }
  const form = $('[data-preview-form]');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const message = 'Bonjour, je souhaite un aperçu gratuit pour mon site.\n\nPrénom : ' + data.name.trim() + '\nEntreprise / activité : ' + data.business.trim() + (data.website.trim() ? '\nSite actuel : ' + data.website.trim() : '') + (data.message.trim() ? '\nMon projet : ' + data.message.trim() : '');
    $('[data-message-link]').href = 'https://wa.me/41762632817?text=' + encodeURIComponent(message);
    $('[data-email-link]').href = 'mailto:contact@nextdigitalevel.com?subject=' + encodeURIComponent('Demande d’aperçu gratuit') + '&body=' + encodeURIComponent(message);
    const ready = $('[data-message-ready]'); ready.hidden = false;
    $('[data-message-link]').focus();
  });
  form?.addEventListener('input', () => { $('[data-message-ready]').hidden = true; });
})();
