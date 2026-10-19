/* Next Digital Level — assistant.
   Answers questions about the client-acquisition offer, the audit and how to get in touch.

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
  const EN_UI = window.NDL_LANG === 'en';

  /* ---------- Knowledge base ----------
     Each intent: keywords (accent-insensitive, matched against the normalised
     question), a reply (HTML allowed, links only to our own contact points),
     optional chips (follow-up questions) and a weight bonus. */
  const KB = [
    { id: 'greet', k: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'coucou', 'hey'], w: 0.6,
      a: 'Bonjour ! Je suis l’assistant de Next Digital Level. Nous amenons aux PME des appels, demandes de devis et réservations exclusives. Que souhaitez-vous savoir ?',
      chips: ['Combien ça coûte ?', 'Comment ça marche ?', 'Que veut dire « exclusive » ?'],
      en: "Hello! I’m the Next Digital Level assistant. We bring small businesses exclusive calls, quote requests and bookings. What would you like to know?", enChips: ["How much does it cost?", "How does it work?", "What does “exclusive” mean?"] },
    { id: 'thanks', k: ['merci', 'thanks', 'thank you', 'super', 'parfait', 'top', 'genial'], w: 0.6,
      a: 'Avec plaisir. Pour aller plus loin, le plus simple est de <a href="/book">demander votre audit gratuit</a> : nous étudions votre marché et vous disons ce qu’il est réaliste d’obtenir.',
      chips: ['Demander un audit', 'Parler à quelqu’un'],
      en: "You’re welcome. To go further, the simplest step is to <a href=\"/book\">request your free audit<\/a>: we study your market and tell you what is realistic.", enChips: ["Request an audit", "Talk to a person"] },
    { id: 'price', k: ['how much', 'pricing', 'quote', 'expensive', 'pay', 'prix', 'tarif', 'cout', 'coute', 'combien ca coute', 'budget', 'cher', 'price', 'cost', 'chf', 'francs', 'payer', '1200', 'mois', 'mensuel', 'monthly'], w: 1.1,
      a: '<p>Le service coûte <b>dès 1’200 CHF par mois</b>, sans engagement. <b>Chaque canal est un service à part</b> : l’audit gratuit choisit le plus rentable pour vous et fixe le prix exact.</p><p>Sur Google Ads et Meta, le budget publicitaire est inclus. Le site ou la page qui convertit est compris.</p>',
      chips: ['Le budget pub est-il inclus ?', 'Y a-t-il un engagement ?', 'Demander un audit'],
      en: "<p>The service costs <b>from 1’200 CHF a month<\/b>, with no commitment. <b>Each channel is a separate service<\/b>: the free audit picks the most profitable one for you and sets the exact price.<\/p><p>On Google Ads and Meta, the ad budget is included. The website or page that converts is included.<\/p>", enChips: ["Is the ad budget included?", "Is there a commitment?", "Request an audit"] },
    { id: 'adbudget', k: ['budget pub', 'budget publicitaire', 'ad spend', 'adspend', 'ad budget', 'inclus', 'included', 'facture google', 'facture meta', 'depense'], w: 1.2,
      a: '<p>Oui : sur <b>Google Ads et Meta, le budget publicitaire est inclus</b> dans le prix mensuel. Vous n’avez pas de facture séparée de la plateforme.</p>',
      chips: ['Combien ça coûte ?', 'Y a-t-il un engagement ?'],
      en: "<p>Yes: on <b>Google Ads and Meta, the ad budget is included<\/b> in the monthly price. You get no separate bill from the platform.<\/p>", enChips: ["How much does it cost?", "Is there a commitment?"] },
    { id: 'commitment', k: ['engagement', 'commitment', 'contract', 'contrat', 'resilier', 'resiliation', 'cancel', 'arreter', 'stop', 'duree', 'minimum', 'annuel', 'abonnement', 'subscription'], w: 1.1,
      a: '<p><b>Aucun engagement.</b> Le service est mensuel : vous pouvez l’arrêter d’un mois à l’autre, sans contrat à l’année.</p><p>Nous préférons vous garder par les résultats que par un contrat.</p>',
      chips: ['Combien ça coûte ?', 'Demander un audit'],
      en: "<p><b>No commitment.<\/b> The service is monthly: you can stop it from one month to the next, with no yearly contract.<\/p><p>We would rather keep you with results than with a contract.<\/p>", enChips: ["How much does it cost?", "Request an audit"] },
    { id: 'exclusive', k: ['exclusive', 'exclusif', 'exclusives', 'partage', 'partagee', 'partagees', 'shared', 'revendu', 'revendues', 'concurrent', 'concurrents', 'local.ch', 'plateforme', 'annuaire', 'leads', 'lead'], w: 1.2,
      a: '<p>Chaque demande vient de <b>vos propres campagnes</b> et arrive <b>chez vous seul</b>. Elle n’est ni revendue ni partagée avec un concurrent.</p><p>C’est la grande différence avec les plateformes et annuaires qui envoient la même demande à plusieurs entreprises.</p>',
      chips: ['Comment ça marche ?', 'Combien ça coûte ?'],
      en: "<p>Every enquiry comes from <b>your own campaigns<\/b> and reaches <b>you alone<\/b>. It is never resold or shared with a competitor.<\/p><p>That is the big difference with platforms and directories that send the same enquiry to several businesses.<\/p>", enChips: ["How does it work?", "How much does it cost?"] },
    { id: 'audit', k: ['audit', 'gratuit', 'free', 'analyse', 'analysis', 'diagnostic', 'etude', 'premier rendez-vous', 'first call', 'essai', 'trial'], w: 1.1,
      a: '<p>Oui, l’audit est <b>gratuit et sans obligation</b>. Nous regardons votre présence en ligne, vos concurrents et les recherches dans votre région, et nous parlons de ce que vous avez déjà essayé.</p><p>Vous repartez avec un plan clair et une estimation honnête, même si vous ne travaillez pas avec nous. <a href="/book">Demander mon audit</a>.</p>',
      chips: ['Combien de demandes ?', 'Combien ça coûte ?'],
      en: "<p>Yes, the audit is <b>free and without obligation<\/b>. We look at your online presence, your competitors and the searches in your area, and we talk about what you have already tried.<\/p><p>You leave with a clear plan and an honest estimate, even if you don’t work with us. <a href=\"\/book\">Request my audit<\/a>.<\/p>", enChips: ["How many enquiries?", "How much does it cost?"] },
    { id: 'volume', k: ['combien de demandes', 'combien de clients', 'how many', 'resultats', 'results', 'garantie', 'guarantee', 'garantir', 'volume', 'nombre'], w: 1.2,
      a: '<p>Cela dépend de votre métier, de votre zone et de la concurrence. <b>Nous ne promettons pas de chiffre avant l’audit</b> : il sert justement à estimer ce qui est réaliste pour vous.</p><p>Ensuite, chaque demande est comptée et rattachée à sa source dans votre rapport mensuel.</p>',
      chips: ['Demander un audit', 'Comment ça marche ?'],
      en: "<p>It depends on your trade, your area and the competition. <b>We don’t promise a figure before the audit<\/b>: that is exactly what it is for.<\/p><p>After that, every enquiry is counted and traced to its source in your monthly report.<\/p>", enChips: ["Request an audit", "How does it work?"] },
    { id: 'process', k: ['how does it work', 'process', 'steps', 'how it works', 'start', 'comment', 'processus', 'methode', 'etapes', 'deroule', 'deroulement', 'fonctionne', 'marche', 'commencer', 'demarrer', 'ca se passe'],
      a: '<p>Quatre étapes, un seul interlocuteur :</p><p><b>1.</b> L’audit gratuit de votre marché.<br><b>2.</b> Le plan et la page qui convertit (incluse).<br><b>3.</b> Le canal choisi : Google Ads, recherche ChatGPT, référencement local ou Meta.<br><b>4.</b> Les appels et les demandes arrivent chez vous, avec un rapport chaque mois.</p>',
      chips: ['Demander un audit', 'Combien ça coûte ?'],
      en: "<p>Four steps, one contact:<\/p><p><b>1.<\/b> The free audit of your market.<br><b>2.<\/b> The plan and the page that converts (included).<br><b>3.<\/b> The chosen channel: Google Ads, ChatGPT search, local SEO or Meta.<br><b>4.<\/b> Calls and enquiries come to you, with a report every month.<\/p>", enChips: ["Request an audit", "How much does it cost?"] },
    { id: 'channels', k: ['google ads', 'ads', 'publicite', 'pub', 'meta', 'facebook', 'instagram', 'chatgpt', 'gemini', 'ia', 'ai', 'intelligence artificielle', 'seo', 'referencement', 'google', 'maps', 'canaux', 'channels', 'certifie', 'certified', 'partenaire', 'partner'],
      a: '<p>Nous travaillons sur quatre canaux, chacun proposé séparément : <a href="/google-ads">Google Ads</a>, la <a href="/recherche-ia">recherche ChatGPT</a>, le <a href="/seo-local">référencement local</a> et la <a href="/publicite-meta">publicité Meta</a>.</p><p>L’audit gratuit nous dit lequel vous rapportera le plus d’appels et de demandes, et nous commençons par celui-là. Nous sommes partenaire certifié Google Ads et Meta Business Partner.</p>',
      chips: ['Combien ça coûte ?', 'Demander un audit'],
      en: "<p>We work on four channels, each offered separately: <a href=\"\/google-ads\">Google Ads<\/a>, <a href=\"\/recherche-ia\">ChatGPT search<\/a>, <a href=\"\/seo-local\">local SEO<\/a> and <a href=\"\/publicite-meta\">Meta ads<\/a>.<\/p><p>The free audit tells us which one will bring you the most calls and enquiries, and that is where we start. We are a Google Ads Certified Partner and a Meta Business Partner.<\/p>", enChips: ["How much does it cost?", "Request an audit"] },
    { id: 'website', k: ['site', 'website', 'site internet', 'page', 'landing', 'refaire', 'refonte', 'redesign', 'nouveau site', 'new website', 'deja un site', 'already have'],
      a: '<p>Le site est <b>compris dans le service</b>. Si le vôtre convertit déjà, nous le gardons ; sinon nous construisons une page ou un site qui transforme les visiteurs en demandes, textes et images compris.</p><p>Voici <a href="/#work">quelques sites que nous avons construits</a>.</p>',
      chips: ['Combien ça coûte ?', 'Comment ça marche ?'],
      en: "<p>The website is <b>included in the service<\/b>. If yours already converts, we keep it; if not, we build a page or a website that turns visitors into enquiries, text and images included.<\/p><p>Here are <a href=\"\/#work\">some sites we have built<\/a>.<\/p>", enChips: ["How much does it cost?", "How does it work?"] },
    { id: 'report', k: ['rapport', 'report', 'suivi', 'follow-up', 'tracking', 'mesure', 'statistiques', 'transparence', 'transparent'],
      a: '<p>Chaque demande est comptée et rattachée à sa source : Google, ChatGPT, Meta ou référencement. Chaque mois, vous recevez un <b>rapport clair</b> : ce que le mois a rapporté, ce que nous changeons.</p><p>Et vous avez un interlocuteur 7 jours sur 7.</p>',
      chips: ['Y a-t-il un engagement ?', 'Parler à quelqu’un'],
      en: "<p>Every enquiry is counted and traced to its source: Google, ChatGPT, Meta or SEO. Every month you get a <b>clear report<\/b>: what the month brought in and what we are changing.<\/p><p>And you have one contact, 7 days a week.<\/p>", enChips: ["Is there a commitment?", "Talk to a person"] },
    { id: 'reviews', k: ['reviews', 'review', 'testimonials', 'rating', 'stars', 'trust', 'reliable', 'avis', 'avis clients', 'temoignages', 'temoignage', 'note', 'etoiles', 'confiance', 'serieux', 'fiable', 'recommandations', 'satisfaits'], w: 1.2,
      a: '<p>Nos clients nous ont noté 5,0 sur 5 sur Google. Ils parlent surtout de la rapidité, du suivi et de notre disponibilité 7 jours sur 7.</p><p>Tous les avis sont sur la page <a href="/avis">Avis clients</a>, et vous pouvez les vérifier sur Google.</p>',
      chips: ['Comment ça marche ?', 'Demander un audit'],
      en: "<p>Our clients rate us 5.0 out of 5 on Google. They mostly mention speed, the follow-up and our availability seven days a week.<\/p><p>Every review is on the <a href=\"\/avis\">Client reviews<\/a> page, and you can check them on Google.<\/p>", enChips: ["How does it work?", "Request an audit"] },
    { id: 'sectors', k: ['trades', 'trade', 'salon', 'beauty', 'restaurant', 'therapist', 'plumber', 'electrician', 'painter', 'garage', 'which trades', 'metier', 'metiers', 'secteur', 'activite', 'artisan', 'artisans', 'institut', 'beaute', 'coiffeur', 'plombier', 'electricien', 'peintre', 'renovation', 'demenagement', 'nettoyage', 'pme', 'independant'],
      a: '<p>Les entreprises qui vivent de la demande locale : artisans et entreprises du bâtiment, instituts et salons, santé et bien-être, services à domicile, restauration.</p><p>Surtout celles qui dépendent du bouche-à-oreille, ou qui ont déjà payé pour des leads sans résultat régulier.</p>',
      chips: ['Que veut dire « exclusive » ?', 'Demander un audit'],
      en: "<p>Businesses that live on local demand: tradespeople and builders, beauty studios and salons, health and wellbeing, home services, restaurants.<\/p><p>Especially those that depend on word of mouth, or have already paid for leads without steady results.<\/p>", enChips: ["What does “exclusive” mean?", "Request an audit"] },
    { id: 'where', k: ['where', 'geneva', 'switzerland', 'region', 'area', 'office', 'address', 'ou', 'où', 'geneve', 'lausanne', 'fribourg', 'neuchatel', 'valais', 'vaud', 'jura', 'sion', 'suisse', 'romande', 'zone', 'bureau', 'adresse', 'travaillez', 'intervenez', 'english', 'langue'],
      a: '<p>Partout en Suisse romande : Genève, Vaud, Fribourg, Neuchâtel, Valais et Jura. Les échanges se font par téléphone, WhatsApp ou visio, en français ou en anglais.</p><p>Nous sommes une entreprise suisse, basée dans le canton de Vaud.</p>',
      chips: ['Pour quels métiers ?', 'Parler à quelqu’un'],
      en: "<p>Everywhere in French-speaking Switzerland: Geneva, Vaud, Fribourg, Neuchâtel, Valais and Jura. We work by phone, WhatsApp or video call, in French or English.<\/p><p>We are a Swiss company based in the canton of Vaud.<\/p>", enChips: ["Which trades?", "Talk to a person"] },
    { id: 'who', k: ['who are you', 'agency', 'studio', 'team', 'company', 'about', 'qui', 'vous etes', 'agence', 'equipe', 'entreprise', 'societe', 'fondateur', 'a propos', 'presentation', 'amin', 'hamdi', 'founder', 'intermediaire', 'middleman'],
      a: '<p>Next Digital Level est une entreprise suisse fondée par Amin Hamdi. Depuis 5 ans, il construit des sites et des campagnes qui amènent des clients aux petites entreprises.</p><p>Sans intermédiaire : vous parlez directement à Amin, de l’audit aux demandes. Nos clients en parlent sur la page <a href="/avis">Avis clients</a>.</p>',
      chips: ['Comment ça marche ?', 'Demander un audit'],
      en: "<p>Next Digital Level is a Swiss company founded by Amin Hamdi. For 5 years he has been building websites and campaigns that bring clients to small businesses.<\/p><p>No middleman: you talk directly to Amin, from the audit to the enquiries. Our clients talk about it on the <a href=\"\/avis\">Client reviews<\/a> page.<\/p>", enChips: ["How does it work?", "Request an audit"] },
    { id: 'contact', k: ['contact', 'reach', 'call', 'phone number', 'email', 'write', 'human', 'person', 'someone', 'talk', 'appointment', 'hours', 'available', 'open', 'contacter', 'joindre', 'appeler', 'telephoner', 'numero', 'whatsapp', 'e-mail', 'mail', 'ecrire', 'humain', 'quelqu’un', 'quelqu\'un', 'personne', 'parler', 'rendez-vous', 'rdv', 'horaires', 'disponible'],
      a: '<p>Bien sûr. Nous sommes joignables 7 jours sur 7 :</p><p>Téléphone : <a href="' + TEL + '">' + PHONE + '</a><br>WhatsApp : <a href="' + WA + '">envoyer un message</a><br>E-mail : <a href="' + MAIL + '">contact@nextdigitalevel.com</a></p>',
      chips: ['Demander un audit'],
      en: "<p>Of course. You can reach us 7 days a week:<\/p><p>Phone: <a href=\"tel:+41762632817\">+41 76 263 28 17<\/a><br>WhatsApp: <a href=\"https://wa.me/41762632817\">send a message<\/a><br>Email: <a href=\"mailto:contact@nextdigitalevel.com\">contact@nextdigitalevel.com<\/a><\/p>", enChips: ["Request an audit"] },
  ];
  const ACTIONS = { 'Demander un audit': '/book', 'Parler à quelqu’un': WA, 'Voir des réalisations': '/#work', 'Request an audit': '/book', 'Talk to a person': WA, 'See our work': '/#work' };
  const FALLBACK_EN = '<p>I’m not sure I understand your question. I can tell you about the price, the free audit, exclusive enquiries, our channels or the commitment.</p><p>For a precise, quick answer, message us on <a href="' + WA + '">WhatsApp</a> or call <a href="' + TEL + '">' + PHONE + '</a>.</p>';
  const FALLBACK = [
    '<p>Je ne suis pas certain de bien saisir votre question. Je peux vous renseigner sur le prix, l’audit gratuit, les demandes exclusives, nos canaux ou l’engagement.</p><p>Pour une réponse précise et rapide, écrivez-nous directement sur <a href="' + WA + '">WhatsApp</a> ou appelez le <a href="' + TEL + '">' + PHONE + '</a>.</p>',
    '<p>Bonne question, et elle mérite une vraie réponse plutôt qu’une approximation. Posez-la nous sur <a href="' + WA + '">WhatsApp</a> : nous répondons 7 jours sur 7.</p><p>Sinon, je peux vous expliquer comment nous amenons des demandes à votre entreprise.</p>'
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
    if (!best || score < 1) return EN_UI ? { html: FALLBACK_EN, chips: ['How does it work?', 'How much does it cost?', 'Talk to a person'] } : { html: FALLBACK[Math.floor(Math.random() * FALLBACK.length)], chips: ['Comment ça marche ?', 'Combien ça coûte ?', 'Parler à quelqu’un'] };
    return EN_UI && best.en ? { html: best.en, chips: best.enChips || [] } : { html: best.a, chips: best.chips || [] };
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
      <span class="chat__launch-text">${EN_UI ? 'A question?' : 'Une question ?'}<small>${EN_UI ? 'Instant answer' : 'Réponse immédiate'}</small></span>
    </button>
    <section class="chat__panel" id="ndl-chat-panel" aria-label="Assistant Next Digital Level" hidden>
      <header class="chat__head">
        <span class="chat__avatar" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M8 21.5 13.6 15.4 17.6 19.4 24 11" stroke="#f7f4ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 11h-4.7M24 11v4.7" stroke="#c9a227" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <div class="chat__title"><b>${EN_UI ? 'NDL Assistant' : 'Assistant NDL'}</b><small>${EN_UI ? 'Online · replies in seconds' : 'En ligne · répond en quelques secondes'}</small></div>
        <button class="chat__close" type="button" aria-label="Fermer l’assistant">×</button>
      </header>
      <div class="chat__log" role="log" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form">
        <input class="chat__input" type="text" name="q" placeholder="${EN_UI ? 'Ask your question…' : 'Posez votre question…'}" autocomplete="off" maxlength="400" aria-label="Votre question">
        <button class="chat__send" type="submit" aria-label="Envoyer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </form>
      <p class="chat__foot">${EN_UI ? 'Your messages are not stored. For a direct chat: WhatsApp or phone.' : 'Vos messages ne sont pas conservés. Pour un échange direct : WhatsApp ou téléphone.'}</p>
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
      if (history.length) { history.forEach(m => bubble(m.role === 'user' ? 'user' : 'bot', m.role === 'user' ? escapeHtml(m.text) : '<p>' + escapeHtml(m.text) + '</p>')); setChips(EN_UI ? ['Request an audit', 'Talk to a person'] : ['Demander un audit', 'Parler à quelqu’un']); }
      else {
        const wait = typing();
        setTimeout(() => { wait.remove(); if (EN_UI) { bubble('bot', '<p><b>Hello!</b> I’m the Next Digital Level assistant. Ask me about our calls, quote requests and bookings, the price or the free audit.</p>', true); setChips(['How much does it cost?', 'How does it work?', 'What does “exclusive” mean?']); } else { bubble('bot', '<p><b>Bonjour !</b> Je suis l’assistant de Next Digital Level. Posez-moi vos questions sur nos appels, demandes de devis et réservations, le prix ou l’audit gratuit.</p>', true); setChips(['Combien ça coûte ?', 'Comment ça marche ?', 'Que veut dire « exclusive » ?']); } }, reduced.matches ? 0 : 900);
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
