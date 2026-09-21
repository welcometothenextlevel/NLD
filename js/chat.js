/* Next Digital Level — assistant.
   Answers questions about the offer, the process and how to get in touch.

   Two engines, picked at runtime:
   1. Remote (Claude) — if `window.NDL_CHAT_ENDPOINT` is set, questions are sent
      to that endpoint (see worker/chat-worker.js) and the model replies.
   2. Local — a knowledge base derived from the site's own copy, matched on
      normalised keywords. Works offline, on GitHub Pages, with no backend.
   The remote engine falls back to the local one on any error, so the widget
   never shows a dead end. Nothing is stored beyond the browser session. */
(function () {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const PHONE = '+41 76 263 28 17', TEL = 'tel:+41762632817', WA = 'https://wa.me/41762632817', MAIL = 'mailto:contact@nextdigitalevel.com';
  const ENDPOINT = window.NDL_CHAT_ENDPOINT || document.body.dataset.chatEndpoint || '';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Knowledge base ----------
     Each intent: keywords (accent-insensitive, matched against the normalised
     question), a reply (HTML allowed, links only to our own contact points),
     optional chips (follow-up questions) and a weight bonus. */
  const KB = [
    { id: 'greet', k: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'coucou', 'hey'], w: 0.6,
      a: 'Bonjour ! Je suis l’assistant de Next Digital Level. Je peux vous expliquer notre offre, le déroulement d’un projet ou vous mettre en relation avec nous directement. Que souhaitez-vous savoir ?',
      chips: ['Combien coûte un site ?', 'Comment ça se passe ?', 'L’aperçu est-il vraiment gratuit ?'] },
    { id: 'thanks', k: ['merci', 'thanks', 'thank you', 'super', 'parfait', 'top', 'genial'], w: 0.6,
      a: 'Avec plaisir. Si vous voulez aller plus loin, le plus simple est de <a href="/book.html">demander votre aperçu gratuit</a> : vous verrez une proposition concrète avant toute décision.',
      chips: ['Demander un aperçu', 'Parler à quelqu’un'] },
    { id: 'price', k: ['prix', 'tarif', 'cout', 'coute', 'combien', 'budget', 'devis', 'cher', 'price', 'cost', 'chf', 'francs', 'euros', 'payer', 'paiement'],
      a: '<p>Nous ne publions pas de grille tarifaire, car chaque site est codé sur mesure : le périmètre (nombre de pages, fonctionnalités, contenus) change d’un projet à l’autre.</p><p>Concrètement : vous demandez un <b>aperçu gratuit</b>, nous échangeons sur votre activité, puis vous recevez une proposition claire, <b>sans frais récurrents</b> et sans abonnement. Vous décidez ensuite, sans obligation.</p>',
      chips: ['Y a-t-il un abonnement ?', 'Demander un aperçu', 'Que comprend le suivi ?'] },
    { id: 'preview', k: ['apercu', 'aperçu', 'gratuit', 'preview', 'maquette', 'essai', 'demo', 'demonstration', 'obligation', 'engagement', 'engager'],
      a: '<p>Oui, l’aperçu est vraiment gratuit et sans obligation. Vous nous parlez de votre activité, nous préparons une première version de votre site : direction visuelle, structure, ton.</p><p>Vous jugez sur pièce. Si cela vous plaît, nous affinons ensemble ; sinon, vous ne devez rien.</p>',
      chips: ['Demander un aperçu', 'Combien de temps ça prend ?'] },
    { id: 'delay', k: ['delai', 'delais', 'temps', 'jours', 'semaine', 'semaines', 'rapide', 'vite', 'quand', 'duree', 'combien de temps', 'livraison', 'pret'],
      a: '<p>Votre site est <b>prêt sous 7 jours</b> après validation du projet et réception des éléments nécessaires (textes, photos, coordonnées).</p><p>Avant cela, l’aperçu gratuit demande généralement quelques jours. Nous fixons ensemble les pages, les fonctionnalités et le calendrier avant de commencer.</p>',
      chips: ['Que dois-je fournir ?', 'Comment ça se passe ?'] },
    { id: 'subscription', k: ['abonnement', 'mensuel', 'recurrent', 'recurrents', 'frais', 'hebergement', 'heberge', 'hosting', 'maintenance', 'annuel', 'location'],
      a: '<p>Notre création de site est <b>sans frais récurrents</b> : pas d’abonnement, pas de location. Le site vous appartient, code compris.</p><p>Les seuls coûts tiers possibles sont votre nom de domaine et, si vous en avez besoin, un outil externe (réservation en ligne, par exemple). Tout est précisé avant votre accord.</p>',
      chips: ['Le nom de domaine ?', 'Que comprend le suivi ?'] },
    { id: 'followup', k: ['suivi', '12 mois', 'douze mois', 'apres', 'support', 'assistance', 'aide', 'accompagnement', 'garantie', 'sav'],
      a: '<p>Chaque site inclut <b>12 mois de suivi</b> : un interlocuteur pour vos questions, l’aide à la prise en main et les ajustements après la mise en ligne.</p><p>Nous sommes joignables 7 jours sur 7 par téléphone, WhatsApp ou e-mail. Le périmètre des interventions est défini ensemble avant le lancement.</p>',
      chips: ['Puis-je modifier mon site ?', 'Parler à quelqu’un'] },
    { id: 'process', k: ['comment', 'process', 'processus', 'methode', 'etapes', 'deroule', 'deroulement', 'fonctionne', 'marche', 'commencer', 'demarrer', 'ca se passe'],
      a: '<p>Quatre étapes, un seul interlocuteur :</p><p><b>1.</b> On en parle (téléphone ou WhatsApp).<br><b>2.</b> Vous recevez un aperçu gratuit.<br><b>3.</b> Après votre accord, le site est prêt sous 7 jours, mise en ligne comprise.<br><b>4.</b> 12 mois de suivi, 7 jours sur 7.</p>',
      chips: ['Demander un aperçu', 'Que dois-je fournir ?'] },
    { id: 'content', k: ['fournir', 'photos', 'photo', 'images', 'textes', 'texte', 'contenu', 'contenus', 'redaction', 'rediger', 'logo', 'elements', 'besoin de quoi'],
      a: '<p>Le minimum : vos coordonnées, la liste de vos services et quelques photos de votre travail (celles de votre téléphone conviennent souvent).</p><p>Nous rédigeons les textes avec vous et structurons les pages. Si vous n’avez pas de logo, nous pouvons en discuter.</p>',
      chips: ['Combien de temps ça prend ?', 'Demander un aperçu'] },
    { id: 'seo', k: ['google', 'seo', 'referencement', 'visible', 'visibilite', 'trouve', 'trouver', 'recherche', 'classement', 'premiere page', 'business profile', 'fiche'],
      a: '<p>Chaque site est construit avec les bases du <b>SEO local</b> : titres, descriptions, données structurées, pages rapides et contenu régional pertinent.</p><p>Nous pouvons aussi vous accompagner sur votre fiche Google Business Profile. Nous ne garantissons pas de classement précis, personne ne le peut honnêtement, mais nous mettons toutes les bases en place.</p>',
      chips: ['Faites-vous de la publicité ?', 'Demander un aperçu'] },
    { id: 'ads', k: ['publicite', 'pub', 'ads', 'google ads', 'meta', 'facebook', 'instagram', 'reseaux', 'sociaux', 'campagne'],
      a: '<p>Oui. En complément du site, nous accompagnons certaines PME sur leur visibilité : Google Business Profile, campagnes ciblées et présence locale. Vous trouverez le détail sur la page <a href="/advertising.html">Visibilité &amp; publicité</a>.</p><p>Le site reste la priorité : c’est lui qui transforme une visite en appel.</p>',
      chips: ['Comment ça se passe ?', 'Parler à quelqu’un'] },
    { id: 'domain', k: ['domaine', 'nom de domaine', '.ch', 'adresse du site', 'url', 'dns', 'mise en ligne', 'en ligne', 'publier'],
      a: '<p>Nous nous occupons de la partie technique : nom de domaine, mise en ligne, certificat HTTPS et redirections. Si vous avez déjà un domaine, nous le conservons.</p><p>Le domaine est enregistré à votre nom : il vous appartient.</p>',
      chips: ['Y a-t-il un abonnement ?', 'J’ai déjà un site'] },
    { id: 'redo', k: ['deja un site', 'refonte', 'refaire', 'existant', 'ancien', 'actuel', 'moderniser', 'wordpress', 'wix', 'squarespace', 'jimdo', 'shopify', 'template', 'changer'],
      a: '<p>Oui, nous refaisons des sites existants. Nous partons de ce qui fonctionne, conservons votre nom de domaine et votre référencement, puis reconstruisons le site sur mesure, sans template ni constructeur.</p><p>L’aperçu gratuit vous montre la différence, côte à côte, avant toute décision.</p>',
      chips: ['Demander un aperçu', 'Pourquoi sur mesure ?'] },
    { id: 'custom', k: ['sur mesure', 'pourquoi', 'difference', 'different', 'avantage', 'code', 'codé', 'developpement', 'technologie', 'template generique'],
      a: '<p>Un template ressemble à des milliers d’autres sites et vous rend dépendant d’une plateforme. Un site codé sur mesure est <b>dessiné pour votre entreprise</b>, plus léger, plus rapide sur mobile, et il vous appartient.</p><p>Et il n’y a ni abonnement ni extension à maintenir.</p>',
      chips: ['Combien coûte un site ?', 'Voir des réalisations'] },
    { id: 'edit', k: ['modifier', 'modification', 'changer moi-meme', 'mettre a jour', 'ajouter', 'moi-meme', 'moi meme', 'autonome', 'gerer'],
      a: '<p>Pendant les 12 mois de suivi, vous nous envoyez simplement vos modifications et nous les intégrons.</p><p>Si vous souhaitez gérer certains contenus vous-même (actualités, menu, tarifs), dites-le nous dès le départ : nous prévoyons la solution adaptée.</p>',
      chips: ['Que comprend le suivi ?', 'Demander un aperçu'] },
    { id: 'features', k: ['reservation', 'rendez-vous en ligne', 'agenda', 'boutique', 'e-commerce', 'ecommerce', 'vente en ligne', 'paiement en ligne', 'formulaire', 'multilingue', 'allemand', 'anglais', 'langues', 'traduction', 'blog', 'galerie'],
      a: '<p>Formulaires de contact, galerie, prise de rendez-vous, site en plusieurs langues (français, allemand, anglais, italien), vitrine de produits : nous définissons ensemble les fonctionnalités utiles à vos clients.</p><p>Pour les besoins spécifiques comme une boutique en ligne complète, nous en parlons lors du premier échange pour vous proposer la bonne approche.</p>',
      chips: ['Demander un aperçu', 'Combien de temps ça prend ?'] },
    { id: 'mobile', k: ['mobile', 'telephone', 'smartphone', 'tablette', 'responsive', 'iphone', 'android'],
      a: '<p>Chaque site est conçu d’abord pour le téléphone : c’est là que la majorité de vos clients vous découvrent. Un geste suffit pour vous appeler, vous écrire sur WhatsApp ou trouver votre adresse.</p>',
      chips: ['Voir des réalisations', 'Demander un aperçu'] },
    { id: 'work', k: ['realisations', 'realisation', 'exemples', 'exemple', 'portfolio', 'references', 'projets', 'clients', 'australie', 'australiennes', 'experience', 'travaux'],
      a: '<p>Nous avons accompagné des petites entreprises en Australie : institut de beauté, services à la personne, nettoyage, bijouterie, transport, club sportif. Les sites sont en ligne dans la section <a href="/index.html#work">Réalisations</a>.</p><p>La même attention est portée aux PME de Suisse romande aujourd’hui.</p>',
      chips: ['Pour quels métiers ?', 'Demander un aperçu'] },
    { id: 'sectors', k: ['metier', 'metiers', 'secteur', 'activite', 'artisan', 'artisans', 'salon', 'institut', 'beaute', 'coiffeur', 'restaurant', 'medecin', 'therapeute', 'plombier', 'electricien', 'peintre', 'avocat', 'fiduciaire', 'garage', 'commerce', 'independant', 'pme'],
      a: '<p>Nous travaillons avec les PME et indépendants de Suisse romande : artisans et entreprises de services, salons et instituts, commerces, thérapeutes, professions libérales.</p><p>Si vos clients cherchent un prestataire près de chez eux, un site clair et bien référencé localement fait la différence.</p>',
      chips: ['Voir des réalisations', 'Demander un aperçu'] },
    { id: 'where', k: ['ou', 'où', 'geneve', 'lausanne', 'fribourg', 'neuchatel', 'valais', 'vaud', 'jura', 'sion', 'suisse', 'romande', 'region', 'zone', 'deplacer', 'bureau', 'adresse', 'local', 'france', 'belgique', 'travaillez', 'intervenez', 'english', 'in english', 'francais', 'langue'],
      a: '<p>Next Digital Level est une <b>entreprise suisse</b>. Nous accompagnons toute la Suisse romande : Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura.</p><p>Les échanges se font par téléphone, WhatsApp ou visio, et en anglais si vous préférez.</p>',
      chips: ['Comment ça se passe ?', 'Parler à quelqu’un'] },
    { id: 'who', k: ['qui', 'vous etes', 'agence', 'studio', 'equipe', 'entreprise', 'societe', 'fondateur', 'a propos', 'presentation'],
      a: '<p>Next Digital Level est un studio suisse de création de sites web sur mesure pour les PME. Nous avons construit des sites pour des petites entreprises en Australie avant de nous consacrer à la Suisse romande.</p><p>Sans intermédiaire : la personne qui vous répond est celle qui conçoit et code votre site.</p>',
      chips: ['Voir des réalisations', 'Comment ça se passe ?'] },
    { id: 'contact', k: ['contact', 'contacter', 'joindre', 'appeler', 'telephoner', 'numero', 'whatsapp', 'email', 'e-mail', 'mail', 'ecrire', 'humain', 'quelqu’un', 'quelqu\'un', 'personne', 'parler', 'rendez-vous', 'rdv', 'horaires', 'disponible', 'ouvert'],
      a: '<p>Bien sûr. Vous pouvez nous joindre 7 jours sur 7 :</p><p>Téléphone : <a href="' + TEL + '">' + PHONE + '</a><br>WhatsApp : <a href="' + WA + '">écrire un message</a><br>E-mail : <a href="' + MAIL + '">contact@nextdigitalevel.com</a></p>',
      chips: ['Demander un aperçu'] },
    { id: 'security', k: ['securite', 'securise', 'https', 'ssl', 'certificat', 'rgpd', 'donnees', 'protection', 'nlpd'],
      a: '<p>Chaque site est livré en HTTPS avec certificat, redirections et bonnes pratiques configurés. Nous limitons les scripts tiers au strict nécessaire, ce qui est bon pour la vitesse comme pour la protection des données de vos visiteurs.</p>',
      chips: ['Que comprend chaque site ?', 'Demander un aperçu'] },
    { id: 'included', k: ['inclus', 'compris', 'comprend', 'contient', 'livre', 'livrable', 'pack', 'offre'],
      a: '<p>Inclus d’office : design responsive, pages rapides, contact en un geste (appel, WhatsApp, e-mail, itinéraire), SEO local, HTTPS, accessibilité, nom de domaine et mise en ligne, et 12 mois de suivi.</p><p>Le détail est sur la page <a href="/websites.html">Sites sur mesure</a>.</p>',
      chips: ['Combien coûte un site ?', 'Demander un aperçu'] }
  ];
  const ACTIONS = { 'Demander un aperçu': '/book.html', 'Parler à quelqu’un': WA, 'Voir des réalisations': '/index.html#work' };
  const FALLBACK = [
    '<p>Je ne suis pas certain de bien saisir votre question. Je peux vous renseigner sur l’offre, les délais, l’aperçu gratuit, le suivi ou nos réalisations.</p><p>Pour une réponse précise et rapide, écrivez-nous directement sur <a href="' + WA + '">WhatsApp</a> ou appelez le <a href="' + TEL + '">' + PHONE + '</a>.</p>',
    '<p>Bonne question, et elle mérite une vraie réponse plutôt qu’une approximation. Posez-la nous sur <a href="' + WA + '">WhatsApp</a> : nous répondons 7 jours sur 7.</p><p>Sinon, je peux vous expliquer comment se déroule un projet ou ce que comprend chaque site.</p>'
  ];

  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '\'').replace(/\s+/g, ' ').trim();
  KB.forEach(i => { i.nk = i.k.map(norm); });

  function local(question) {
    const q = ' ' + norm(question) + ' ';
    let best = null, score = 0;
    KB.forEach(intent => {
      let s = 0;
      intent.nk.forEach(k => {
        if (q.includes(' ' + k + ' ') || q.includes(' ' + k)) s += k.includes(' ') ? 2 : 1;
      });
      s *= intent.w || 1;
      if (s > score) { score = s; best = intent; }
    });
    if (!best || score < 1) return { html: FALLBACK[Math.floor(Math.random() * FALLBACK.length)], chips: ['Comment ça se passe ?', 'Que comprend chaque site ?', 'Parler à quelqu’un'] };
    return { html: best.a, chips: best.chips || [] };
  }

  async function remote(history) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 14000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ messages: history.slice(-12).map(m => ({ role: m.role, content: m.text })), page: location.pathname })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('empty');
      return { html: escapeHtml(data.reply).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>').replace(/^/, '<p>').concat('</p>'), chips: Array.isArray(data.chips) ? data.chips.slice(0, 3) : [] };
    } finally { clearTimeout(timer); }
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ---------- UI ---------- */
  const root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML = `
    <button class="chat__launch" type="button" aria-expanded="false" aria-controls="ndl-chat-panel">
      <span class="chat__avatar" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 21.5 13.6 15.4 17.6 19.4 24 11" stroke="#f7f4ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 11h-4.7M24 11v4.7" stroke="#c9a227" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span class="chat__launch-text">Une question ?<small>Réponse immédiate</small></span>
    </button>
    <section class="chat__panel" id="ndl-chat-panel" aria-label="Assistant Next Digital Level" hidden>
      <header class="chat__head">
        <span class="chat__avatar" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 21.5 13.6 15.4 17.6 19.4 24 11" stroke="#f7f4ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 11h-4.7M24 11v4.7" stroke="#c9a227" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <div class="chat__title"><b>Assistant NDL</b><small>En ligne · répond en quelques secondes</small></div>
        <button class="chat__close" type="button" aria-label="Fermer l’assistant">×</button>
      </header>
      <div class="chat__log" role="log" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form">
        <input class="chat__input" type="text" name="q" placeholder="Posez votre question…" autocomplete="off" maxlength="400" aria-label="Votre question">
        <button class="chat__send" type="submit" aria-label="Envoyer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </form>
      <p class="chat__foot">Vos messages ne sont pas conservés. Pour un échange direct : WhatsApp ou téléphone.</p>
    </section>`;
  document.body.appendChild(root);
  const launch = $('.chat__launch', root), panel = $('.chat__panel', root), log = $('.chat__log', root), chips = $('.chat__chips', root), form = $('.chat__form', root), input = $('.chat__input', root), send = $('.chat__send', root), close = $('.chat__close', root);

  let history = [];
  try { history = JSON.parse(sessionStorage.getItem('ndl-chat') || '[]'); } catch (e) { history = []; }
  const persist = () => { try { sessionStorage.setItem('ndl-chat', JSON.stringify(history.slice(-30))); } catch (e) { /* ignore */ } };

  function bubble(role, html, animate) {
    const el = document.createElement('div');
    el.className = 'chat__msg chat__msg--' + role;
    if (role === 'bot' && animate && !reduced.matches) typeOut(el, html); else el.innerHTML = html;
    log.appendChild(el); log.scrollTop = log.scrollHeight;
    return el;
  }
  // Reveals the reply progressively, like a person typing, then swaps in the full HTML.
  function typeOut(el, html) {
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const text = tmp.textContent; let i = 0; const total = text.length; const step = Math.max(2, Math.round(total / 60));
    const tick = () => { i = Math.min(total, i + step); el.textContent = text.slice(0, i); log.scrollTop = log.scrollHeight; if (i < total) setTimeout(tick, 14); else el.innerHTML = html; };
    tick();
  }
  function setChips(list) {
    chips.innerHTML = '';
    list.forEach(label => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chat__chip' + (ACTIONS[label] ? ' chat__chip--act' : ''); b.textContent = label;
      b.addEventListener('click', () => { if (ACTIONS[label]) { location.href = ACTIONS[label]; return; } ask(label); });
      chips.appendChild(b);
    });
  }
  function typing() {
    const el = document.createElement('div'); el.className = 'chat__msg chat__msg--bot';
    el.innerHTML = '<span class="chat__typing"><i></i><i></i><i></i></span>';
    log.appendChild(el); log.scrollTop = log.scrollHeight; return el;
  }

  async function ask(question) {
    const q = question.trim(); if (!q) return;
    bubble('user', escapeHtml(q)); history.push({ role: 'user', text: q }); persist();
    setChips([]); send.disabled = true; input.value = '';
    const wait = typing(); const t0 = performance.now();
    let answer;
    if (ENDPOINT) { try { answer = await remote(history); } catch (e) { answer = null; } }
    if (!answer) answer = local(q);
    // Keep a natural pause so replies don't feel canned.
    const min = ENDPOINT ? 0 : 650 + Math.min(900, q.length * 12);
    await new Promise(r => setTimeout(r, Math.max(0, min - (performance.now() - t0))));
    wait.remove(); bubble('bot', answer.html, true);
    const plain = answer.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    history.push({ role: 'assistant', text: plain }); persist();
    setChips(answer.chips); send.disabled = false; if (panel.matches(':hover') || document.activeElement === input) input.focus();
  }

  function open() {
    panel.hidden = false; requestAnimationFrame(() => root.classList.add('is-open'));
    launch.setAttribute('aria-expanded', 'true');
    if (!log.children.length) {
      if (history.length) { history.forEach(m => bubble(m.role === 'user' ? 'user' : 'bot', m.role === 'user' ? escapeHtml(m.text) : '<p>' + escapeHtml(m.text) + '</p>')); setChips(['Demander un aperçu', 'Parler à quelqu’un']); }
      else {
        const wait = typing();
        setTimeout(() => { wait.remove(); bubble('bot', '<p><b>Bonjour !</b> Je suis l’assistant de Next Digital Level. Posez-moi vos questions sur nos sites sur mesure, les délais ou l’aperçu gratuit.</p>', true); setChips(['Combien coûte un site ?', 'Comment ça se passe ?', 'L’aperçu est-il vraiment gratuit ?']); }, reduced.matches ? 0 : 900);
      }
    }
    setTimeout(() => input.focus({ preventScroll: true }), 350);
  }
  function shut() { root.classList.remove('is-open'); launch.setAttribute('aria-expanded', 'false'); setTimeout(() => { if (!root.classList.contains('is-open')) panel.hidden = true; }, 450); launch.focus(); }
  launch.addEventListener('click', open);
  close.addEventListener('click', shut);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('is-open')) shut(); });
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); if (!send.disabled) ask(input.value); } });
  // Deep link: any element with data-open-chat opens the assistant.
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-open-chat]'); if (t) { e.preventDefault(); open(); } });
})();
