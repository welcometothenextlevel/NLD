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
  const EN_UI = window.NDL_LANG === 'en';

  /* ---------- Knowledge base ----------
     Each intent: keywords (accent-insensitive, matched against the normalised
     question), a reply (HTML allowed, links only to our own contact points),
     optional chips (follow-up questions) and a weight bonus. */
  const KB = [
    { id: 'greet', k: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'coucou', 'hey'], w: 0.6,
      a: 'Bonjour ! Je suis l’assistant de Next Digital Level. Je peux vous expliquer notre offre, le déroulement d’un projet ou vous mettre en relation avec nous directement. Que souhaitez-vous savoir ?',
      chips: ['Combien coûte un site ?', 'Comment ça se passe ?', 'L’aperçu est-il vraiment gratuit ?'],
      en: "Hello! I’m the Next Digital Level assistant. I can explain our offer, how a project unfolds, or put you in touch with us directly. What would you like to know?", enChips: ["How much does a website cost?", "How does it work?", "Is the preview really free?"] },
    { id: 'thanks', k: ['merci', 'thanks', 'thank you', 'super', 'parfait', 'top', 'genial'], w: 0.6,
      a: 'Avec plaisir. Si vous voulez aller plus loin, le plus simple est de <a href="/book">demander votre aperçu gratuit</a> : vous verrez une proposition concrète avant toute décision.',
      chips: ['Demander un aperçu', 'Parler à quelqu’un'],
      en: "You’re welcome. To go further, the simplest step is to <a href=\"/book.html\">request your free preview<\/a>: you’ll see a concrete proposal before any decision.", enChips: ["Request a preview", "Talk to a person"] },
    { id: 'price', k: ['how much', 'pricing', 'quote', 'expensive', 'pay', 'prix', 'tarif', 'cout', 'coute', 'combien', 'budget', 'devis', 'cher', 'price', 'cost', 'chf', 'francs', 'euros', 'payer', 'paiement'],
      a: '<p>Nous ne publions pas de grille tarifaire, car chaque site est codé sur mesure : le périmètre (nombre de pages, fonctionnalités, contenus) change d’un projet à l’autre.</p><p>Concrètement : vous demandez un <b>aperçu gratuit</b>, nous échangeons sur votre activité, puis vous recevez une proposition claire, <b>sans frais récurrents</b> et sans abonnement. Vous décidez ensuite, sans obligation.</p>',
      chips: ['Y a-t-il un abonnement ?', 'Demander un aperçu', 'Que comprend le suivi ?'],
      en: "<p>We don’t publish a price list, because every site is hand-coded: the scope (number of pages, features, content) changes from one project to the next.<\/p><p>In practice: you request a <b>free preview<\/b>, we talk about your business, then you receive a clear proposal, <b>with no recurring fees<\/b> and no subscription. You decide afterwards, with no obligation.<\/p>", enChips: ["Is there a subscription?", "Request a preview", "What does the support include?"] },
    { id: 'preview', k: ['free', 'mock-up', 'mockup', 'trial', 'commitment', 'apercu', 'aperçu', 'gratuit', 'preview', 'maquette', 'essai', 'demo', 'demonstration', 'obligation', 'engagement', 'engager'],
      a: '<p>Oui, l’aperçu est vraiment gratuit et sans obligation. Vous nous parlez de votre activité, nous préparons une première version de votre site : direction visuelle, structure, ton.</p><p>Vous jugez sur pièce. Si cela vous plaît, nous affinons ensemble ; sinon, vous ne devez rien.</p>',
      chips: ['Demander un aperçu', 'Combien de temps ça prend ?'],
      en: "<p>Yes, the preview is genuinely free and without obligation. You tell us about your business, we prepare a first version of your site: visual direction, structure, tone.<\/p><p>You judge the real thing. If you like it, we refine it together; if not, you owe nothing.<\/p>", enChips: ["Request a preview", "How long does it take?"] },
    { id: 'delay', k: ['how long', 'delay', 'deadline', 'days', 'week', 'weeks', 'fast', 'quick', 'when', 'delai', 'delais', 'temps', 'jours', 'semaine', 'semaines', 'rapide', 'vite', 'quand', 'duree', 'combien de temps', 'livraison', 'pret'],
      a: '<p>Votre site est <b>prêt sous 7 jours</b> après validation du projet et réception des éléments nécessaires (textes, photos, coordonnées).</p><p>Avant cela, l’aperçu gratuit demande généralement quelques jours. Nous fixons ensemble les pages, les fonctionnalités et le calendrier avant de commencer.</p>',
      chips: ['Que dois-je fournir ?', 'Comment ça se passe ?'],
      en: "<p>Your site is <b>ready within 7 days<\/b> after project approval and receipt of the material we need (text, photos, contact details).<\/p><p>Before that, the free preview usually takes a few days. We agree on pages, features and timeline together before starting.<\/p>", enChips: ["What do I need to provide?", "How does it work?"] },
    { id: 'subscription', k: ['subscription', 'monthly', 'recurring', 'fees', 'hosting', 'maintenance', 'abonnement', 'mensuel', 'recurrent', 'recurrents', 'frais', 'hebergement', 'heberge', 'hosting', 'maintenance', 'annuel', 'location'],
      a: '<p>Notre création de site est <b>sans frais récurrents</b> : pas d’abonnement, pas de location. Le site vous appartient, code compris.</p><p>Les seuls coûts tiers possibles sont votre nom de domaine et, si vous en avez besoin, un outil externe (réservation en ligne, par exemple). Tout est précisé avant votre accord.</p>',
      chips: ['Le nom de domaine ?', 'Que comprend le suivi ?'],
      en: "<p>Our website creation has <b>no recurring fees<\/b>: no subscription, no rental. The site belongs to you, code included.<\/p><p>The only possible third-party costs are your domain name and, if you need one, an external tool (online booking, for example). Everything is spelled out before you commit.<\/p>", enChips: ["The domain name?", "What does the support include?"] },
    { id: 'followup', k: ['support', 'follow-up', 'after launch', 'warranty', 'help', 'suivi', '12 mois', 'douze mois', 'apres', 'support', 'assistance', 'aide', 'accompagnement', 'garantie', 'sav'],
      a: '<p>Chaque site inclut <b>12 mois de suivi</b> : un interlocuteur pour vos questions, l’aide à la prise en main et les ajustements après la mise en ligne.</p><p>Nous sommes joignables 7 jours sur 7 par téléphone, WhatsApp ou e-mail. Le périmètre des interventions est défini ensemble avant le lancement.</p>',
      chips: ['Puis-je modifier mon site ?', 'Parler à quelqu’un'],
      en: "<p>Every site includes <b>12 months of support<\/b>: one contact for your questions, help getting started and adjustments after launch.<\/p><p>We’re reachable 7 days a week by phone, WhatsApp or email. The scope of the work is defined together before launch.<\/p>", enChips: ["Can I edit my site?", "Talk to a person"] },
    { id: 'process', k: ['how does it work', 'process', 'steps', 'how it works', 'start', 'comment', 'process', 'processus', 'methode', 'etapes', 'deroule', 'deroulement', 'fonctionne', 'marche', 'commencer', 'demarrer', 'ca se passe'],
      a: '<p>Quatre étapes, un seul interlocuteur :</p><p><b>1.</b> On en parle (téléphone ou WhatsApp).<br><b>2.</b> Vous recevez un aperçu gratuit.<br><b>3.</b> Après votre accord, le site est prêt sous 7 jours, mise en ligne comprise.<br><b>4.</b> 12 mois de suivi, 7 jours sur 7.</p>',
      chips: ['Demander un aperçu', 'Que dois-je fournir ?'],
      en: "<p>Four steps, one contact:<\/p><p><b>1.<\/b> We talk (phone or WhatsApp).<br><b>2.<\/b> You receive a free preview.<br><b>3.<\/b> After your approval, the site is ready within 7 days, publishing included.<br><b>4.<\/b> 12 months of support, 7 days a week.<\/p>", enChips: ["Request a preview", "What do I need to provide?"] },
    { id: 'content', k: ['provide', 'photos', 'pictures', 'text', 'content', 'copy', 'logo', 'fournir', 'photos', 'photo', 'images', 'textes', 'texte', 'contenu', 'contenus', 'redaction', 'rediger', 'logo', 'elements', 'besoin de quoi'],
      a: '<p>Le minimum : vos coordonnées, la liste de vos services et quelques photos de votre travail (celles de votre téléphone conviennent souvent).</p><p>Nous rédigeons les textes avec vous et structurons les pages. Si vous n’avez pas de logo, nous pouvons en discuter.</p>',
      chips: ['Combien de temps ça prend ?', 'Demander un aperçu'],
      en: "<p>The minimum: your contact details, the list of your services and a few photos of your work (phone photos are often fine).<\/p><p>We write the text with you and structure the pages. If you don’t have a logo, we can talk about it.<\/p>", enChips: ["How long does it take?", "Request a preview"] },
    { id: 'seo', k: ['ranking', 'search', 'found', 'visibility', 'business profile', 'google', 'seo', 'referencement', 'visible', 'visibilite', 'trouve', 'trouver', 'recherche', 'classement', 'premiere page', 'business profile', 'fiche'],
      a: '<p>Chaque site est construit avec les bases du <b>SEO local</b> : titres, descriptions, données structurées, pages rapides et contenu régional pertinent.</p><p>Nous pouvons aussi vous accompagner sur votre fiche Google Business Profile. Nous ne garantissons pas de classement précis, personne ne le peut honnêtement, mais nous mettons toutes les bases en place.</p>',
      chips: ['Faites-vous de la publicité ?', 'Demander un aperçu'],
      en: "<p>Every site is built with <b>local SEO<\/b> fundamentals: titles, descriptions, structured data, fast pages and relevant regional content.<\/p><p>We can also help with your Google Business Profile. We don’t guarantee a specific ranking, nobody honestly can, but we put all the foundations in place.<\/p>", enChips: ["Do you run ads?", "Request a preview"] },
    { id: 'ads', k: ['advertising', 'advert', 'campaign', 'social', 'publicite', 'pub', 'ads', 'google ads', 'meta', 'facebook', 'instagram', 'reseaux', 'sociaux', 'campagne'],
      a: '<p>Oui. En complément du site, nous accompagnons certaines PME sur leur visibilité : Google Business Profile, campagnes ciblées et présence locale. Vous trouverez le détail sur la page <a href="/advertising">Visibilité &amp; publicité</a>.</p><p>Le site reste la priorité : c’est lui qui transforme une visite en appel.</p>',
      chips: ['Comment ça se passe ?', 'Parler à quelqu’un'],
      en: "<p>Yes. Alongside the site, we help some businesses with their visibility: Google Business Profile, targeted campaigns and local presence. Details are on the <a href=\"/advertising.html\">Visibility &amp; advertising<\/a> page.<\/p><p>The site stays the priority: it’s what turns a visit into a call.<\/p>", enChips: ["How does it work?", "Talk to a person"] },
    { id: 'domain', k: ['domain', 'domain name', 'publish', 'go live', 'domaine', 'nom de domaine', '.ch', 'adresse du site', 'url', 'dns', 'mise en ligne', 'en ligne', 'publier'],
      a: '<p>Nous nous occupons de la partie technique : nom de domaine, mise en ligne, certificat HTTPS et redirections. Si vous avez déjà un domaine, nous le conservons.</p><p>Le domaine est enregistré à votre nom : il vous appartient.</p>',
      chips: ['Y a-t-il un abonnement ?', 'J’ai déjà un site'],
      en: "<p>We handle the technical side: domain name, publishing, HTTPS certificate and redirects. If you already have a domain, we keep it.<\/p><p>The domain is registered in your name: it belongs to you.<\/p>", enChips: ["Is there a subscription?", "I already have a site"] },
    { id: 'redo', k: ['already have', 'redesign', 'rebuild', 'existing', 'old site', 'current site', 'change', 'deja un site', 'refonte', 'refaire', 'existant', 'ancien', 'actuel', 'moderniser', 'wordpress', 'wix', 'squarespace', 'jimdo', 'shopify', 'template', 'changer'],
      a: '<p>Oui, nous refaisons des sites existants. Nous partons de ce qui fonctionne, conservons votre nom de domaine et votre référencement, puis reconstruisons le site sur mesure, sans template ni constructeur.</p><p>L’aperçu gratuit vous montre la différence, côte à côte, avant toute décision.</p>',
      chips: ['Demander un aperçu', 'Pourquoi sur mesure ?'],
      en: "<p>Yes, we rebuild existing sites. We start from what works, keep your domain name and search presence, then rebuild the site from scratch, with no template or site builder.<\/p><p>The free preview shows you the difference, side by side, before any decision.<\/p>", enChips: ["Request a preview", "Why custom?"] },
    { id: 'custom', k: ['why custom', 'difference', 'advantage', 'custom', 'coded', 'technology', 'sur mesure', 'pourquoi', 'difference', 'different', 'avantage', 'code', 'codé', 'developpement', 'technologie', 'template generique'],
      a: '<p>Un template ressemble à des milliers d’autres sites et vous rend dépendant d’une plateforme. Un site codé sur mesure est <b>dessiné pour votre entreprise</b>, plus léger, plus rapide sur mobile, et il vous appartient.</p><p>Et il n’y a ni abonnement ni extension à maintenir.</p>',
      chips: ['Combien coûte un site ?', 'Voir des réalisations'],
      en: "<p>A template looks like thousands of other sites and makes you dependent on a platform. A hand-coded site is <b>designed for your business<\/b>, lighter, faster on mobile, and it belongs to you.<\/p><p>And there is no subscription and no plugin to maintain.<\/p>", enChips: ["How much does a website cost?", "See our work"] },
    { id: 'edit', k: ['edit', 'update', 'change myself', 'myself', 'manage', 'modifier', 'modification', 'changer moi-meme', 'mettre a jour', 'ajouter', 'moi-meme', 'moi meme', 'autonome', 'gerer'],
      a: '<p>Pendant les 12 mois de suivi, vous nous envoyez simplement vos modifications et nous les intégrons.</p><p>Si vous souhaitez gérer certains contenus vous-même (actualités, menu, tarifs), dites-le nous dès le départ : nous prévoyons la solution adaptée.</p>',
      chips: ['Que comprend le suivi ?', 'Demander un aperçu'],
      en: "<p>During the 12 months of support, you simply send us your changes and we make them.<\/p><p>If you want to manage some content yourself (news, menu, prices), tell us from the start: we plan the right solution.<\/p>", enChips: ["What does the support include?", "Request a preview"] },
    { id: 'features', k: ['booking', 'appointment', 'shop', 'e-commerce', 'online store', 'form', 'multilingual', 'languages', 'translation', 'gallery', 'reservation', 'rendez-vous en ligne', 'agenda', 'boutique', 'e-commerce', 'ecommerce', 'vente en ligne', 'paiement en ligne', 'formulaire', 'multilingue', 'allemand', 'anglais', 'langues', 'traduction', 'blog', 'galerie'],
      a: '<p>Formulaires de contact, galerie, prise de rendez-vous, site en plusieurs langues (français, allemand, anglais, italien), vitrine de produits : nous définissons ensemble les fonctionnalités utiles à vos clients.</p><p>Pour les besoins spécifiques comme une boutique en ligne complète, nous en parlons lors du premier échange pour vous proposer la bonne approche.</p>',
      chips: ['Demander un aperçu', 'Combien de temps ça prend ?'],
      en: "<p>Contact forms, gallery, appointment booking, multilingual sites (French, German, English, Italian), product showcases: we define together the features that are useful to your customers.<\/p><p>For specific needs such as a full online shop, we discuss it during the first conversation to propose the right approach.<\/p>", enChips: ["Request a preview", "How long does it take?"] },
    { id: 'mobile', k: ['phone', 'smartphone', 'tablet', 'responsive', 'mobile', 'telephone', 'smartphone', 'tablette', 'responsive', 'iphone', 'android'],
      a: '<p>Chaque site est conçu d’abord pour le téléphone : c’est là que la majorité de vos clients vous découvrent. Un geste suffit pour vous appeler, vous écrire sur WhatsApp ou trouver votre adresse.</p>',
      chips: ['Voir des réalisations', 'Demander un aperçu'],
      en: "<p>Every site is designed for the phone first: that’s where most of your customers discover you. One tap is enough to call you, message you on WhatsApp or find your address.<\/p>", enChips: ["See our work", "Request a preview"] },
    { id: 'work', k: ['portfolio', 'examples', 'projects', 'clients', 'australia', 'experience', 'work', 'realisations', 'realisation', 'exemples', 'exemple', 'portfolio', 'references', 'projets', 'clients', 'australie', 'australiennes', 'experience', 'travaux'],
      a: '<p>Nous avons accompagné des petites entreprises en Australie : institut de beauté, services à la personne, nettoyage, bijouterie, transport, club sportif. Les sites sont en ligne dans la section <a href="/#work">Réalisations</a>.</p><p>La même attention est portée aux PME de Suisse romande aujourd’hui.</p>',
      chips: ['Pour quels métiers ?', 'Demander un aperçu'],
      en: "<p>We have worked with small businesses in Australia: beauty studio, care services, cleaning, jewellery, transport, sports club. The sites are live in the <a href=\"/#work\">Our work<\/a> section.<\/p><p>The same care goes to SMEs in French-speaking Switzerland today.<\/p>", enChips: ["Which trades?", "Request a preview"] },
    { id: 'sectors', k: ['trades', 'trade', 'salon', 'beauty', 'hairdresser', 'restaurant', 'doctor', 'therapist', 'plumber', 'electrician', 'painter', 'lawyer', 'garage', 'shop', 'independent', 'sme', 'which trades', 'metier', 'metiers', 'secteur', 'activite', 'artisan', 'artisans', 'salon', 'institut', 'beaute', 'coiffeur', 'restaurant', 'medecin', 'therapeute', 'plombier', 'electricien', 'peintre', 'avocat', 'fiduciaire', 'garage', 'commerce', 'independant', 'pme'],
      a: '<p>Nous travaillons avec les PME et indépendants de Suisse romande : artisans et entreprises de services, salons et instituts, commerces, thérapeutes, professions libérales.</p><p>Si vos clients cherchent un prestataire près de chez eux, un site clair et bien référencé localement fait la différence.</p>',
      chips: ['Voir des réalisations', 'Demander un aperçu'],
      en: "<p>We work with SMEs and independents in French-speaking Switzerland: trades and service businesses, salons and clinics, shops, therapists, professionals.<\/p><p>If your customers look for a provider near them, a clear, locally well-referenced site makes the difference.<\/p>", enChips: ["See our work", "Request a preview"] },
    { id: 'where', k: ['where', 'geneva', 'switzerland', 'region', 'area', 'office', 'address', 'work in', 'english', 'ou', 'où', 'geneve', 'lausanne', 'fribourg', 'neuchatel', 'valais', 'vaud', 'jura', 'sion', 'suisse', 'romande', 'region', 'zone', 'deplacer', 'bureau', 'adresse', 'local', 'france', 'belgique', 'travaillez', 'intervenez', 'english', 'in english', 'francais', 'langue'],
      a: '<p>Next Digital Level est une <b>entreprise suisse</b>. Nous accompagnons toute la Suisse romande : Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura.</p><p>Les échanges se font par téléphone, WhatsApp ou visio, et en anglais si vous préférez.</p>',
      chips: ['Comment ça se passe ?', 'Parler à quelqu’un'],
      en: "<p>Next Digital Level is a <b>Swiss company<\/b>. We support all of French-speaking Switzerland: Geneva, Vaud, Fribourg, Neuchâtel, Valais, Jura.<\/p><p>We work by phone, WhatsApp or video call, in French or English.<\/p>", enChips: ["How does it work?", "Talk to a person"] },
    { id: 'who', k: ['who are you', 'agency', 'studio', 'team', 'company', 'about', 'qui', 'vous etes', 'agence', 'studio', 'equipe', 'entreprise', 'societe', 'fondateur', 'a propos', 'presentation'],
      a: '<p>Next Digital Level est un studio suisse de création de sites web sur mesure pour les PME. Nous avons construit des sites pour des petites entreprises en Australie avant de nous consacrer à la Suisse romande.</p><p>Sans intermédiaire : la personne qui vous répond est celle qui conçoit et code votre site.</p>',
      chips: ['Voir des réalisations', 'Comment ça se passe ?'],
      en: "<p>Next Digital Level is a Swiss studio building hand-coded websites for small businesses. We built sites for small businesses in Australia before focusing on French-speaking Switzerland.<\/p><p>No middleman: the person who answers you is the one who designs and codes your site.<\/p>", enChips: ["See our work", "How does it work?"] },
    { id: 'contact', k: ['contact', 'reach', 'call', 'phone number', 'email', 'write', 'human', 'person', 'someone', 'talk', 'appointment', 'hours', 'available', 'open', 'contact', 'contacter', 'joindre', 'appeler', 'telephoner', 'numero', 'whatsapp', 'email', 'e-mail', 'mail', 'ecrire', 'humain', 'quelqu’un', 'quelqu\'un', 'personne', 'parler', 'rendez-vous', 'rdv', 'horaires', 'disponible', 'ouvert'],
      a: '<p>Bien sûr. Vous pouvez nous joindre 7 jours sur 7 :</p><p>Téléphone : <a href="' + TEL + '">' + PHONE + '</a><br>WhatsApp : <a href="' + WA + '">écrire un message</a><br>E-mail : <a href="' + MAIL + '">contact@nextdigitalevel.com</a></p>',
      chips: ['Demander un aperçu'],
      en: "<p>Of course. You can reach us 7 days a week:<\/p><p>Phone: <a href=\"tel:+41762632817\">+41 76 263 28 17<\/a><br>WhatsApp: <a href=\"https://wa.me/41762632817\">send a message<\/a><br>Email: <a href=\"mailto:contact@nextdigitalevel.com\">contact@nextdigitalevel.com<\/a><\/p>", enChips: ["Request a preview"] },
    { id: 'security', k: ['security', 'secure', 'certificate', 'gdpr', 'data', 'privacy', 'securite', 'securise', 'https', 'ssl', 'certificat', 'rgpd', 'donnees', 'protection', 'nlpd'],
      a: '<p>Chaque site est livré en HTTPS avec certificat, redirections et bonnes pratiques configurés. Nous limitons les scripts tiers au strict nécessaire, ce qui est bon pour la vitesse comme pour la protection des données de vos visiteurs.</p>',
      chips: ['Que comprend chaque site ?', 'Demander un aperçu'],
      en: "<p>Every site ships over HTTPS with certificate, redirects and best practices configured. We keep third-party scripts to the strict minimum, which is good for speed and for your visitors’ privacy alike.<\/p>", enChips: ["What’s included in each site?", "Request a preview"] },
    { id: 'included', k: ['included', 'include', 'contains', 'deliverable', 'package', 'offer', 'what’s included', 'inclus', 'compris', 'comprend', 'contient', 'livre', 'livrable', 'pack', 'offre'],
      a: '<p>Inclus d’office : design responsive, pages rapides, contact en un geste (appel, WhatsApp, e-mail, itinéraire), SEO local, HTTPS, accessibilité, nom de domaine et mise en ligne, et 12 mois de suivi.</p><p>Le détail est sur la page <a href="/websites">Sites sur mesure</a>.</p>',
      chips: ['Combien coûte un site ?', 'Demander un aperçu'],
      en: "<p>Included by default: responsive design, fast pages, contact in one tap (call, WhatsApp, email, directions), local SEO, HTTPS, accessibility, domain name and publishing, and 12 months of support.<\/p><p>Details are on the <a href=\"/websites.html\">Custom websites<\/a> page.<\/p>", enChips: ["How much does a website cost?", "Request a preview"] }
  ];
  const ACTIONS = { 'Demander un aperçu': '/book', 'Parler à quelqu’un': WA, 'Voir des réalisations': '/#work', 'Request a preview': '/book', 'Talk to a person': WA, 'See our work': '/#work' };
  const FALLBACK_EN = '<p>I’m not sure I understand your question. I can tell you about the offer, timelines, the free preview, the support or our work.</p><p>For a precise, quick answer, message us on <a href="' + WA + '">WhatsApp</a> or call <a href="' + TEL + '">' + PHONE + '</a>.</p>';
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
    if (!best || score < 1) return EN_UI ? { html: FALLBACK_EN, chips: ['How does it work?', 'What’s included in each site?', 'Talk to a person'] } : { html: FALLBACK[Math.floor(Math.random() * FALLBACK.length)], chips: ['Comment ça se passe ?', 'Que comprend chaque site ?', 'Parler à quelqu’un'] };
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
      if (history.length) { history.forEach(m => bubble(m.role === 'user' ? 'user' : 'bot', m.role === 'user' ? escapeHtml(m.text) : '<p>' + escapeHtml(m.text) + '</p>')); setChips(EN_UI ? ['Request a preview', 'Talk to a person'] : ['Demander un aperçu', 'Parler à quelqu’un']); }
      else {
        const wait = typing();
        setTimeout(() => { wait.remove(); if (EN_UI) { bubble('bot', '<p><b>Hello!</b> I’m the Next Digital Level assistant. Ask me about our custom websites, timelines or the free preview.</p>', true); setChips(['How much does a website cost?', 'How does it work?', 'Is the preview really free?']); } else { bubble('bot', '<p><b>Bonjour !</b> Je suis l’assistant de Next Digital Level. Posez-moi vos questions sur nos sites sur mesure, les délais ou l’aperçu gratuit.</p>', true); setChips(['Combien coûte un site ?', 'Comment ça se passe ?', 'L’aperçu est-il vraiment gratuit ?']); } }, reduced.matches ? 0 : 900);
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
