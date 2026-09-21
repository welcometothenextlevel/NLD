/* Next Digital Level — preferences: colour theme and language.
   The theme is a data attribute on <html>, read before first paint by the
   inline script in <head>. The language swaps the page's French text for
   English from the dictionary below, matched on the element's own markup,
   so no data attributes are needed in the HTML. Switching language reloads
   the page so that motion.js splits the new headings cleanly. */
(function () {
  'use strict';
  const doc = document.documentElement;
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  let theme = doc.dataset.theme === 'dark' ? 'dark' : 'light';
  let lang = doc.dataset.lang === 'en' ? 'en' : 'fr';

  /* ---------- Theme ---------- */
  function setTheme(next) {
    theme = next;
    if (next === 'dark') doc.dataset.theme = 'dark'; else delete doc.dataset.theme;
    try { localStorage.setItem('ndl-theme', next); } catch (e) { /* ignore */ }
    document.dispatchEvent(new Event('ndl:theme'));
    $$('[data-theme-toggle]').forEach(b => b.setAttribute('aria-label', next === 'dark' ? (lang === 'en' ? 'Switch to light mode' : 'Passer en mode clair') : (lang === 'en' ? 'Switch to dark mode' : 'Passer en mode sombre')));
  }
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark')));
  setTheme(theme);

  /* ---------- Language ---------- */
  $$('[data-lang-toggle]').forEach(b => {
    const label = b.querySelector('[data-lang-label]');
    if (label) label.textContent = lang === 'en' ? 'FR' : 'EN';
    b.setAttribute('aria-label', lang === 'en' ? 'Passer en français' : 'Switch to English');
    b.addEventListener('click', () => {
      try { localStorage.setItem('ndl-lang', lang === 'en' ? 'fr' : 'en'); } catch (e) { /* ignore */ }
      location.reload();
    });
  });

  const EN = {
    /* chrome */
    'Aller au contenu': 'Skip to content',
    'Sites sur mesure': 'Custom websites',
    'Réalisations': 'Our work',
    'La méthode': 'The method',
    'Le studio': 'The studio',
    'Aperçu gratuit {ico}': 'Free preview {ico}',
    '<span>01</span> Sites sur mesure': '<span>01</span> Custom websites',
    '<span>02</span> Réalisations': '<span>02</span> Our work',
    '<span>03</span> La méthode': '<span>03</span> The method',
    '<span>04</span> Le studio': '<span>04</span> The studio',
    '<span>05</span> Visibilité': '<span>05</span> Visibility',
    'Demander mon aperçu{ico}': 'Request my preview{ico}',
    'Appeler le +41 76 263 28 17{ico}': 'Call +41 76 263 28 17{ico}',
    'Écrire sur WhatsApp': 'Message us on WhatsApp',
    'Demander mon aperçu gratuit{ico}': 'Request my free preview{ico}',
    'Nous appeler{ico}': 'Call us{ico}',
    'Appeler {ico}': 'Call {ico}',
    'Entreprise suisse. Des sites codés sur mesure pour les PME, avec un aperçu gratuit avant de vous engager.': 'A Swiss company. Hand-coded websites for small businesses, with a free preview before you commit.',
    'À votre écoute 7 jours sur 7': 'Available 7 days a week',
    'Votre projet': 'Your project',
    'Nos services': 'Our services',
    'Votre activité': 'Your business',
    'Parlons-en': 'Let’s talk',
    '<a href="/websites.html">Sites sur mesure</a>': '<a href="/websites.html">Custom websites</a>',
    '<a href="/advertising.html">Visibilité &amp; publicité</a>': '<a href="/advertising.html">Visibility &amp; advertising</a>',
    '<a href="/index.html#work">Réalisations</a>': '<a href="/index.html#work">Our work</a>',
    '<a href="/index.html#guarantee">Nos engagements</a>': '<a href="/index.html#guarantee">Our commitments</a>',
    '<a href="/design-sur-mesure.html">Design à votre image</a>': '<a href="/design-sur-mesure.html">Design in your image</a>',
    '<a href="/developpement-sur-mesure.html">Code sur mesure</a>': '<a href="/developpement-sur-mesure.html">Hand-written code</a>',
    '<a href="/seo-local.html">SEO local &amp; Google</a>': '<a href="/seo-local.html">Local SEO &amp; Google</a>',
    '<a href="/site-mobile.html">Pensé pour le mobile</a>': '<a href="/site-mobile.html">Built for mobile</a>',
    '<a href="/contenu-redaction.html">Textes &amp; structure</a>': '<a href="/contenu-redaction.html">Copy &amp; structure</a>',
    '<a href="/suivi-12-mois.html">Suivi 12 mois</a>': '<a href="/suivi-12-mois.html">12 months of support</a>',
    '<a href="/tradie-websites.html">Artisans &amp; services</a>': '<a href="/tradie-websites.html">Trades &amp; services</a>',
    '<a href="/beauty-salon-websites.html">Salons &amp; instituts</a>': '<a href="/beauty-salon-websites.html">Salons &amp; clinics</a>',
    '<a href="/ndis-provider-websites.html">Expérience NDIS en Australie</a>': '<a href="/ndis-provider-websites.html">NDIS experience in Australia</a>',
    '<a href="/web-design-melbourne.html">Notre expérience australienne</a>': '<a href="/web-design-melbourne.html">Our Australian experience</a>',
    '<a href="/website-cost-australia.html">Préparer votre projet</a>': '<a href="/website-cost-australia.html">Preparing your project</a>',
    '<a href="/book.html">Demander un aperçu gratuit</a>': '<a href="/book.html">Request a free preview</a>',
    'Sur mesure · Sans frais récurrents · Suivi 12 mois': 'Custom-built · No recurring fees · 12 months of support',
    '© <span data-year>2026</span> Next Digital Level · Suisse': '© <span data-year>2026</span> Next Digital Level · Switzerland',

    /* hero */
    '<span class="pip" aria-hidden="true"></span>Entreprise suisse · PME &amp; indépendants': '<span class="pip" aria-hidden="true"></span>Swiss company · SMEs &amp; independents',
    'Votre savoir-faire.<br>Un site<br><em>à sa hauteur.</em>': 'Your craft.<br>A website<br><em>that lives up to it.</em>',
    'Des sites web codés sur mesure pour les PME de Suisse romande. Découvrez votre <strong>aperçu gratuit avant de vous engager.</strong>': 'Hand-coded websites for small businesses in French-speaking Switzerland. See your <strong>free preview before you commit.</strong>',
    'Sans template générique. Sans frais récurrents.': 'No generic template. No recurring fees.',
    'Découvrez nos réalisations {ico}': 'See our work {ico}',
    'Votre entreprise · la méthode en 4 étapes': 'Your business · the method in 4 steps',
    'Votre entreprise.': 'Your business.',
    'Étape 01 · On en parle': 'Step 01 · We talk',
    'Ce que vous faites bien.<br><em>On en discute d’abord.</em>': 'What you do well.<br><em>We talk about it first.</em>',
    'Votre activité, vos clients et ce que votre site doit leur permettre. 30 minutes, par téléphone ou WhatsApp.': 'Your business, your customers and what your website must let them do. 30 minutes, by phone or WhatsApp.',
    'Bonjour, je suis plombier à Fribourg…': 'Hello, I’m a plumber in Fribourg…',
    'Parfait. Vos clients vous trouvent comment aujourd’hui ?': 'Great. How do customers find you today?',
    'Bouche-à-oreille surtout.': 'Mostly word of mouth.',
    'Étape 02 · Aperçu gratuit': 'Step 02 · Free preview',
    'Nous construisons un aperçu.<br><em>Sans rien payer.</em>': 'We build a preview.<br><em>You pay nothing.</em>',
    'Vous voyez une première version de votre site : direction visuelle, structure, ton. Vous jugez sur pièce.': 'You see a first version of your site: visual direction, structure, tone. You judge the real thing.',
    'Aperçu · gratuit': 'Preview · free',
    'Étape 03 · Réalisation': 'Step 03 · Build',
    'Votre site est prêt<br><em>sous 7 jours.</em>': 'Your site is ready<br><em>within 7 days.</em>',
    'Après votre accord et vos contenus, nous codons, testons sur mobile et mettons en ligne sur votre domaine.': 'Once you approve and send your content, we code, test on mobile and publish on your domain.',
    '{ico}En ligne': '{ico}Live',
    'Étape 04 · Suivi': 'Step 04 · Support',
    '12 mois à vos côtés.<br><em>7 jours sur 7.</em>': '12 months by your side.<br><em>7 days a week.</em>',
    'Une modification, une question, une nouvelle page : vous nous écrivez, nous nous en occupons.': 'A change, a question, a new page: you message us, we take care of it.',
    'Pouvez-vous ajouter mes horaires d’été ?': 'Could you add my summer opening hours?',
    'C’est fait.': 'Done.',
    'Voir l’étape suivante {ico}': 'See the next step {ico}',
    '<span>01</span>On en parle': '<span>01</span>We talk',
    '<span>02</span>Aperçu gratuit': '<span>02</span>Free preview',
    '<span>03</span>Prêt sous 7 jours': '<span>03</span>Ready in 7 days',
    '<span>04</span>Suivi 12 mois': '<span>04</span>12-month support',
    'Appuyez sur « Voir l’étape suivante »': 'Tap “See the next step”',
    'Étape 1 / 4': 'Step 1 / 4',
    '<b>D’abord, vous voyez.</b><br>Ensuite, vous décidez.': '<b>First, you see it.</b><br>Then you decide.',
    'Performance': 'Performance',
    'Chargement rapide': 'Fast loading',
    'Mobile': 'Mobile',
    'Un geste pour appeler': 'One tap to call',

    /* ticker + strip */
    'Suisse romande': 'French-speaking Switzerland',
    '<em>Codé</em> sur mesure': '<em>Hand-coded</em> for you',
    'Sans template': 'No template',
    'Sans abonnement': 'No subscription',
    'Prêt sous 7 jours': 'Ready in 7 days',
    'Suivi 12 mois': '12-month support',
    'Aperçu gratuit': 'Free preview',
    '<span data-count="7">7</span> jours': '<span data-count="7">7</span> days',
    'pour un site prêt*': 'to a finished site*',
    '<span data-count="12">12</span> mois': '<span data-count="12">12</span> months',
    'de suivi inclus': 'of support included',
    'Sur mesure': 'Custom-built',
    '7j/7': '7/7',
    'entièrement codé pour vous': 'entirely coded for you',
    'à votre écoute': 'available to you',
    '* Après validation du projet et réception des éléments nécessaires.': '* After project approval and receipt of the required material.',

    /* showcase */
    'Des sites': 'Real',
    '<em>réels.</em>': '<em>websites.</em>',
    '<span class="pip" aria-hidden="true"></span>Site en ligne': '<span class="pip" aria-hidden="true"></span>Live site',
    '<span class="showcase__hint-l">Faites défiler</span><span class="showcase__hint-r">pour agrandir</span>': '<span class="showcase__hint-l">Scroll</span><span class="showcase__hint-r">to expand</span>',
    'Glisser': 'Drag',
    '<b>Trident Cross Marine</b><span>Entretien de bateaux</span>': '<b>Trident Cross Marine</b><span>Boat detailing</span>',
    '<b>Everest Badminton</b><span>Club sportif</span>': '<b>Everest Badminton</b><span>Sports club</span>',
    '<b>Citiport</b><span>Transport &amp; réservation</span>': '<b>Citiport</b><span>Transport &amp; booking</span>',
    '<b>Talofa Support</b><span>Services NDIS</span>': '<b>Talofa Support</b><span>NDIS services</span>',
    '<b>All In 1 Party World</b><span>Commerce</span>': '<b>All In 1 Party World</b><span>Retail</span>',
    'Voir le site en ligne{ico}': 'Visit the live site{ico}',
    'Toutes les réalisations {ico}': 'All our work {ico}',

    /* services */
    '/ Un site qui travaille pour vous': '/ A website that works for you',
    'Inspirer confiance.<br>Donner envie de vous contacter.': 'Inspire trust.<br>Make people want to call.',
    'Chaque site que nous livrons réunit six ingrédients. Aucun n’est optionnel, aucun n’est facturé en plus.': 'Every site we deliver brings six ingredients together. None is optional, none is charged extra.',
    'Design à votre image': 'Design in your image',
    'Une direction artistique pensée pour votre métier, vos couleurs et votre clientèle. Pas un thème acheté, pas un gabarit rempli.': 'An art direction built around your trade, your colours and your customers. Not a purchased theme, not a filled-in template.',
    'Code sur mesure': 'Hand-written code',
    'Écrit ligne par ligne, sans constructeur ni extension à maintenir. Le résultat : des pages légères, rapides et qui vous appartiennent.': 'Written line by line, with no site builder or plugins to maintain. The result: light, fast pages that belong to you.',
    'Les bases pour être trouvé': 'The basics to be found',
    'Optimisation SEO, pages rapides et contenu local pertinent. Nous vous accompagnons aussi sur Google Business Profile lorsque c’est adapté.': 'SEO fundamentals, fast pages and relevant local content. We also help with Google Business Profile when it makes sense.',
    'Pensé pour le mobile': 'Built for mobile',
    'La majorité de vos clients vous découvrent sur leur téléphone. Un geste suffit pour vous appeler, vous écrire ou trouver votre adresse.': 'Most of your customers discover you on their phone. One tap is enough to call you, message you or find your address.',
    'Textes et structure': 'Copy and structure',
    'Nous rédigeons avec vous des pages claires : vos services, votre différence, votre zone d’intervention. Le bon mot au bon endroit.': 'We write clear pages with you: your services, what sets you apart, the area you serve. The right words in the right place.',
    '12 mois à vos côtés': '12 months by your side',
    'Après la mise en ligne, un interlocuteur reste disponible 7 jours sur 7 pour vos questions, vos ajustements et la prise en main.': 'After launch, one contact stays available 7 days a week for your questions, adjustments and getting started.',
    'En savoir plus{ico}': 'Learn more{ico}',

    /* comparison */
    '/ Pourquoi sur mesure': '/ Why custom',
    'Un template générique ressemble<br>à tous les autres. <em>Pas vous.</em>': 'A generic template looks<br>like all the others. <em>You don’t.</em>',
    'Template / constructeur': 'Template / site builder',
    'Design': 'Design',
    'Un thème partagé par des milliers de sites': 'A theme shared by thousands of sites',
    '<b>Dessiné pour votre entreprise</b>': '<b>Designed for your business</b>',
    'Coût dans le temps': 'Cost over time',
    'Abonnement mensuel, extensions payantes': 'Monthly subscription, paid add-ons',
    '<b>Sans frais récurrents</b>': '<b>No recurring fees</b>',
    'Vitesse': 'Speed',
    'Scripts lourds, pages lentes sur mobile': 'Heavy scripts, slow pages on mobile',
    '<b>Code léger, chargement rapide</b>': '<b>Light code, fast loading</b>',
    'Avant de payer': 'Before paying',
    'Vous achetez sans voir': 'You buy without seeing',
    '<b>Un aperçu gratuit, d’abord</b>': '<b>A free preview, first</b>',
    'Après la mise en ligne': 'After launch',
    'Support par tickets, quand il existe': 'Ticket support, when it exists',
    '<b>12 mois de suivi, un interlocuteur</b>': '<b>12 months of support, one contact</b>',
    'Propriété': 'Ownership',
    'Votre site dépend d’une plateforme': 'Your site depends on a platform',
    '<b>Votre site vous appartient</b>': '<b>Your site belongs to you</b>',

    /* work */
    '/ Réalisations': '/ Our work',
    'De l’expérience en Australie.<br>La même attention pour votre PME.': 'Experience in Australia.<br>The same care for your business.',
    'Nous avons accompagné des petites entreprises australiennes : beauté, services, artisanat et commerce. Découvrez les sites existants et la diversité des activités.': 'We have worked with small Australian businesses: beauty, services, trades and retail. Browse the live sites and the variety of activities.',
    'Faites défiler les projets': 'Scroll through the projects',

    /* method */
    '/ La méthode': '/ The method',
    'Vous dirigez votre entreprise.<br>Nous nous occupons du site.': 'You run your business.<br>We take care of the website.',
    'Quatre étapes. Un seul interlocuteur du premier appel au suivi.': 'Four steps. One contact from the first call to the follow-up.',
    'Bonjour, je suis coiffeuse à Nyon…': 'Hello, I’m a hairdresser in Nyon…',
    'Racontez-nous. Qui sont vos clientes ?': 'Tell us more. Who are your clients?',
    'Surtout des habituées, mais j’aimerais en accueillir de nouvelles.': 'Mostly regulars, but I’d like to welcome new ones.',
    'votre-salon.ch · aperçu': 'your-salon.ch · preview',
    'Aperçu gratuit · sans engagement': 'Free preview · no commitment',
    '{ico}Site en ligne': '{ico}Site live',
    'Pouvez-vous changer la photo d’accueil ?': 'Could you change the homepage photo?',
    'Bien sûr. C’est en ligne.': 'Of course. It’s live.',
    '<b>7j/7</b><small>un interlocuteur</small>': '<b>7/7</b><small>one contact</small>',
    '01 · Échange': '01 · Conversation',
    'On en parle': 'We talk',
    'Votre activité, vos clients et ce que votre site doit leur permettre de faire. Un échange simple, par téléphone ou WhatsApp, sans jargon.': 'Your business, your customers and what your website must let them do. A simple conversation, by phone or WhatsApp, no jargon.',
    '30 minutes · téléphone ou WhatsApp': '30 minutes · phone or WhatsApp',
    '02 · Aperçu': '02 · Preview',
    'Vous voyez l’aperçu': 'You see the preview',
    'Nous créons un aperçu gratuit de votre site. Vous découvrez la direction proposée, la structure et le ton avant de vous engager.': 'We create a free preview of your site. You see the proposed direction, structure and tone before committing.',
    'Gratuit · sans obligation': 'Free · no obligation',
    '03 · Réalisation': '03 · Build',
    'On affine, on publie': 'We refine, we publish',
    'Après votre accord et la réception des éléments nécessaires, votre site est prêt sous 7 jours. Nous gérons le nom de domaine, la mise en ligne et les réglages techniques.': 'After your approval and the material we need, your site is ready within 7 days. We handle the domain name, publishing and technical settings.',
    '7 jours · mise en ligne comprise': '7 days · publishing included',
    '04 · Suivi': '04 · Support',
    'On reste disponibles': 'We stay available',
    '12 mois de suivi inclus pour vos questions et l’accompagnement après lancement. Vous gardez un interlocuteur, 7 jours sur 7.': '12 months of support included for your questions and guidance after launch. You keep one contact, 7 days a week.',
    '12 mois · un interlocuteur': '12 months · one contact',

    /* included */
    '/ Compris dans chaque site': '/ Included in every site',
    'Tout ce qu’il faut.<br><em>Rien à rajouter.</em>': 'Everything you need.<br><em>Nothing to add.</em>',
    'Ce que nous considérons comme la base d’un site professionnel en 2026. Inclus d’office, quel que soit votre projet.': 'What we consider the baseline of a professional website in 2026. Included by default, whatever your project.',
    'Voir l’offre en détail{ico}': 'See the offer in detail{ico}',
    '<i></i><b>Design responsive</b><span>Impeccable sur téléphone, tablette et ordinateur</span>': '<i></i><b>Responsive design</b><span>Flawless on phone, tablet and desktop</span>',
    '<i></i><b>Pages rapides</b><span>Code léger, images optimisées, aucun script superflu</span>': '<i></i><b>Fast pages</b><span>Light code, optimised images, no unnecessary scripts</span>',
    '<i></i><b>Contact en un geste</b><span>Appel, WhatsApp, e-mail et itinéraire depuis chaque page</span>': '<i></i><b>Contact in one tap</b><span>Call, WhatsApp, email and directions from every page</span>',
    '<i></i><b>SEO local</b><span>Titres, descriptions, données structurées et contenu régional</span>': '<i></i><b>Local SEO</b><span>Titles, descriptions, structured data and regional content</span>',
    '<i></i><b>Sécurité HTTPS</b><span>Certificat, redirections et bonnes pratiques configurés</span>': '<i></i><b>HTTPS security</b><span>Certificate, redirects and best practices configured</span>',
    '<i></i><b>Accessibilité</b><span>Contrastes, navigation clavier et textes alternatifs</span>': '<i></i><b>Accessibility</b><span>Contrast, keyboard navigation and alt text</span>',
    '<i></i><b>Domaine &amp; mise en ligne</b><span>Nous nous occupons de la partie technique pour vous</span>': '<i></i><b>Domain &amp; publishing</b><span>We handle the technical side for you</span>',
    '<i></i><b>Suivi 12 mois</b><span>Un interlocuteur pour vos questions, 7 jours sur 7</span>': '<i></i><b>12 months of support</b><span>One contact for your questions, 7 days a week</span>',

    /* commitments */
    '/ Nos engagements': '/ Our commitments',
    'Un projet clair, du premier échange au suivi.': 'A clear project, from the first conversation to the follow-up.',
    'Avant votre accord': 'Before you commit',
    'Un aperçu gratuit.<br>Aucune obligation.': 'A free preview.<br>No obligation.',
    'Vous jugez le travail sur pièce. Nous définissons ensuite ensemble le contenu et le périmètre de votre site.': 'You judge the real work. Then we define the content and scope of your site together.',
    '<b>7 jours</b><span>pour un site prêt après validation et réception des contenus</span>': '<b>7 days</b><span>to a finished site after approval and receipt of content</span>',
    '<b>12 mois</b><span>de suivi inclus après le lancement</span>': '<b>12 months</b><span>of support included after launch</span>',
    '<b>Sans frais récurrents</b><span>pour notre création de site, sans abonnement imposé</span>': '<b>No recurring fees</b><span>for our website creation, no imposed subscription</span>',

    /* studio */
    '/ Le studio': '/ The studio',
    'Un studio suisse,<br>une expérience internationale.': 'A Swiss studio,<br>international experience.',
    'Next Digital Level est une entreprise suisse. Nous avons construit des sites pour des petites entreprises en Australie avant de nous consacrer aux PME de Suisse romande : instituts, artisans, services à la personne, commerces.': 'Next Digital Level is a Swiss company. We built websites for small businesses in Australia before focusing on SMEs in French-speaking Switzerland: salons, tradespeople, care services, shops.',
    'Nous travaillons en français et en anglais, sans intermédiaire : la personne qui vous répond est celle qui conçoit et code votre site.': 'We work in French and English, with no middleman: the person who answers you is the one who designs and codes your site.',
    'Voir avant de décider': 'See before deciding',
    'L’aperçu gratuit n’est pas un argument commercial. C’est notre façon de commencer chaque projet.': 'The free preview is not a sales pitch. It is how we start every project.',
    'Le détail compte': 'Details matter',
    'Un espacement juste, une phrase claire, un bouton au bon endroit. C’est ce qui inspire confiance sans que l’on sache pourquoi.': 'The right spacing, a clear sentence, a button in the right place. That is what inspires trust without anyone knowing why.',
    'Aucune dépendance': 'No lock-in',
    'Pas d’abonnement, pas de plateforme propriétaire. Votre site vous appartient, code compris.': 'No subscription, no proprietary platform. Your site belongs to you, code included.',
    'Disponibles, vraiment': 'Genuinely available',
    'Téléphone, WhatsApp, e-mail. Sept jours sur sept, en français ou en anglais.': 'Phone, WhatsApp, email. Seven days a week, in French or English.',

    /* sectors */
    '/ Pour votre activité': '/ For your business',
    'Un site utile à vos clients.': 'A website that is useful to your customers.',
    '<span><small>01</small>Artisans &amp; entreprises de services</span>{ico}': '<span><small>01</small>Trades &amp; service businesses</span>{ico}',
    '<span><small>02</small>Salons de beauté &amp; instituts</span>{ico}': '<span><small>02</small>Beauty salons &amp; clinics</span>{ico}',
    '<span><small>03</small>Commerces &amp; indépendants</span>{ico}': '<span><small>03</small>Shops &amp; independents</span>{ico}',
    '<span><small>04</small>Services à la personne &amp; santé</span>{ico}': '<span><small>04</small>Care &amp; health services</span>{ico}',

    /* faq */
    '/ Vos questions': '/ Your questions',
    'Les réponses, simplement.': 'The answers, simply.',
    'Une question qui n’est pas ici ? L’assistant en bas de page répond immédiatement, ou écrivez-nous sur WhatsApp.': 'A question that isn’t here? The assistant at the bottom of the page answers immediately, or message us on WhatsApp.',
    'L’aperçu est-il vraiment gratuit ?<span aria-hidden="true">+</span>': 'Is the preview really free?<span aria-hidden="true">+</span>',
    'Oui. Vous pouvez voir la direction proposée pour votre site avant de vous engager. La demande d’aperçu ne vous oblige pas à poursuivre.': 'Yes. You see the proposed direction for your site before committing. Requesting a preview does not oblige you to continue.',
    'Que signifie « prêt sous 7 jours » ?<span aria-hidden="true">+</span>': 'What does “ready within 7 days” mean?<span aria-hidden="true">+</span>',
    'Le délai démarre après validation du projet et réception des éléments nécessaires. Nous précisons ensemble les pages, les fonctionnalités et le calendrier avant de commencer.': 'The clock starts after project approval and receipt of the material we need. We agree on the pages, features and timeline together before starting.',
    'Y a-t-il un abonnement ?<span aria-hidden="true">+</span>': 'Is there a subscription?<span aria-hidden="true">+</span>',
    'Notre création de site est sans frais récurrents. Les éventuels services tiers que vous choisissez, comme un nom de domaine ou un outil de réservation, sont précisés avant votre accord.': 'Our website creation has no recurring fees. Any third-party services you choose, such as a domain name or a booking tool, are spelled out before you commit.',
    'Que comprend le suivi de 12 mois ?<span aria-hidden="true">+</span>': 'What does the 12-month support include?<span aria-hidden="true">+</span>',
    'Vous disposez d’un interlocuteur pour vos questions, l’aide à la prise en main et le suivi après la mise en ligne. Le périmètre des interventions est défini ensemble avant le lancement.': 'You have one contact for your questions, help getting started and follow-up after launch. The scope of the work is defined together before launch.',
    'Mon site sera-t-il visible sur Google ?<span aria-hidden="true">+</span>': 'Will my site show up on Google?<span aria-hidden="true">+</span>',
    'Nous travaillons les bases techniques et les contenus pour aider Google à comprendre votre activité. Nous pouvons vous accompagner sur votre fiche Google Business Profile. Aucun classement précis n’est garanti.': 'We build the technical foundations and content that help Google understand your business, and we can help with your Google Business Profile. No specific ranking is guaranteed.',
    'Puis-je modifier mon site moi-même ensuite ?<span aria-hidden="true">+</span>': 'Can I edit my site myself afterwards?<span aria-hidden="true">+</span>',
    'Pendant les 12 mois de suivi, vous nous envoyez simplement vos modifications. Si vous souhaitez gérer certains contenus vous-même, nous en discutons dès le départ pour prévoir la solution adaptée.': 'During the 12 months of support, you simply send us your changes. If you want to manage some content yourself, we discuss it from the start and plan the right solution.',
    'J’ai déjà un site. Pouvez-vous le refaire ?<span aria-hidden="true">+</span>': 'I already have a site. Can you rebuild it?<span aria-hidden="true">+</span>',
    'Oui. Nous partons de ce qui fonctionne, conservons votre nom de domaine et votre référencement existant, puis reconstruisons le site sur mesure. L’aperçu gratuit vous montre la différence avant toute décision.': 'Yes. We start from what works, keep your domain name and existing search presence, then rebuild the site from scratch. The free preview shows you the difference before any decision.',
    'Travaillez-vous partout en Suisse romande ?<span aria-hidden="true">+</span>': 'Do you work across French-speaking Switzerland?<span aria-hidden="true">+</span>',
    'Oui. Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura : les échanges se font par téléphone, WhatsApp ou visio, ce qui nous permet d’accompagner toute la Suisse romande, et au-delà en anglais.': 'Yes. Geneva, Vaud, Fribourg, Neuchâtel, Valais, Jura: we work by phone, WhatsApp or video call, which lets us support all of French-speaking Switzerland, and beyond in English.',

    /* cta */
    '/ On commence ?': '/ Shall we start?',
    'Votre prochain site.<br><em>Voyez-le avant de décider.</em>': 'Your next website.<br><em>See it before you decide.</em>',
    'Parlez-nous de votre activité. Nous vous préparons un aperçu gratuit, sans engagement.': 'Tell us about your business. We will prepare a free preview, with no commitment.',
    'Parlons-en sur WhatsApp{ico}': 'Chat on WhatsApp{ico}',
    'Toutes les réalisations{ico}': 'All our work{ico}',

    /* inner pages: shared bits */
    'Voir l’offre complète{ico}': 'See the full offer{ico}',
    '/ Aller plus loin': '/ Go further',
    'Les autres services.': 'The other services.',
    '<span><small>Tout</small>L’offre complète</span>{ico}': '<span><small>All</small>The full offer</span>{ico}',
    '/ Compris': '/ Included',
    'Inclus d’office.<br><em>Rien à rajouter.</em>': 'Included by default.<br><em>Nothing to add.</em>',
    'Ce service fait partie de chaque site que nous livrons. Il n’est ni optionnel, ni facturé en plus.': 'This service is part of every site we deliver. It is neither optional nor charged extra.',
    '/ Ce que cela change pour vous': '/ What it changes for you',
    'Concrètement.': 'In practice.',
    '/ Comment nous procédons': '/ How we work',
    'Quatre temps,<br>toujours avec vous.': 'Four stages,<br>always with you.',
    'Une autre question ? L’assistant en bas de page répond immédiatement, ou écrivez-nous sur WhatsApp.': 'Another question? The assistant at the bottom of the page answers immediately, or message us on WhatsApp.'
  };
  const ATTR = {
    'Ouvrir le menu': 'Open menu',
    'Réalisations précédentes': 'Previous projects',
    'Réalisations suivantes': 'Next projects',
    'Navigation principale': 'Main navigation',
    'Contact rapide': 'Quick contact',
    'Nos réalisations': 'Our work',
    'Sites présentés': 'Featured sites',
    'Étapes de la méthode': 'Steps of the method',
    'Next Digital Level — accueil': 'Next Digital Level — home'
  };
  const TITLES = {
    'index.html': 'Custom-coded websites in French-speaking Switzerland | Next Digital Level',
    '': 'Custom-coded websites in French-speaking Switzerland | Next Digital Level'
  };

  function norm(h) { return h.replace(/<svg[\s\S]*?<\/svg>/g, '{ico}').replace(/\s+/g, ' ').trim(); }
  function restore(value, source) {
    const icons = source.match(/<svg[\s\S]*?<\/svg>/g) || [];
    let k = 0; return value.replace(/\{ico\}/g, () => icons[k++] || '');
  }
  function walk(el) {
    if (!el.children) return;
    for (const child of Array.from(el.children)) {
      const tag = child.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'SVG' || tag === 'CANVAS' || tag === 'IFRAME' || tag === 'IMG') continue;
      const key = norm(child.innerHTML);
      if (key && EN[key] !== undefined) { child.innerHTML = restore(EN[key], child.innerHTML); continue; }
      walk(child);
    }
  }
  function applyEnglish() {
    doc.lang = 'en';
    walk(document.body);
    $$('[aria-label], [placeholder], [title]').forEach(el => {
      ['aria-label', 'placeholder', 'title'].forEach(a => { const v = el.getAttribute(a); if (v && ATTR[v]) el.setAttribute(a, ATTR[v]); });
    });
    const page = location.pathname.replace(/^\//, '');
    if (TITLES[page]) document.title = TITLES[page];
    window.NDL_LANG = 'en';
  }
  if (lang === 'en') applyEnglish();
  window.NDL_LANG = lang;
})();
