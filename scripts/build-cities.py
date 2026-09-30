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
         title='Création de site internet à Fribourg | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME fribourgeoises : Fribourg, Villars-sur-Glâne, Marly, Romont. Aperçu gratuit, sans frais récurrents.',
         h1='Création de site internet<br><em>à Fribourg.</em>',
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
         title='Création de site internet à Neuchâtel | Next Digital Level',
         desc='Sites web sur mesure pour les PME neuchâteloises : Neuchâtel, Boudry, Val-de-Ruz, Val-de-Travers et le Littoral. Aperçu gratuit avant engagement.',
         h1='Création de site internet<br><em>à Neuchâtel et sur le Littoral.</em>',
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
         title='Création de site internet en Valais et à Sion | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME valaisannes : Sion, Conthey, Nendaz et les stations du Valais romand. Aperçu gratuit, prêt sous 7 jours.',
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
# ---------------------------------------------------------------------------
# Second tier: the towns that carry real search volume of their own. These are
# deliberately NOT one page per commune — near-identical pages spun up for
# hundreds of localities are doorway pages under Google's spam policy. Each
# entry below has its own economy, sectors and questions, and its title varies
# the head term ("agence web", "création de site web", "créateur de site") so
# the pages do not compete with each other for the same query.
# ---------------------------------------------------------------------------
TOWNS = [
    dict(slug='creation-site-internet-nyon', city='Nyon', canton='Vaud', canton_slug='creation-site-internet-lausanne', code='VD',
         title='Agence web à Nyon et sur La Côte | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME de Nyon, Gland, Rolle et de La Côte. Aperçu gratuit avant engagement, site prêt sous 7 jours, sans frais récurrents.',
         h1='Agence web<br><em>à Nyon et sur La Côte.</em>',
         lead='Entre Genève et Lausanne, Nyon vit à deux vitesses : une clientèle locale fidèle et une population internationale très mobile, qui cherche, compare et réserve depuis son téléphone. Un site clair, rapide et souvent bilingue fait ici toute la différence.',
         towns='Nyon, Gland, Rolle, Prangins, Coppet, Founex, Begnins, Aubonne, Saint-Cergue et l’ensemble du district de Nyon.',
         sectors=[('Commerces, restaurants et bord du lac', 'Horaires, carte, réservation et itinéraire : les informations que cherche un habitant comme un visiteur de passage, accessibles en deux gestes sur un téléphone.'),
                  ('Services aux entreprises et indépendants', 'Beaucoup de sociétés internationales et de consultants sont installés dans le district. Une présentation sobre, crédible et disponible en anglais rassure avant le premier rendez-vous.'),
                  ('Artisans, viticulture et métiers de La Côte', 'Vignerons, paysagistes, entreprises du bâtiment : vos réalisations en photos et vos communes d’intervention, clairement affichées.')],
         local='La proximité de Genève change les habitudes de recherche : une part importante des requêtes se fait en anglais, et la concurrence inclut des prestataires genevois. Nous structurons vos pages autour de vos communes réelles — Nyon, Gland, Rolle, Coppet — plutôt que d’une vague « région lémanique », et nous préparons une version anglaise lorsque votre clientèle le justifie. Votre fiche Google Business Profile est reliée au site pour les recherches « près de moi ».',
         faq=[('Faut-il une version anglaise à Nyon ?', 'Souvent, oui. Le district compte une forte population internationale. Nous en décidons ensemble selon votre clientèle : le site peut être livré en français avec une version anglaise, sans doubler la structure ni les frais.'),
              ('Travaillez-vous aussi à Gland, Rolle ou Coppet ?', 'Oui, tout le district de Nyon et La Côte. Les échanges se font par téléphone, WhatsApp ou visio, avec la possibilité d’un rendez-vous sur place.'),
              ('Mon site apparaîtra-t-il pour « près de moi » ?', 'Nous posons les bases techniques et le contenu local, et nous vous accompagnons sur votre fiche Google Business Profile, qui pèse lourd dans ces recherches. Aucun classement précis n’est garanti.')]),

    dict(slug='creation-site-internet-morges', city='Morges', canton='Vaud', canton_slug='creation-site-internet-lausanne', code='VD',
         title='Création de site web à Morges | Next Digital Level',
         desc='Sites internet sur mesure pour les commerces, artisans et indépendants de Morges, Tolochenaz, Préverenges et Saint-Prex. Aperçu gratuit, prêt sous 7 jours.',
         h1='Création de site web<br><em>à Morges.</em>',
         lead='Morges vit de son centre historique, de son port et d’un tissu dense de commerces indépendants, à dix minutes de Lausanne. Vos clients vous cherchent par nom de rue et par quartier : votre site doit répondre avant que l’on ne fasse défiler la page de résultats.',
         towns='Morges, Tolochenaz, Préverenges, Saint-Prex, Échichens, Lonay, Denges, Bussigny et le district de Morges.',
         sectors=[('Commerces et métiers de bouche du centre', 'Boutiques, boulangeries, cavistes, fleuristes : horaires, produits, photos du lieu et itinéraire, dans une page qui se charge instantanément.'),
                  ('Santé, bien-être et cabinets', 'Thérapeutes, dentistes, physiothérapeutes : une présentation rassurante, les informations pratiques en haut de page et une prise de contact immédiate.'),
                  ('Artisans et entreprises de service', 'Rénovation, chauffage, jardinage, nettoyage : vos chantiers en images et vos communes desservies, une par une.')],
         local='La concurrence sur « Morges » est plus accessible que sur Lausanne, et c’est une opportunité : une page bien construite, des textes qui nomment vos quartiers et vos communes voisines, et une fiche Google complète suffisent souvent à sortir devant des sites plus anciens mais négligés. Nous bâtissons cette structure dès la création, sans bourrage de mots-clés.',
         faq=[('Suis-je en concurrence avec les agences lausannoises ?', 'Sur les recherches locales « à Morges », non : Google privilégie la proximité et la pertinence. C’est justement ce que nous travaillons dans vos pages et votre fiche Google.'),
              ('J’ai un commerce physique. Qu’est-ce qui compte le plus ?', 'Les horaires, l’adresse avec itinéraire, des photos réelles du lieu et un numéro cliquable. Ensuite seulement le reste. Nous les plaçons en haut de page.'),
              ('Combien de temps avant la mise en ligne ?', 'Sept jours après validation du projet et réception de vos contenus. L’aperçu gratuit vient avant, sans engagement.')]),

    dict(slug='creation-site-internet-vevey-montreux', city='Vevey et Montreux', canton='Vaud', canton_slug='creation-site-internet-lausanne', code='VD',
         title='Création de site internet à Vevey et Montreux (Riviera) | Next Digital Level',
         desc='Sites web sur mesure pour l’hôtellerie, les commerces et les artisans de la Riviera : Vevey, Montreux, La Tour-de-Peilz, Clarens. Aperçu gratuit avant engagement.',
         h1='Création de site internet<br><em>à Vevey et Montreux.</em>',
         lead='Sur la Riviera, une partie de votre clientèle arrive de l’étranger et prépare tout en ligne avant de venir. Photos soignées, informations pratiques immédiates et version anglaise : votre site travaille avant, pendant et après le séjour.',
         towns='Vevey, Montreux, La Tour-de-Peilz, Clarens, Territet, Blonay, Saint-Légier, Chardonne, Corseaux et la Riviera vaudoise.',
         sectors=[('Hôtellerie, restauration et hébergement', 'Chambres, carte, horaires saisonniers et réservation : en français et en anglais, avec des photos qui donnent envie et une page qui se charge vite en 4G.'),
                  ('Bien-être, santé et soins', 'Instituts, spas, thérapeutes : présenter le lieu, l’équipe et les prestations, avec la prise de rendez-vous à portée de pouce.'),
                  ('Artisans, rénovation et patrimoine', 'Bâtiments anciens, façades classées, rénovations délicates : vos chantiers en photos valent tous les arguments.')],
         local='La saisonnalité et la clientèle internationale changent la donne : beaucoup de recherches viennent de l’extérieur du canton, souvent en anglais, presque toujours depuis un téléphone. Nous construisons des sites légers qui s’affichent vite, avec des pages par prestation et par lieu, une version anglaise lorsque c’est utile, et une fiche Google Business Profile complète — décisive pour les recherches faites sur place.',
         faq=[('Mes clients sont surtout des touristes. Est-ce adapté ?', 'Oui. Nous construisons des pages claires sur les périodes, les tarifs communiqués et la réservation, avec une version anglaise si votre clientèle le demande.'),
              ('Pouvez-vous intégrer un système de réservation ?', 'Oui, un outil tiers fiable lorsque c’est utile. Ses éventuels coûts sont précisés avant votre accord, comme tout service externe.'),
              ('Couvrez-vous Montreux et Vevey de la même façon ?', 'Oui, ainsi que La Tour-de-Peilz, Clarens et les hauts de la Riviera. Une seule page peut couvrir plusieurs communes si votre zone est continue.')]),

    dict(slug='creation-site-internet-yverdon', city='Yverdon-les-Bains', canton='Vaud', canton_slug='creation-site-internet-lausanne', code='VD',
         title='Créateur de site internet à Yverdon-les-Bains | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME du Nord vaudois : Yverdon-les-Bains, Grandson, Orbe, Sainte-Croix. Aperçu gratuit, sans frais récurrents.',
         h1='Créateur de site internet<br><em>à Yverdon-les-Bains.</em>',
         lead='Entre thermalisme, industrie et technologie, le Nord vaudois mélange les métiers comme peu de régions. Le point commun de ses entreprises : une clientèle régionale qui cherche d’abord sur Google, puis appelle.',
         towns='Yverdon-les-Bains, Grandson, Orbe, Chavornay, Sainte-Croix, Vallorbe, Échallens et le Nord vaudois.',
         sectors=[('Bien-être, santé et thermalisme', 'Instituts, cabinets et soins : informations pratiques, prestations détaillées et prise de rendez-vous simple, sur un site qui inspire calme et sérieux.'),
                  ('Industrie, technique et sous-traitance', 'Ateliers, bureaux techniques et fournisseurs : une présentation précise de vos capacités, en français et en anglais si vous travaillez avec l’étranger.'),
                  ('Commerces et services de proximité', 'Garages, salons, artisans, restauration : vos horaires, votre adresse et un numéro cliquable, visibles dès le premier écran.')],
         local='Le Nord vaudois est vaste et les recherches y sont très locales : « garage Yverdon », « institut Grandson », « menuisier Orbe ». Un site sur mesure permet de créer, sans lourdeur, des sections dédiées aux communes que vous servez réellement, avec des textes utiles plutôt qu’une liste de villes. C’est cette structure que nous posons dès le départ.',
         faq=[('Je travaille dans plusieurs communes. Faut-il une page par ville ?', 'Rarement. Mieux vaut quelques pages solides et honnêtes que des dizaines de pages presque identiques, que Google sanctionne. Nous définissons ensemble le bon découpage.'),
              ('Mon activité est très technique. Saurez-vous l’expliquer ?', 'C’est notre travail : nous vous interrogeons, puis nous rédigeons avec vous des textes clairs que vos clients comprennent, sans trahir votre métier.'),
              ('Que se passe-t-il après la mise en ligne ?', 'Douze mois de suivi sont inclus : modifications courantes, questions et conseils, 7 jours sur 7.')]),

    dict(slug='creation-site-internet-bulle', city='Bulle', canton='Fribourg', canton_slug='creation-site-internet-fribourg', code='FR',
         title='Création de site internet à Bulle et en Gruyère | Next Digital Level',
         desc='Sites web sur mesure pour les entreprises de Bulle, Riaz, Charmey et de la Gruyère : artisanat, terroir, bâtiment, tourisme. Aperçu gratuit avant engagement.',
         h1='Création de site internet<br><em>à Bulle et en Gruyère.</em>',
         lead='La Gruyère est l’une des régions qui grandissent le plus vite en Suisse, et Bulle avec elle. Beaucoup d’entreprises y travaillent très bien sans presque aucune présence en ligne : c’est exactement là qu’un site soigné prend l’avantage.',
         towns='Bulle, Riaz, Vuadens, La Tour-de-Trême, Gruyères, Charmey, Broc, Sâles et le district de la Gruyère.',
         sectors=[('Terroir, artisanat alimentaire et commerces', 'Fromageries, boucheries, cafés, magasins à la ferme : vos produits, vos horaires, votre histoire et le chemin pour venir.'),
                  ('Bâtiment et métiers de la construction', 'Charpente, menuiserie, chauffage, maçonnerie : la région construit, et vos chantiers photographiés valent mieux qu’une longue présentation.'),
                  ('Tourisme, loisirs et hébergement', 'Chalets, activités, restaurants d’altitude : des informations saisonnières claires et une réservation simple, en français comme en anglais.')],
         local='À Bulle, beaucoup de concurrents n’ont pas de site, ou un site ancien et lent sur téléphone. Une présence propre — pages claires par prestation, mention honnête de vos communes, fiche Google Business Profile complète — suffit souvent à passer devant. Le canton étant bilingue, une version allemande peut élargir votre portée selon votre zone.',
         faq=[('Faut-il une version allemande depuis Bulle ?', 'Cela dépend de votre clientèle. En Gruyère, le français suffit dans la majorité des cas ; nous en discutons avant de décider.'),
              ('Je n’ai jamais eu de site. Par où commencer ?', 'Par un appel de trente minutes. Nous préparons ensuite un aperçu gratuit que vous jugez sur pièce avant toute décision.'),
              ('Couvrez-vous Gruyères, Charmey et les villages ?', 'Oui, tout le district. Les échanges se font à distance ou sur rendez-vous si vous préférez.')]),

    dict(slug='creation-site-internet-martigny', city='Martigny', canton='Valais', canton_slug='creation-site-internet-valais', code='VS',
         title='Site internet à Martigny et dans le Bas-Valais | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME de Martigny, Fully, Saxon et du Bas-Valais : vignerons, artisans, commerces. Aperçu gratuit, prêt sous 7 jours.',
         h1='Site internet à Martigny<br><em>et dans le Bas-Valais.</em>',
         lead='Carrefour entre la France, l’Italie et le reste du Valais, Martigny voit passer autant de clients de passage que d’habitués. Votre site doit convaincre les deux : les premiers cherchent vite, les seconds vérifient que vous êtes toujours là.',
         towns='Martigny, Fully, Saxon, Charrat, Vernayaz, Saillon, Leytron, Orsières et le Bas-Valais.',
         sectors=[('Vignerons, caves et produits du terroir', 'Vos cépages, vos horaires de dégustation et votre histoire, dans des pages qui donnent envie de pousser la porte de la cave.'),
                  ('Artisans et entreprises du bâtiment', 'Rénovation, chauffage, électricité, charpente : vos réalisations en photos et vos communes d’intervention, clairement listées.'),
                  ('Commerces, restauration et tourisme de transit', 'Une clientèle de passage décide en quelques secondes : horaires, parking, carte et itinéraire doivent être visibles immédiatement.')],
         local='Les recherches en Bas-Valais sont saisonnières et souvent faites en déplacement, depuis un téléphone, parfois avec une connexion moyenne. Nous livrons donc des pages très légères, avec les informations décisives en haut, et nous structurons le contenu par activité et par commune. La fiche Google Business Profile, reliée au site, fait le reste du travail sur les recherches « à proximité ».',
         faq=[('Je reçois beaucoup de clients de passage. Que faut-il montrer ?', 'Les horaires réels, l’adresse avec itinéraire, le parking, un numéro cliquable et quelques photos honnêtes du lieu. Le reste vient ensuite.'),
              ('Faut-il une version anglaise ou italienne ?', 'Selon votre clientèle. Pour une cave ou un commerce très touristique, une version anglaise est souvent rentable ; nous en parlons au premier échange.'),
              ('Travaillez-vous aussi à Fully, Saxon ou Orsières ?', 'Oui, tout le Bas-Valais. Les échanges se font par téléphone, WhatsApp ou visio.')]),

    dict(slug='creation-site-internet-sierre', city='Sierre', canton='Valais', canton_slug='creation-site-internet-valais', code='VS',
         title='Création de site web à Sierre et Crans-Montana | Next Digital Level',
         desc='Sites internet sur mesure pour les entreprises de Sierre, Crans-Montana, Chippis et du Valais central : caves, hébergement, artisans. Aperçu gratuit.',
         h1='Création de site web<br><em>à Sierre et Crans-Montana.</em>',
         lead='Entre la cité du soleil et la station qui la surplombe, le Valais central mélange vignoble, industrie et tourisme. Trois clientèles différentes, un même réflexe : chercher en ligne avant de se déplacer ou de réserver.',
         towns='Sierre, Chippis, Chalais, Venthône, Miège, Salgesch, Crans-Montana, Icogne, Lens et le Valais central.',
         sectors=[('Caves, vignerons et gastronomie', 'Sierre est une capitale du vin : vos cépages, vos dégustations et votre domaine méritent des pages à la hauteur, en français et en anglais.'),
                  ('Hébergement, stations et activités', 'Chalets, locations, écoles de sport, guides : disponibilités, périodes et réservation, clairement présentés pour une clientèle qui vient de loin.'),
                  ('Services, artisans et industrie', 'Du commerce de proximité à la sous-traitance industrielle : une présence crédible qui rassure avant le premier appel.')],
         local='Une part importante des recherches sur Crans-Montana vient de l’extérieur du canton, voire de l’étranger, et se fait en anglais. En plaine, à Sierre, les requêtes sont au contraire très locales. Nous traitons les deux séparément dans la structure du site plutôt que de tout mélanger, et nous relions le tout à votre fiche Google Business Profile.',
         faq=[('Je travaille en plaine et en station. Faut-il deux sites ?', 'Non, un seul site bien structuré suffit : des pages distinctes pour des offres distinctes, sous une même identité.'),
              ('Une version anglaise est-elle nécessaire ?', 'Pour une activité touristique à Crans-Montana, très souvent. Pour un commerce sierrois de proximité, rarement. Nous décidons avec vous.'),
              ('Le site sera-t-il rapide en montagne ?', 'C’est un point que nous traitons sérieusement : code léger, images optimisées, aucun script superflu. Nous mesurons le chargement sur un vrai téléphone.')]),

    dict(slug='creation-site-internet-monthey', city='Monthey', canton='Valais', canton_slug='creation-site-internet-valais', code='VS',
         title='Agence web à Monthey et dans le Chablais | Next Digital Level',
         desc='Création de sites web sur mesure pour les PME du Chablais : Monthey, Aigle, Bex, Collombey, Champéry. Aperçu gratuit avant engagement, sans abonnement.',
         h1='Agence web à Monthey<br><em>et dans le Chablais.</em>',
         lead='Le Chablais réunit un pôle industriel solide, des villages de plaine et les stades des Portes du Soleil. Les entreprises y travaillent souvent de bouche-à-oreille : un site sérieux transforme cette réputation en appels entrants.',
         towns='Monthey, Collombey-Muraz, Vionnaz, Vouvry, Troistorrents, Champéry, Val-d’Illiez, ainsi qu’Aigle et Bex sur la rive vaudoise.',
         sectors=[('Industrie, technique et sous-traitance', 'Le site chimique et son écosystème font vivre de nombreux fournisseurs : une présentation précise de vos capacités, en français et en anglais si vous exportez.'),
                  ('Tourisme de montagne et hébergement', 'Chalets, écoles de sport, restaurants d’altitude : informations saisonnières claires et réservation simple, pour une clientèle souvent étrangère.'),
                  ('Artisans, commerces et services du Chablais', 'Bâtiment, garages, salons, restauration : horaires, zone d’intervention et contact immédiat, lisibles sur un téléphone.')],
         local='Le Chablais est à cheval sur deux cantons : beaucoup d’entreprises de Monthey travaillent aussi à Aigle et Bex, côté vaudois. Nous le disons explicitement dans vos pages, parce que vos clients cherchent par commune et non par canton. C’est un détail que la plupart des sites de la région négligent, et un avantage facile à prendre.',
         faq=[('Je travaille des deux côtés du Rhône. Est-ce un problème ?', 'Au contraire, c’est une force à afficher. Nous nommons explicitement vos communes vaudoises et valaisannes dans le site.'),
              ('Mon activité est saisonnière. Comment le gérer ?', 'Nous prévoyons des sections qui changent avec la saison, et pendant les 12 mois de suivi vous nous demandez simplement la mise à jour.'),
              ('Faut-il une version anglaise pour les Portes du Soleil ?', 'Pour une activité touristique, c’est souvent rentable. Nous en décidons ensemble selon votre clientèle réelle.')]),

    dict(slug='creation-site-internet-la-chaux-de-fonds', city='La Chaux-de-Fonds', canton='Neuchâtel', canton_slug='creation-site-internet-neuchatel', code='NE',
         title='Création de site internet à La Chaux-de-Fonds et au Locle | Next Digital Level',
         desc='Sites web sur mesure pour les entreprises des Montagnes neuchâteloises : La Chaux-de-Fonds, Le Locle, horlogerie, artisanat, commerces. Aperçu gratuit.',
         h1='Création de site internet<br><em>à La Chaux-de-Fonds.</em>',
         lead='Les Montagnes neuchâteloises ont une culture de la précision et de la discrétion. C’est une qualité dans l’atelier, un handicap en ligne : beaucoup d’entreprises excellentes y sont presque invisibles sur Google.',
         towns='La Chaux-de-Fonds, Le Locle, Les Brenets, La Sagne, Les Ponts-de-Martel et les Montagnes neuchâteloises.',
         sectors=[('Horlogerie, micro-technique et ateliers', 'Décolletage, terminaison, cadrans, outillage : une présentation précise de vos capacités et de vos certifications, en français et en anglais pour vos donneurs d’ordre.'),
                  ('Artisans et métiers du bâtiment', 'Rénovation, chauffage, couverture, électricité : un parc immobilier ancien à entretenir, et des chantiers qui se racontent en photos.'),
                  ('Commerces, restauration et services', 'Boutiques, salons, garages, cabinets : horaires, adresse et numéro cliquable, visibles immédiatement sur un téléphone.')],
         local='Les recherches se concentrent sur deux pôles, La Chaux-de-Fonds et Le Locle, avec une concurrence en ligne souvent faible : de nombreux ateliers n’ont pas de site, ou un site datant d’une décennie. Des pages claires par prestation, une mention honnête de vos clients types et une fiche Google Business Profile complète suffisent fréquemment à devenir le premier résultat crédible de la région.',
         faq=[('Je travaille en sous-traitance, pas avec le grand public. Un site est-il utile ?', 'Oui, souvent davantage : vos donneurs d’ordre vérifient votre sérieux en ligne avant de vous contacter. Une page de capacités précise fait le travail.'),
              ('Faut-il une version anglaise ?', 'Pour l’horlogerie et la sous-traitance, presque toujours. Nous rédigeons le français et livrons l’anglais avec vous.'),
              ('Couvrez-vous Le Locle et les villages ?', 'Oui, toutes les Montagnes neuchâteloises. Les échanges se font par téléphone, WhatsApp ou visio.')]),
]

HUB = dict(slug='creation-site-internet-suisse-romande', title='Création de site internet en Suisse romande | Next Digital Level',
           desc='Agence suisse de création de sites web sur mesure pour les PME de Suisse romande : Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura. Aperçu gratuit avant engagement.',
           h1='Création de site internet<br><em>en Suisse romande.</em>',
           lead='Next Digital Level est un studio suisse. Nous concevons et codons des sites sur mesure pour les PME et indépendants de toute la Suisse romande, avec un aperçu gratuit avant tout engagement, un site prêt sous 7 jours et 12 mois de suivi inclus. Choisissez votre région.')


def chrome(s, slug):
    head = HEAD
    head = re.sub(r'<title>.*?</title>', '<title>' + html.escape(s['title']) + '</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://nextdigitalevel.com/%s">' % slug, head)
    short = html.escape(s['title'].split(' | ')[0], quote=True)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + short + '">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://nextdigitalevel.com/%s">' % slug, head)
    head = re.sub(r'<meta name="twitter:title" content="[^"]*">', '<meta name="twitter:title" content="' + short + '">', head)
    head = re.sub(r'<meta name="twitter:description" content="[^"]*">', '<meta name="twitter:description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    return head


def jsonld(*objs):
    return ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(o, ensure_ascii=False, indent=1) for o in objs)


def city_page(c):
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in c['faq']]}
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Suisse romande", "item": "https://nextdigitalevel.com/creation-site-internet-suisse-romande"},
        {"@type": "ListItem", "position": 3, "name": c['city'], "item": "https://nextdigitalevel.com/%s" % c['slug']}]}
    service_ld = {"@context": "https://schema.org", "@type": "Service", "serviceType": "Création de site internet", "name": "Création de site internet à " + c['city'],
                  "provider": {"@type": "ProfessionalService", "name": "Next Digital Level", "url": "https://nextdigitalevel.com/", "telephone": "+41762632817"},
                  "areaServed": {"@type": "AdministrativeArea", "name": "Canton de " + c['canton'], "containedInPlace": {"@type": "Country", "name": "Switzerland"}},
                  "url": "https://nextdigitalevel.com/%s" % c['slug']}
    cards = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span><h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b) for i, (t, b) in enumerate(c['sectors']))
    faq = ''.join('<details class="faq-detail"><summary>%s<span aria-hidden="true">+</span></summary><p class="t-body">%s</p></details>' % (q, a) for q, a in c['faq'])
    mine = [t for t in TOWNS if t['canton_slug'] == c['slug']]
    towns_block = ''
    if mine:
        links = ''.join('<a href="/%s"><small>%s</small><b>%s</b>%s</a>\n' % (t['slug'], t['code'], t['city'], NE) for t in mine)
        towns_block = f"""<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Dans le canton</span><h2 class="t-display-lg" data-split="words">Votre ville.</h2>
<p class="t-body">Nous travaillons dans tout le canton. Ces pages détaillent les réalités locales de chaque bassin.</p>
</div>
<div class="regions reveal">
{links}</div>
</div>
</section>
"""
    others = ''.join('<a href="/%s" data-cursor="view"><span><small>%s</small>%s</span><span aria-hidden="true">%s</span></a>' % (o['slug'], o['code'], o['canton'], NE) for o in CITIES if o['slug'] != c['slug'])
    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ Suisse romande · {c['canton']}</span><h1 class="t-display-xl hero__title">{c['h1']}</h1><p class="t-body-lg hero__lead">{c['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
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
<a class="btn btn--ghost btn--lg" href="/seo-local">Notre approche du SEO local{NE}</a>
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
{towns_block}<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Ailleurs en Suisse romande</span><h2 class="t-display-lg" data-split="words">Les autres cantons.</h2>
</div>
<div class="sector-links reveal">{others}<a href="/creation-site-internet-suisse-romande" data-cursor="view"><span><small>CH</small>Toute la Suisse romande</span><span aria-hidden="true">{NE}</span></a></div>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Votre site à {c['city']}.<br><em>Voyez-le avant de décider.</em></h2><p class="t-body-lg">Parlez-nous de votre activité. Nous vous préparons un aperçu gratuit, sans engagement.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    head = chrome(c, c['slug']).replace('</head>', jsonld(faq_ld, crumbs, service_ld) + '</head>')
    return head + main + FOOT


def town_page(t):
    """A town page: same skeleton as a canton page, but anchored on one bassin
    and cross-linked to its canton rather than to the five other cantons."""
    canton = next(c for c in CITIES if c['slug'] == t['canton_slug'])
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in t['faq']]}
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Suisse romande", "item": "https://nextdigitalevel.com/creation-site-internet-suisse-romande"},
        {"@type": "ListItem", "position": 3, "name": canton['canton'], "item": "https://nextdigitalevel.com/%s" % canton['slug']},
        {"@type": "ListItem", "position": 4, "name": t['city'], "item": "https://nextdigitalevel.com/%s" % t['slug']}]}
    service_ld = {"@context": "https://schema.org", "@type": "Service",
                  "serviceType": "Création de site internet",
                  "name": "Création de site internet à " + t['city'],
                  "provider": {"@type": "ProfessionalService", "@id": "https://nextdigitalevel.com/#organization",
                               "name": "Next Digital Level", "url": "https://nextdigitalevel.com/", "telephone": "+41762632817"},
                  "areaServed": {"@type": "City", "name": t['city'], "containedInPlace": {"@type": "AdministrativeArea", "name": "Canton de " + t['canton'], "containedInPlace": {"@type": "Country", "name": "Switzerland"}}},
                  "url": "https://nextdigitalevel.com/%s" % t['slug']}
    cards = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span><h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, a, b) for i, (a, b) in enumerate(t['sectors']))
    faq = ''.join('<details class="faq-detail"><summary>%s<span aria-hidden="true">+</span></summary><p class="t-body">%s</p></details>' % (q, a) for q, a in t['faq'])
    siblings = [o for o in TOWNS if o['canton_slug'] == t['canton_slug'] and o['slug'] != t['slug']][:3]
    near = ''.join('<a href="/%s" data-cursor="view"><span><small>%s</small>%s</span><span aria-hidden="true">%s</span></a>' % (o['slug'], o['code'], o['city'], NE) for o in siblings)
    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ {canton['canton']} · {t['city']}</span><h1 class="t-display-xl hero__title">{t['h1']}</h1><p class="t-body-lg hero__lead">{t['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
</div>
<p class="hero__note">Entreprise suisse · aperçu gratuit · prêt sous 7 jours · sans frais récurrents · 12 mois de suivi</p>
</div>
</section>
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Pour qui</span><h2 class="t-display-lg" data-split="words">Les entreprises de {t['city']}.</h2>
<p class="t-body">Nous intervenons à {t['towns']}</p>
</div>
<div class="grid grid--3 stagger">{cards}</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="included">
<div class="included__copy reveal">
<span class="eyebrow">/ Être trouvé à {t['city']}</span>
<h2 class="t-display-lg" data-split="words">Ce qui compte<br><em>dans votre bassin.</em></h2>
<p class="t-body-lg">{t['local']}</p>
<a class="btn btn--ghost btn--lg" href="/seo-local">Notre approche du SEO local{NE}</a>
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
<span class="eyebrow">/ Vos questions</span><h2 class="t-display-lg" data-split="words">Questions fréquentes<br>à {t['city']}.</h2>
<p class="t-body faq-aside">Une autre question ? L’assistant en bas de page répond immédiatement, ou écrivez-nous sur WhatsApp.</p>
</div>
<div class="faq reveal">{faq}</div>
</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ À proximité</span><h2 class="t-display-lg" data-split="words">Ailleurs dans le canton.</h2>
</div>
<div class="sector-links reveal">{near}<a href="/{canton['slug']}" data-cursor="view"><span><small>{t['code']}</small>Tout le canton de {canton['canton']}</span><span aria-hidden="true">{NE}</span></a><a href="/creation-site-internet-suisse-romande" data-cursor="view"><span><small>CH</small>Toute la Suisse romande</span><span aria-hidden="true">{NE}</span></a></div>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Votre site à {t['city']}.<br><em>Voyez-le avant de décider.</em></h2><p class="t-body-lg">Parlez-nous de votre activité. Nous vous préparons un aperçu gratuit, sans engagement.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    head = chrome(t, t['slug']).replace('</head>', jsonld(faq_ld, crumbs, service_ld) + '</head>')
    return head + main + FOOT


def hub_page():
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Suisse romande", "item": "https://nextdigitalevel.com/creation-site-internet-suisse-romande"}]}
    town_index = ''.join('<a href="/%s"><small>%s</small><b>%s</b>%s</a>\n' % (t['slug'], t['code'], t['city'], NE) for t in TOWNS)
    cards = ''.join(f'<a class="card card--spot region-card" data-spot href="/{c["slug"]}"><span class="card__num">{c["code"]}</span><h3 class="t-display-sm">{c["canton"]}</h3><p class="t-body">{c["region"]}</p><span class="card__more">Voir la page {c["city"]}{NE}</span></a>' for c in CITIES)
    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ Suisse romande</span><h1 class="t-display-xl hero__title">{HUB['h1']}</h1><p class="t-body-lg hero__lead">{HUB['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
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
<section class="section section--soft" id="villes">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Votre ville</span><h2 class="t-display-lg" data-split="words">Les bassins que nous<br>couvrons en détail.</h2>
<p class="t-body">Chaque page décrit la réalité économique et les recherches locales de sa région. Votre commune n’y figure pas ? Nous intervenons partout en Suisse romande — appelez-nous.</p>
</div>
<div class="regions reveal">
{town_index}</div>
</div>
</section>
<section class="section">
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
<a class="btn btn--gold btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    head = chrome(HUB, HUB['slug']).replace('</head>', jsonld(crumbs) + '</head>')
    return head + main + FOOT


for c in CITIES:
    (ROOT / (c['slug'] + '.html')).write_text(city_page(c)); print('wrote', c['slug'])
for t in TOWNS:
    (ROOT / (t['slug'] + '.html')).write_text(town_page(t)); print('wrote', t['slug'])
(ROOT / (HUB['slug'] + '.html')).write_text(hub_page()); print('wrote', HUB['slug'])
