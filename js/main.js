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
    { name: "GS Service Gotsevski", cat: "Peinture & rénovation · Puidoux, Vaud", url: "https://welcometothenextlevel.github.io/GS-Service/", img: "gsservice" },
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
  ];  const categories = window.NDL_LANG === 'en' ? ['Painting & renovation · Puidoux, Vaud', 'Beauty studio · Melbourne', 'NDIS services · Melbourne', 'Migration agency', 'Jewellery · E-commerce', 'Wedding planning', 'Transport & booking', 'Lawn care · Melbourne', 'Boat detailing', 'Party hire · Victoria', 'Carpet cleaning', 'Sports club'] : ['Peinture & rénovation · Puidoux, Vaud', 'Institut de beauté · Melbourne', 'Services NDIS · Melbourne', 'Agence de migration', 'Bijouterie · E-commerce', 'Organisation de mariages', 'Transport & réservation', 'Jardinage · Melbourne', 'Entretien de bateaux', 'Location événementielle · Victoria', 'Nettoyage de moquettes', 'Club sportif'];
  const viewport = $('[data-work]');
  if (viewport) {
    const EN = window.NDL_LANG === 'en';
    const rail = document.createElement('div'); rail.className = 'work__rail';
    // Each card is built with its own handlers, so the duplicate set used for
    // the seamless loop behaves exactly like the original — cloneNode() drops
    // listeners, which is why the copies used to open previews in the wrong card.
    function makeCard(item, index, copy) {
      const card = document.createElement('article'); card.className = 'wcard';
      const monogram = item.name.split(' ').slice(0, 2).map(w => w[0]).join('');
      const host = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const label = (EN ? 'Visit the site ' : 'Voir le site ') + item.name + (EN ? ' (new tab)' : ' (nouvel onglet)');
      card.innerHTML = `<a class="project-shot" href="${item.url}" target="_blank" rel="noopener noreferrer" draggable="false" aria-label="${label}"><div class="project-shot__bar" aria-hidden="true"><i></i><i></i><i></i><span>${host}</span></div><img src="/assets/work/${item.img}-sm.webp" srcset="/assets/work/${item.img}-sm.webp 720w, /assets/work/${item.img}.webp 1280w" sizes="(max-width: 720px) 78vw, 350px" width="720" height="500" loading="lazy" decoding="async" draggable="false" alt="Page d’accueil du site ${item.name}"><span class="project-shot__num" aria-hidden="true">${monogram}</span><span class="project-shot__badge">Projet ${String(index + 1).padStart(2, '0')}</span></a><div class="wcard__meta"><div><b>${item.name}</b><span>${categories[index]}</span></div></div><div class="project-actions"><a href="${item.url}" target="_blank" rel="noopener noreferrer" draggable="false" aria-label="${label}">${EN ? 'Visit site' : 'Voir le site'} <svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a><button type="button" aria-expanded="false">${EN ? 'Live preview' : 'Aperçu en direct'}</button></div>`;
      if (copy) { card.setAttribute('aria-hidden', 'true'); $$('a, button', card).forEach(el => { el.tabIndex = -1; }); }
      const toggle = $('button', card);
      toggle.addEventListener('click', () => {
        let frame = $('iframe', card);
        if (!frame) {
          frame = document.createElement('iframe');
          frame.className = 'project-frame'; frame.title = (EN ? 'Preview of ' : 'Aperçu du site ') + item.name;
          frame.loading = 'lazy'; frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
          frame.referrerPolicy = 'no-referrer'; frame.src = item.url;
          card.appendChild(frame);
          const note = document.createElement('p'); note.className = 'project-preview-note';
          note.textContent = EN ? 'External site. If the preview is unavailable, use “Visit site”.' : 'Site externe. Si l’aperçu est indisponible, utilisez « Voir le site ».';
          card.appendChild(note);
        }
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        frame.hidden = !open; $('.project-preview-note', card).hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = EN ? (open ? 'Close preview' : 'Live preview') : (open ? 'Fermer l’aperçu' : 'Aperçu en direct');
      });
      return card;
    }
    WORK.forEach((item, i) => rail.appendChild(makeCard(item, i, false)));
    WORK.forEach((item, i) => rail.appendChild(makeCard(item, i, true)));   // second set for the loop
    viewport.appendChild(rail);

    // Slow continuous drift; pauses on hover, touch, focus, drag and while a live preview is open.
    let paused = false, dragging = false, visible = false, raf = 0, last = 0;
    const half = () => rail.scrollWidth / 2;
    function tick(now) {
      raf = 0;
      const dt = last ? Math.min(now - last, 50) : 16.7; last = now;
      if (!paused && !dragging && visible && !document.hidden && !reduced.matches && !$('iframe:not([hidden])', rail)) viewport.scrollLeft += dt * 0.028;
      if (viewport.scrollLeft >= half()) viewport.scrollLeft -= half();
      else if (viewport.scrollLeft < 0) viewport.scrollLeft += half();
      raf = requestAnimationFrame(tick);
    }
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
    // Only a real mouse pauses on hover; touch pointers fire enter without ever leaving.
    viewport.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') paused = true; });
    viewport.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') paused = false; });
    viewport.addEventListener('focusin', () => { paused = true; });
    viewport.addEventListener('focusout', () => { paused = false; });

    // Mouse drag-to-scroll. A press only becomes a drag once it has moved more
    // than DRAG_PX: entering drag mode on press set pointer-events:none on the
    // cards before the button was released, so the release landed behind them
    // and every click in the strip was swallowed. Touch keeps native scrolling.
    const DRAG_PX = 6;
    let pressed = false, pressX = 0, pressScroll = 0, swallowClick = false;
    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pressed = true; pressX = e.clientX; pressScroll = viewport.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!pressed) return;
      const dx = e.clientX - pressX;
      if (!dragging && Math.abs(dx) > DRAG_PX) { dragging = true; viewport.classList.add('is-dragging'); }
      if (dragging) viewport.scrollLeft = pressScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (dragging) { swallowClick = true; setTimeout(() => { swallowClick = false; }, 0); }
      pressed = false; dragging = false; viewport.classList.remove('is-dragging');
    });
    // Only a genuine drag cancels the click that follows it; taps and clicks pass through.
    viewport.addEventListener('click', e => { if (swallowClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    viewport.addEventListener('dragstart', e => e.preventDefault());

    let touchTimer = 0;
    viewport.addEventListener('touchstart', () => { paused = true; clearTimeout(touchTimer); }, { passive: true });
    viewport.addEventListener('touchend', () => { clearTimeout(touchTimer); touchTimer = setTimeout(() => { paused = false; }, 2500); }, { passive: true });
    viewport.addEventListener('touchcancel', () => { clearTimeout(touchTimer); touchTimer = setTimeout(() => { paused = false; }, 2500); }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(en => { visible = en[0].isIntersecting; if (visible) start(); }).observe(viewport); else { visible = true; start(); }
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
