"""Generate the local landing pages (one per canton / main city) plus the
Suisse romande hub, from the shared chrome of websites.html.

Run `python3 scripts/build-cities.py` after editing CITIES.
"""
from pathlib import Path
import html, json, re

ROOT = Path(__file__).resolve().parent.parent
BASE = (ROOT / 'websites.html').read_text()
HEAD = BASE[:BASE.index('<main id="main">') + len('<main id="main">')]
FOOT = BASE[BASE.index('</main>'):]
NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

CITIES = [
    dict(slug='creation-site-internet-geneve', city='Genève', canton='Genève', code='GE', region='Genève et ses communes',
         title='Création de site internet à Genève | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME et indépendants de Genève : aperçu gratuit avant engagement, site prêt sous 7 jours, sans frais récurrents.',
         h1='Création de site internet<br><em>à Genève.</em>',
         lead='Genève concentre une clientèle exigeante et internationale. Un site clair, rapide et bilingue si nécessaire fait la différence entre un appel et un visiteur qui repart. Nous concevons des sites sur mesure pour les PME genevoises, avec un aperçu gratuit avant tout engagement.',
         towns='Carouge, Lancy, Vernier, Meyrin, Onex, Thônex, Chêne-Bougeries, Versoix, Plan-les-Ouates et toute la rive gauche comme la rive droite.',
         sectors=[('Artisans et entreprises de services', 'Plombiers, électriciens, peintres, déménageurs, entreprises de nettoyage : vos clients cherchent « près de chez moi » et appellent le premier site qui inspire confiance.'),
                  ('Instituts, salons et bien-être', 'Instituts de beauté, coiffeurs, ostéopathes, thérapeutes : un site qui montre le lieu, l’équipe et les prestations, avec la prise de rendez-vous à portée de pouce.'),
                  ('Indépendants et professions libérales', 'Fiduciaires, conseillers, architectes, photographes : une présentation sobre et crédible, en français et en anglais pour la clientèle internationale.')],
         local='À Genève, une part importante des recherches se fait en anglais et depuis un téléphone. Nous construisons des pages qui répondent aux deux : contenus en français avec, si votre clientèle le demande, une version anglaise, et une structure pensée d’abord pour le mobile. Les mentions locales (quartiers, communes desservies, parkings, transports) aident Google à vous présenter aux bonnes personnes.',
         faq=[('Faut-il un site en anglais à Genève ?', 'Pas toujours, mais souvent utile. Nous le décidons ensemble selon votre clientèle. Le site peut être livré en français avec une version anglaise, sans doubler les frais de structure.'),
              ('Devez-vous venir sur place ?', 'Non. Les échanges se font par téléphone, WhatsApp ou visio. Si vous préférez un rendez-vous à Genève, nous nous organisons.'),
              ('Pouvez-vous m’aider avec ma fiche Google à Genève ?', 'Oui. Nous vous accompagnons pour compléter et relier votre fiche Google Business Profile, un levier majeur pour les recherches locales genevoises.')],
         geo=(46.2044, 6.1432)),
    dict(slug='creation-site-internet-lausanne', city='Lausanne', canton='Vaud', code='VD', region='Lausanne, la Riviera et le canton de Vaud',
         title='Création de site internet à Lausanne et dans le canton de Vaud | Next Digital Level',
         desc='Sites web codés sur mesure pour les PME de Lausanne, Vevey, Montreux, Nyon, Morges et Yverdon. Aperçu gratuit, prêt sous 7 jours, sans abonnement.',
         h1='Création de site internet<br><em>à Lausanne et dans le canton de Vaud.</em>',
         lead='De Nyon à Montreux, de Morges à Yverdon, les PME vaudoises ont un point commun : leurs clients les cherchent sur Google avant d’appeler. Nous créons des sites sur mesure qui se chargent vite, expliquent clairement votre offre et donnent envie de vous contacter.',
         towns='Lausanne, Pully, Renens, Morges, Nyon, Vevey, Montreux, Yverdon-les-Bains, Aigle et l’ensemble du canton de Vaud.',
         sectors=[('Artisans du bâtiment et services', 'Rénovation, chauffage, jardinage, nettoyage : un site qui montre vos réalisations et affiche votre zone d’intervention, commune par commune.'),
                  ('Restauration, commerces et loisirs', 'Cafés, boutiques, ateliers, clubs sportifs : horaires, menus, réservations et itinéraire, accessibles en un geste depuis un téléphone.'),
                  ('Santé, bien-être et services à la personne', 'Cabinets, thérapeutes, aide à domicile : une présentation rassurante, des informations pratiques et une prise de contact simple.')],
         local='Le canton de Vaud est vaste et les recherches sont très locales : « électricien Morges », « coiffeur Vevey », « fiduciaire Nyon ». Un site sur mesure permet de créer, sans lourdeur, des pages ou des sections dédiées aux villes que vous servez réellement, avec des textes utiles plutôt qu’une liste de mots-clés. Nous posons cette structure dès le départ.',
         faq=[('Je suis à Vevey ou à Nyon, est-ce le même service ?', 'Oui. Nous accompagnons tout le canton de Vaud avec le même processus : aperçu gratuit, site prêt sous 7 jours après validation, 12 mois de suivi.'),
              ('Pouvez-vous reprendre mon site actuel ?', 'Oui. Nous conservons votre nom de domaine et votre référencement existant, puis reconstruisons le site proprement. L’aperçu gratuit vous montre la différence.'),
              ('Comment se passe le premier contact ?', 'Un appel ou un message WhatsApp de trente minutes suffit pour comprendre votre activité et préparer l’aperçu.')],
         geo=(46.5197, 6.6323)),
    dict(slug='creation-site-internet-fribourg', city='Fribourg', canton='Fribourg', code='FR', region='Fribourg, Bulle et le canton',
         title='Création de site internet à Fribourg et Bulle | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME fribourgeoises : Fribourg, Bulle, Villars-sur-Glâne, Marly. Aperçu gratuit, sans frais récurrents.',
         h1='Création de site internet<br><em>à Fribourg et dans la Gruyère.</em>',
         lead='Entre tradition artisanale et entreprises en pleine croissance, le canton de Fribourg a besoin de sites qui parlent vrai. Nous concevons des sites sur mesure, en français et en allemand si votre clientèle l’exige, pour les PME de Fribourg, Bulle et des environs.',
         towns='Fribourg, Villars-sur-Glâne, Marly, Bulle, Romont, Estavayer, Châtel-Saint-Denis, Morat et l’ensemble du canton.',
         sectors=[('Artisans et métiers du bâtiment', 'Menuisiers, charpentiers, chauffagistes, paysagistes : vos réalisations en photos, vos communes desservies et un bouton d’appel toujours visible.'),
                  ('Agriculture, terroir et commerces', 'Fromageries, boucheries, magasins à la ferme, boutiques : horaires, produits et itinéraire, présentés avec soin.'),
                  ('Services et indépendants', 'Fiduciaires, coachs, thérapeutes, garages : une présence crédible qui rassure avant le premier appel.')],
         local='Fribourg est un canton bilingue. Selon votre zone, une version allemande de vos pages principales peut doubler votre visibilité, sans complexité supplémentaire dans un site codé sur mesure. Nous travaillons aussi la présence sur Google Business Profile, décisive pour les recherches « près de moi » dans les districts.',
         faq=[('Pouvez-vous livrer le site en français et en allemand ?', 'Oui. Nous rédigeons en français et travaillons avec des relecteurs natifs pour l’allemand. Nous définissons ensemble les pages à traduire.'),
              ('Je suis à Bulle, dans la Gruyère. Est-ce que vous couvrez cette zone ?', 'Oui, tout le canton de Fribourg. Les échanges se font à distance ou sur rendez-vous si vous préférez.'),
              ('Combien de temps pour mettre le site en ligne ?', 'Sept jours après validation du projet et réception de vos contenus. L’aperçu gratuit vient avant, sans engagement.')],
         geo=(46.8065, 7.1620)),
    dict(slug='creation-site-internet-neuchatel', city='Neuchâtel', canton='Neuchâtel', code='NE', region='Neuchâtel, La Chaux-de-Fonds et le Littoral',
         title='Création de site internet à Neuchâtel et La Chaux-de-Fonds | Next Digital Level',
         desc='Sites web sur mesure pour les PME neuchâteloises : Neuchâtel, La Chaux-de-Fonds, Le Locle, Val-de-Ruz. Aperçu gratuit avant engagement.',
         h1='Création de site internet<br><em>à Neuchâtel et dans les Montagnes.</em>',
         lead='Du Littoral aux Montagnes neuchâteloises, les PME ont une culture de la précision. Votre site doit en être le reflet : net, rapide, sans superflu. Nous le concevons sur mesure, avec un aperçu gratuit avant de vous engager.',
         towns='Neuchâtel, La Chaux-de-Fonds, Le Locle, Boudry, Val-de-Ruz, Val-de-Travers, Cornaux, Saint-Blaise et tout le canton.',
         sectors=[('Artisans, ateliers et sous-traitants', 'Micro-mécanique, ébénisterie, ateliers spécialisés : un site qui présente votre savoir-faire avec des photos et des mots précis.'),
                  ('Commerces, restaurants et services', 'Boutiques, cafés, salons, garages : les informations pratiques en premier, la prise de contact en un geste.'),
                  ('Santé, bien-être et indépendants', 'Cabinets, thérapeutes, conseillers : une présentation sobre qui inspire confiance dès le premier écran.')],
         local='Dans le canton de Neuchâtel, les recherches locales se concentrent sur quelques pôles : Neuchâtel, La Chaux-de-Fonds, Le Locle. Nous structurons vos pages pour couvrir vos zones réelles d’intervention et nous mettons en place les bases techniques que Google attend : données structurées, vitesse, contenus locaux, fiche Google Business Profile.',
         faq=[('Vous déplacez-vous à La Chaux-de-Fonds ?', 'Les échanges se font par téléphone, WhatsApp ou visio, ce qui convient à la plupart de nos clients. Un rendez-vous sur place reste possible.'),
              ('Que faut-il me fournir pour démarrer ?', 'Vos coordonnées, la liste de vos prestations et quelques photos. Nous rédigeons les textes avec vous.'),
              ('Y a-t-il des frais mensuels ?', 'Non. Notre création de site est sans frais récurrents. Seuls le nom de domaine et d’éventuels outils tiers, précisés à l’avance, peuvent avoir un coût.')],
         geo=(46.9900, 6.9293)),
    dict(slug='creation-site-internet-valais', city='Sion', canton='Valais', code='VS', region='Sion, Martigny, Sierre, Monthey et les stations',
         title='Création de site internet en Valais : Sion, Martigny, Sierre | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME valaisannes : Sion, Martigny, Sierre, Monthey et les stations. Aperçu gratuit, prêt sous 7 jours.',
         h1='Création de site internet<br><em>en Valais.</em>',
         lead='Le Valais vit au rythme des saisons et du tourisme : hébergements, activités, artisans, commerces. Un site sur mesure, rapide sur mobile et clair sur les horaires et les tarifs, transforme une recherche en réservation ou en appel. Aperçu gratuit avant tout engagement.',
         towns='Sion, Martigny, Sierre, Monthey, Conthey, Fully, Saxon, Verbier, Crans-Montana, Nendaz, Anzère et l’ensemble du Valais romand.',
         sectors=[('Hébergement, tourisme et activités', 'Chalets, chambres d’hôtes, guides, écoles de ski, locations : disponibilités, photos et réservation en un geste, en français et en anglais.'),
                  ('Vignerons, terroir et commerces', 'Caves, encavages, épiceries fines, marchés : présenter vos produits, vos horaires de dégustation et votre histoire.'),
                  ('Artisans et entreprises de services', 'Chauffage, sanitaire, couverture, paysagisme : vos réalisations et vos communes desservies, du Chablais au Haut-Valais romand.')],
         local='En Valais, la saisonnalité et la clientèle touristique changent la donne : les recherches viennent souvent de l’extérieur du canton, parfois en anglais ou en allemand, et presque toujours depuis un téléphone. Nous construisons des sites légers qui se chargent vite même en montagne, avec des pages par activité et par lieu, et nous relions le tout à votre fiche Google Business Profile.',
         faq=[('Je suis dans une station, mes clients sont surtout des touristes. Est-ce adapté ?', 'Oui. Nous concevons des pages claires sur les périodes, les tarifs et la réservation, avec une version anglaise si nécessaire.'),
              ('Pouvez-vous intégrer un système de réservation ?', 'Oui. Nous intégrons un outil de réservation fiable lorsque c’est utile, et nous en précisons les éventuels coûts avant votre accord.'),
              ('Couvrez-vous tout le Valais romand ?', 'Oui, de Monthey à Sierre, plaine et stations. Les échanges se font à distance ou sur rendez-vous.')],
         geo=(46.2331, 7.3606)),
    dict(slug='creation-site-internet-jura', city='Delémont', canton='Jura', code='JU', region='Delémont, Porrentruy et le Jura bernois',
         title='Création de site internet dans le Jura : Delémont, Porrentruy | Next Digital Level',
         desc='Sites web sur mesure pour les PME du Jura et du Jura bernois : Delémont, Porrentruy, Moutier, Saignelégier. Aperçu gratuit, sans abonnement.',
         h1='Création de site internet<br><em>dans le Jura.</em>',
         lead='Ateliers de précision, artisans, commerces de proximité : le Jura travaille bien et le montre peu. Un site sur mesure, sobre et rapide, donne à votre entreprise la visibilité qu’elle mérite, à Delémont, Porrentruy, Moutier et alentour.',
         towns='Delémont, Porrentruy, Moutier, Saignelégier, Bassecourt, Courrendlin, Tavannes, Saint-Imier et l’ensemble du Jura et du Jura bernois.',
         sectors=[('Ateliers, sous-traitance et industrie', 'Décolletage, mécanique, horlogerie, sous-traitance : une présentation précise de vos capacités, en français et en anglais si vous exportez.'),
                  ('Artisans et bâtiment', 'Charpente, couverture, chauffage, électricité : vos chantiers en photos, vos communes desservies, un appel en un geste.'),
                  ('Commerces, restauration et services', 'Boulangeries, restaurants, salons, garages : horaires, prestations et itinéraire, lisibles depuis un téléphone.')],
         local='Le tissu économique jurassien est dense en petites entreprises spécialisées. Beaucoup n’ont pas de site, ou un site ancien. Une présence propre, avec des pages claires par prestation et une fiche Google Business Profile complète, suffit souvent à sortir du lot sur les recherches locales. Nous posons ces bases dès la création.',
         faq=[('Je n’ai jamais eu de site. Par où commencer ?', 'Par un appel de trente minutes. Nous préparons ensuite un aperçu gratuit de votre site, que vous jugez sur pièce avant de décider.'),
              ('Couvrez-vous le Jura bernois ?', 'Oui : Moutier, Tavannes, Saint-Imier, Tramelan et les environs, avec le même processus.'),
              ('Que se passe-t-il après la mise en ligne ?', 'Douze mois de suivi sont inclus : modifications courantes, questions et conseils, 7 jours sur 7.')],
         geo=(47.3650, 7.3447)),
]
HUB = dict(slug='creation-site-internet-suisse-romande', title='Création de site internet en Suisse romande | Next Digital Level',
           desc='Agence suisse de création de sites web sur mesure pour les PME de Suisse romande : Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura. Aperçu gratuit avant engagement.',
           h1='Création de site internet<br><em>en Suisse romande.</em>',
           lead='Next Digital Level est un studio suisse. Nous concevons et codons des sites sur mesure pour les PME et indépendants de toute la Suisse romande, avec un aperçu gratuit avant tout engagement, un site prêt sous 7 jours et 12 mois de suivi inclus. Choisissez votre région.')


def chrome(s, slug):
    head = HEAD
    head = re.sub(r'<title>.*?</title>', '<title>' + html.escape(s['title']) + '</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://nextdigitalevel.com/%s.html">' % slug, head)
    short = html.escape(s['title'].split(' | ')[0], quote=True)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + short + '">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://nextdigitalevel.com/%s.html">' % slug, head)
    head = re.sub(r'<meta name="twitter:title" content="[^"]*">', '<meta name="twitter:title" content="' + short + '">', head)
    head = re.sub(r'<meta name="twitter:description" content="[^"]*">', '<meta name="twitter:description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    return head


def jsonld(*objs):
    return ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(o, ensure_ascii=False, indent=1) for o in objs)


def city_page(c):
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in c['faq']]}
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Suisse romande", "item": "https://nextdigitalevel.com/creation-site-internet-suisse-romande.html"},
        {"@type": "ListItem", "position": 3, "name": c['city'], "item": "https://nextdigitalevel.com/%s.html" % c['slug']}]}
    service_ld = {"@context": "https://schema.org", "@type": "Service", "serviceType": "Création de site internet", "name": "Création de site internet à " + c['city'],
                  "provider": {"@type": "ProfessionalService", "name": "Next Digital Level", "url": "https://nextdigitalevel.com/", "telephone": "+41762632817"},
                  "areaServed": {"@type": "AdministrativeArea", "name": "Canton de " + c['canton'], "containedInPlace": {"@type": "Country", "name": "Switzerland"}},
                  "url": "https://nextdigitalevel.com/%s.html" % c['slug']}
    cards = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span><h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b) for i, (t, b) in enumerate(c['sectors']))
    faq = ''.join('<details class="faq-detail"><summary>%s<span aria-hidden="true">+</span></summary><p class="t-body">%s</p></details>' % (q, a) for q, a in c['faq'])
    others = ''.join('<a href="/%s.html" data-cursor="view"><span><small>%s</small>%s</span><span aria-hidden="true">%s</span></a>' % (o['slug'], o['code'], o['canton'], NE) for o in CITIES if o['slug'] != c['slug'])
    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ Suisse romande · {c['canton']}</span><h1 class="t-display-xl hero__title">{c['h1']}</h1><p class="t-body-lg hero__lead">{c['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book.html">Demander mon aperçu gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
</div>
<p class="hero__note">Entreprise suisse · aperçu gratuit · prêt sous 7 jours · sans frais récurrents · 12 mois de suivi</p>
</div>
</section>
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Pour qui</span><h2 class="t-display-lg" data-split="words">Les PME de {c['region']}.</h2>
<p class="t-body">Nous accompagnons les entreprises de {c['towns']}</p>
</div>
<div class="grid grid--3 stagger">{cards}</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="included">
<div class="included__copy reveal">
<span class="eyebrow">/ Être trouvé à {c['city']}</span>
<h2 class="t-display-lg" data-split="words">Un site que Google<br><em>montre aux bonnes personnes.</em></h2>
<p class="t-body-lg">{c['local']}</p>
<a class="btn btn--ghost btn--lg" href="/seo-local.html">Notre approche du SEO local{NE}</a>
</div>
<ul class="included__list included__list--simple stagger">
<li><i></i><b>Aperçu gratuit</b><span>Vous voyez votre site avant de vous engager</span></li>
<li><i></i><b>Prêt sous 7 jours</b><span>Après validation et réception de vos contenus</span></li>
<li><i></i><b>Sans frais récurrents</b><span>Pas d’abonnement, le site vous appartient</span></li>
<li><i></i><b>SEO local inclus</b><span>Titres, données structurées, contenu régional</span></li>
<li><i></i><b>Google Business Profile</b><span>Fiche complétée et reliée à votre site</span></li>
<li><i></i><b>12 mois de suivi</b><span>Un interlocuteur, 7 jours sur 7</span></li>
</ul>
</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="faq-layout">
<div class="sec-head reveal">
<span class="eyebrow">/ Vos questions</span><h2 class="t-display-lg" data-split="words">Questions fréquentes<br>à {c['city']}.</h2>
<p class="t-body faq-aside">Une autre question ? L’assistant en bas de page répond immédiatement, ou écrivez-nous sur WhatsApp.</p>
</div>
<div class="faq reveal">{faq}</div>
</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Ailleurs en Suisse romande</span><h2 class="t-display-lg" data-split="words">Les autres cantons.</h2>
</div>
<div class="sector-links reveal">{others}<a href="/creation-site-internet-suisse-romande.html" data-cursor="view"><span><small>CH</small>Toute la Suisse romande</span><span aria-hidden="true">{NE}</span></a></div>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Votre site à {c['city']}.<br><em>Voyez-le avant de décider.</em></h2><p class="t-body-lg">Parlez-nous de votre activité. Nous vous préparons un aperçu gratuit, sans engagement.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book.html">Demander mon aperçu gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    head = chrome(c, c['slug']).replace('</head>', jsonld(faq_ld, crumbs, service_ld) + '</head>')
    return head + main + FOOT


def hub_page():
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Suisse romande", "item": "https://nextdigitalevel.com/creation-site-internet-suisse-romande.html"}]}
    cards = ''.join(f'<a class="card card--spot region-card" data-spot href="/{c["slug"]}.html"><span class="card__num">{c["code"]}</span><h3 class="t-display-sm">{c["canton"]}</h3><p class="t-body">{c["region"]}</p><span class="card__more">Voir la page {c["city"]}{NE}</span></a>' for c in CITIES)
    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ Suisse romande</span><h1 class="t-display-xl hero__title">{HUB['h1']}</h1><p class="t-body-lg hero__lead">{HUB['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book.html">Demander mon aperçu gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Votre région</span><h2 class="t-display-lg" data-split="words">Six cantons,<br>la même exigence.</h2>
</div>
<div class="grid grid--3 stagger">{cards}</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Pourquoi un studio suisse</span><h2 class="t-display-lg" data-split="words">Proche de vous,<br>disponible 7 jours sur 7.</h2>
</div>
<div class="grid grid--3 stagger">
<article class="card card--spot" data-spot><span class="card__num">01</span><h3 class="t-display-sm">Un interlocuteur, en français</h3><p class="t-body">La personne qui vous répond conçoit et code votre site. Pas de plateforme, pas de ticket, pas de décalage horaire.</p></article>
<article class="card card--spot" data-spot><span class="card__num">02</span><h3 class="t-display-sm">Une connaissance du terrain</h3><p class="t-body">Communes, districts, bilinguisme, saisonnalité : nous adaptons la structure et les textes à la réalité de votre canton.</p></article>
<article class="card card--spot" data-spot><span class="card__num">03</span><h3 class="t-display-sm">Un cadre clair</h3><p class="t-body">Aperçu gratuit avant engagement, site prêt sous 7 jours après validation, sans frais récurrents, 12 mois de suivi inclus.</p></article>
</div>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Votre prochain site.<br><em>Voyez-le avant de décider.</em></h2><p class="t-body-lg">Parlez-nous de votre activité. Nous vous préparons un aperçu gratuit, sans engagement.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book.html">Demander mon aperçu gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    head = chrome(HUB, HUB['slug']).replace('</head>', jsonld(crumbs) + '</head>')
    return head + main + FOOT


for c in CITIES:
    (ROOT / (c['slug'] + '.html')).write_text(city_page(c)); print('wrote', c['slug'])
(ROOT / (HUB['slug'] + '.html')).write_text(hub_page()); print('wrote', HUB['slug'])
