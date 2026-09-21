"""Generate the six service pages from the shared chrome of websites.html.

Run `python3 scripts/build-services.py` after editing SERVICES; the head,
header, drawer and footer are copied from websites.html so they stay in sync.
"""
from pathlib import Path
import html, re

ROOT = Path(__file__).resolve().parent.parent
BASE = (ROOT / 'websites.html').read_text()
HEAD = BASE[:BASE.index('<main id="main">') + len('<main id="main">')]
FOOT = BASE[BASE.index('</main>'):]
NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

SERVICES = [
    dict(slug='design-sur-mesure', num='01', nav='Design à votre image',
         title='Design à votre image | Next Digital Level',
         desc='Une direction artistique dessinée pour votre entreprise, pas un thème acheté. Aperçu gratuit avant de vous engager, sans frais récurrents. Entreprise suisse.',
         eyebrow='/ Design à votre image', h1='Un design dessiné<br><em>pour votre entreprise.</em>',
         lead='Vos couleurs, votre ton, votre clientèle. Nous concevons chaque page comme une pièce unique, pas comme un gabarit à remplir. Le résultat inspire confiance avant même que l’on ait lu une ligne.',
         why=[('Une première impression maîtrisée', 'En quelques secondes, un visiteur décide s’il vous fait confiance. Une mise en page juste, une typographie soignée et des espaces respirants font ce travail à votre place.'),
              ('Reconnaissable entre mille', 'Un thème est partagé par des milliers de sites. Un design sur mesure reprend votre identité, votre logo, vos matières, votre façon de parler à vos clients.'),
              ('Pensé pour convertir', 'Chaque écran a un objectif : appeler, écrire, réserver. Nous plaçons les boutons, les preuves et les informations là où votre client les attend.')],
         steps=[('Immersion', 'Nous regardons votre activité, vos concurrents, vos clients. Nous notons ce qui vous distingue et ce que votre site doit faire dire de vous.'),
                ('Direction visuelle', 'Palette, typographies, rythme des pages, style des photos. Une direction claire, présentée dans l’aperçu gratuit avant tout engagement.'),
                ('Maquettes de chaque page', 'Accueil, services, à propos, contact : chaque page est composée pour ordinateur et téléphone, avec vos vrais contenus.'),
                ('Ajustements ensemble', 'Vous réagissez, nous affinons. Deux ou trois allers-retours suffisent en général pour que le design vous ressemble.')],
         included=['Direction artistique complète', 'Maquettes ordinateur et mobile', 'Palette et typographies cohérentes', 'Icônes, illustrations et micro-animations', 'Adaptation de votre logo si nécessaire', 'Fichiers sources remis'],
         faq=[('Je n’ai pas de logo ni de charte. Est-ce un problème ?', 'Non. Beaucoup de nos clients partent de zéro. Nous proposons une direction visuelle simple et cohérente, et nous pouvons composer un logotype sobre si vous n’en avez pas.'),
              ('Puis-je voir le design avant de m’engager ?', 'Oui, c’est le principe de l’aperçu gratuit : vous découvrez la direction proposée sur votre propre projet, puis vous décidez.'),
              ('Le design est-il vraiment unique ?', 'Oui. Aucun thème, aucun constructeur. Chaque page est composée pour vous, puis codée à la main.'),
              ('Combien de retours puis-je faire ?', 'Nous n’imposons pas de quota rigide. Nous définissons ensemble le périmètre avant de commencer, et nous affinons jusqu’à ce que le résultat vous ressemble.')],
         related=['developpement-sur-mesure', 'contenu-redaction']),
    dict(slug='developpement-sur-mesure', num='02', nav='Code sur mesure',
         title='Développement web sur mesure | Next Digital Level',
         desc='Un site codé ligne par ligne, sans constructeur ni extension à maintenir. Léger, rapide et à vous. Aperçu gratuit, sans frais récurrents.',
         eyebrow='/ Code sur mesure', h1='Codé ligne par ligne.<br><em>Léger, rapide, à vous.</em>',
         lead='Pas de WordPress, pas de Wix, pas d’extensions qui cassent à chaque mise à jour. Nous écrivons le code de votre site nous-mêmes. Il charge vite, il tient dans le temps, et il vous appartient.',
         why=[('Des pages qui chargent vite', 'Un site sur mesure ne transporte que ce dont il a besoin. Sur mobile, en 4G, la différence avec un site à constructeur se compte en secondes.'),
              ('Rien à maintenir', 'Pas de plugins, pas de mises à jour de sécurité hebdomadaires, pas de licence qui expire. Un site propre reste propre.'),
              ('Votre propriété, code compris', 'Vous recevez l’intégralité du code. Aucune plateforme ne peut vous retenir, augmenter ses tarifs ou fermer.')],
         steps=[('Structure', 'Nous transformons les maquettes en pages HTML sémantiques, accessibles et prêtes pour Google.'),
                ('Style et mouvement', 'Feuilles de style écrites à la main, animations sobres, comportements pensés pour le tactile.'),
                ('Tests', 'Téléphones, tablettes, ordinateurs, navigateurs récents. Nous vérifions chaque écran et chaque formulaire.'),
                ('Mise en ligne', 'Nom de domaine, certificat HTTPS, redirections, hébergement rapide : nous nous occupons de tout et vous remettons les accès.')],
         included=['Code HTML, CSS et JavaScript écrit à la main', 'Hébergement rapide et sécurisé configuré', 'HTTPS, redirections et en-têtes de sécurité', 'Formulaires de contact et liens d’appel', 'Compatibilité navigateurs et appareils', 'Code source remis en fin de projet'],
         faq=[('Pourquoi ne pas utiliser WordPress ?', 'WordPress convient à certains projets, mais il impose des mises à jour, des extensions et des risques de sécurité. Pour une vitrine de PME, un site codé sur mesure est plus rapide, plus stable et sans frais récurrents.'),
              ('Où mon site est-il hébergé ?', 'Sur un hébergement rapide adapté aux sites statiques. Nous le configurons pour vous ; le nom de domaine reste enregistré à votre nom.'),
              ('Puis-je ajouter une boutique ou une réservation en ligne ?', 'Oui. Nous intégrons des outils tiers fiables (réservation, paiement) lorsque c’est utile, et nous précisons leurs éventuels coûts avant votre accord.'),
              ('Que se passe-t-il si je veux changer de prestataire plus tard ?', 'Vous partez avec votre code et votre domaine. N’importe quel développeur peut reprendre un site propre.')],
         related=['design-sur-mesure', 'site-mobile']),
    dict(slug='seo-local', num='03', nav='Les bases pour être trouvé',
         title='SEO local et Google Business Profile | Next Digital Level',
         desc='Les bases techniques et éditoriales pour être trouvé par vos clients dans votre région. Google Business Profile inclus lorsque c’est adapté.',
         eyebrow='/ Les bases pour être trouvé', h1='Être trouvé<br><em>par les clients d’à côté.</em>',
         lead='Quand quelqu’un cherche « plombier Fribourg » ou « institut de beauté Nyon », votre site doit être compris par Google et rassurer en un coup d’œil. Nous mettons en place ce socle dès la création.',
         why=[('Un site que Google comprend', 'Titres, descriptions, données structurées, plan du site, vitesse : les fondations techniques sont posées correctement dès le premier jour.'),
              ('Un contenu local pertinent', 'Vos services, votre zone d’intervention, vos villes : nous rédigeons des pages qui répondent aux vraies recherches de votre région.'),
              ('Une fiche Google soignée', 'Votre fiche Google Business Profile est souvent le premier contact. Nous vous aidons à la compléter, la relier au site et la faire vivre.')],
         steps=[('Recherche', 'Quels mots vos clients tapent-ils ? Quelles villes, quels services ? Nous partons de la réalité de votre marché.'),
                ('Socle technique', 'Balises, données structurées, sitemap, performance, HTTPS : tout ce que Google attend d’un site sérieux.'),
                ('Pages et contenus', 'Une page par service important, une présence claire de votre zone, des textes utiles et lisibles.'),
                ('Fiche Google et suivi', 'Configuration de Google Business Profile et de Search Console, puis conseils pendant les 12 mois de suivi.')],
         included=['Balises titre et descriptions optimisées', 'Données structurées (schema.org)', 'Sitemap, robots et Search Console', 'Pages rapides et images optimisées', 'Contenu local par service et par zone', 'Accompagnement Google Business Profile'],
         faq=[('Garantissez-vous la première page de Google ?', 'Non, et personne ne le peut honnêtement. Nous posons toutes les bases et nous rédigeons des contenus pertinents ; le classement dépend ensuite de votre marché et du temps.'),
              ('Faut-il un blog ?', 'Pas forcément. Pour une PME locale, des pages de services claires et une fiche Google vivante comptent souvent davantage.'),
              ('Que faire de mes avis clients ?', 'Nous vous conseillons pour obtenir des avis réguliers sur votre fiche Google et nous pouvons les mettre en valeur sur le site.'),
              ('Le SEO est-il facturé en plus ?', 'Les bases décrites ici sont incluses dans chaque site. Un accompagnement plus poussé (publicité, campagnes) est décrit sur la page Visibilité.')],
         related=['contenu-redaction', 'suivi-12-mois']),
    dict(slug='site-mobile', num='04', nav='Pensé pour le mobile',
         title='Site web pensé pour le mobile | Next Digital Level',
         desc='La majorité de vos clients vous découvrent sur leur téléphone. Un site conçu d’abord pour le mobile : appel, WhatsApp et itinéraire en un geste.',
         eyebrow='/ Pensé pour le mobile', h1='D’abord sur le téléphone.<br><em>Un geste pour vous joindre.</em>',
         lead='Plus de six visites sur dix se font depuis un mobile. Nous concevons chaque page d’abord pour un écran de poche : lisible, rapide, et avec un bouton d’appel toujours à portée de pouce.',
         why=[('Un appel en un geste', 'Bouton d’appel, WhatsApp et itinéraire fixés en bas de l’écran : votre client n’a jamais à chercher comment vous contacter.'),
              ('Lisible sans zoomer', 'Tailles de texte, contrastes et espacements sont réglés pour le pouce et pour la lecture en plein soleil.'),
              ('Rapide même en 4G', 'Images optimisées, code léger, aucun script inutile : la page s’affiche avant que le visiteur ne perde patience.')],
         steps=[('Maquettes mobile en premier', 'Nous composons d’abord la version téléphone, puis nous élargissons vers la tablette et l’ordinateur.'),
                ('Parcours de contact', 'Appel, message, itinéraire, horaires : les actions clés sont accessibles depuis chaque page.'),
                ('Performance', 'Chaque image et chaque police sont optimisées. Nous mesurons le temps de chargement sur un vrai téléphone.'),
                ('Tests réels', 'iPhone, Android, petits et grands écrans, navigation au pouce : nous vérifions tout avant la mise en ligne.')],
         included=['Conception mobile-first', 'Barre de contact fixe (appel, WhatsApp)', 'Lien itinéraire vers votre adresse', 'Images et polices optimisées', 'Tests sur appareils réels', 'Compatibilité iOS et Android'],
         faq=[('Mon site actuel s’affiche mal sur téléphone. Pouvez-vous le corriger ?', 'Dans la plupart des cas, il est plus efficace de le reconstruire proprement. L’aperçu gratuit vous montre la différence sur votre propre téléphone.'),
              ('Le bouton WhatsApp est-il compris ?', 'Oui. Nous relions WhatsApp, l’appel et l’e-mail à vos vrais numéros et adresses, et nous testons chaque lien.'),
              ('Le site sera-t-il aussi beau sur ordinateur ?', 'Bien sûr. Partir du mobile garantit la clarté ; la version ordinateur profite ensuite de l’espace supplémentaire.'),
              ('Faut-il une application ?', 'Non. Un site rapide et bien conçu fait tout ce qu’une PME attend, sans installation ni frais d’app store.')],
         related=['developpement-sur-mesure', 'design-sur-mesure']),
    dict(slug='contenu-redaction', num='05', nav='Textes et structure',
         title='Rédaction et structure des contenus | Next Digital Level',
         desc='Nous rédigeons avec vous des pages claires : vos services, votre différence, votre zone. Le bon mot au bon endroit, sans jargon.',
         eyebrow='/ Textes et structure', h1='Des mots simples<br><em>qui donnent envie d’appeler.</em>',
         lead='Un beau site avec des textes flous ne convainc personne. Nous organisons vos pages et nous rédigeons avec vous : ce que vous faites, pour qui, où, et pourquoi vous.',
         why=[('Une structure qui guide', 'Accueil, services, à propos, contact : chaque page a un rôle et amène naturellement vers le suivant.'),
              ('Votre voix, sans jargon', 'Nous écrivons comme vous parlez à vos clients : clair, chaleureux, précis. Sans formules creuses.'),
              ('Utile pour Google aussi', 'Des textes qui répondent aux vraies questions de vos clients sont exactement ce que les moteurs de recherche récompensent.')],
         steps=[('Entretien', 'Trente minutes pour comprendre votre métier, vos clients et vos points forts. Nous prenons des notes, vous parlez.'),
                ('Plan du site', 'Nous proposons les pages, leur ordre et ce que chacune doit dire. Vous validez avant l’écriture.'),
                ('Rédaction', 'Titres, paragraphes, appels à l’action, FAQ : nous rédigeons l’ensemble et vous relisez.'),
                ('Photos et preuves', 'Nous vous guidons pour les photos (les vôtres suffisent souvent) et nous mettons en valeur vos avis et réalisations.')],
         included=['Plan du site et hiérarchie des pages', 'Rédaction de toutes les pages', 'Titres et appels à l’action', 'Foire aux questions', 'Conseils photos et sélection', 'Relecture et corrections'],
         faq=[('Je ne sais pas quoi écrire. Est-ce grave ?', 'Pas du tout. C’est justement notre travail : nous posons les questions, nous écrivons, vous corrigez.'),
              ('Pouvez-vous rédiger en allemand ou en anglais ?', 'Oui pour l’anglais et le français. Pour l’allemand et l’italien, nous travaillons avec des relecteurs natifs ; nous en parlons lors du premier échange.'),
              ('Dois-je fournir des photos professionnelles ?', 'Non. Des photos nettes prises avec votre téléphone, en lumière naturelle, font souvent très bien l’affaire. Nous vous indiquons quoi photographier.'),
              ('Puis-je modifier les textes plus tard ?', 'Oui, pendant les 12 mois de suivi il suffit de nous envoyer vos modifications.')],
         related=['seo-local', 'design-sur-mesure']),
    dict(slug='suivi-12-mois', num='06', nav='12 mois à vos côtés',
         title='12 mois de suivi inclus | Next Digital Level',
         desc='Après la mise en ligne, un interlocuteur reste disponible 7 jours sur 7 pour vos questions et vos ajustements. Inclus dans chaque site.',
         eyebrow='/ 12 mois à vos côtés', h1='Après la mise en ligne,<br><em>nous restons là.</em>',
         lead='Un site vit : un horaire change, une nouvelle prestation arrive, une photo doit être remplacée. Pendant douze mois, vous nous écrivez et nous nous en occupons. Un seul interlocuteur, 7 jours sur 7.',
         why=[('Un interlocuteur, pas un ticket', 'Vous écrivez à la personne qui a conçu votre site. Pas de plateforme, pas de file d’attente.'),
              ('Des ajustements sans stress', 'Textes, photos, horaires, nouvelle page ponctuelle : les modifications courantes sont comprises dans le suivi.'),
              ('Un site qui reste en forme', 'Nous surveillons la disponibilité, le certificat HTTPS et le bon fonctionnement des formulaires.')],
         steps=[('Prise en main', 'À la mise en ligne, nous vous montrons ce qu’il faut savoir : où sont vos accès, comment nous demander une modification.'),
                ('Demandes courantes', 'Vous nous écrivez par WhatsApp ou e-mail. Les petites modifications sont faites rapidement, souvent le jour même.'),
                ('Points réguliers', 'Nous regardons ensemble ce que fait votre site : visites, appels, fiche Google. Et ce que l’on peut améliorer.'),
                ('Et après 12 mois', 'Votre site reste à vous, sans obligation. Si vous souhaitez continuer l’accompagnement, nous vous proposons une formule simple.')],
         included=['Interlocuteur unique, 7 jours sur 7', 'Modifications courantes de contenus', 'Surveillance de la disponibilité et du HTTPS', 'Aide à la prise en main', 'Conseils Google Business Profile', 'Point sur les résultats'],
         faq=[('Qu’est-ce qui est compris dans le suivi ?', 'Les modifications courantes (textes, photos, horaires, coordonnées), les questions, la surveillance technique et les conseils. Le périmètre exact est défini ensemble avant le lancement.'),
              ('Et une refonte complète ou une nouvelle fonctionnalité ?', 'Ce sont des projets à part entière ; nous vous faisons une proposition claire, sans surprise.'),
              ('Que se passe-t-il à la fin des 12 mois ?', 'Rien n’est imposé. Votre site fonctionne, il vous appartient. Un accompagnement prolongé est possible si vous le souhaitez.'),
              ('Comment vous joindre ?', 'WhatsApp, téléphone ou e-mail, 7 jours sur 7. Vous avez toujours la même personne en face.')],
         related=['seo-local', 'contenu-redaction']),
]
BY_SLUG = {s['slug']: s for s in SERVICES}


def page(s):
    head = HEAD
    head = re.sub(r'<title>.*?</title>', '<title>' + html.escape(s['title']) + '</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://nextdigitalevel.com/%s.html">' % s['slug'], head)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + html.escape(s['title'].split(' | ')[0], quote=True) + '">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://nextdigitalevel.com/%s.html">' % s['slug'], head)
    head = re.sub(r'<meta name="twitter:title" content="[^"]*">', '<meta name="twitter:title" content="' + html.escape(s['title'].split(' | ')[0], quote=True) + '">', head)
    head = re.sub(r'<meta name="twitter:description" content="[^"]*">', '<meta name="twitter:description" content="' + html.escape(s['desc'], quote=True) + '">', head)
    cards = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span><h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b) for i, (t, b) in enumerate(s['why']))
    steps = ''.join('<article class="tl__item"><span class="eyebrow">%02d</span><h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b) for i, (t, b) in enumerate(s['steps']))
    incl = ''.join('<li><i></i><b>%s</b></li>' % t for t in s['included'])
    faq = ''.join('<details class="faq-detail"><summary>%s<span aria-hidden="true">+</span></summary><p class="t-body">%s</p></details>' % (q, a) for q, a in s['faq'])
    related = ''.join('<a href="/%s.html" data-cursor="view"><span><small>%s</small>%s</span><span aria-hidden="true">%s</span></a>' % (BY_SLUG[r]['slug'], BY_SLUG[r]['num'], BY_SLUG[r]['nav'], NE) for r in s['related'])
    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">{s['eyebrow']}</span><h1 class="t-display-xl hero__title">{s['h1']}</h1><p class="t-body-lg hero__lead">{s['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book.html">Demander mon aperçu gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
</div>
<p class="hero__note">Service {s['num']} · compris dans chaque site · sans frais récurrents</p>
</div>
</section>
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Ce que cela change pour vous</span><h2 class="t-display-lg" data-split="words">Concrètement.</h2>
</div>
<div class="grid grid--3 stagger">{cards}</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Comment nous procédons</span><h2 class="t-display-lg" data-split="words">Quatre temps,<br>toujours avec vous.</h2>
</div>
<div class="tl stagger">{steps}</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="included">
<div class="included__copy reveal">
<span class="eyebrow">/ Compris</span>
<h2 class="t-display-lg" data-split="words">Inclus d’office.<br><em>Rien à rajouter.</em></h2>
<p class="t-body-lg">Ce service fait partie de chaque site que nous livrons. Il n’est ni optionnel, ni facturé en plus.</p>
<a class="btn btn--ghost btn--lg" href="/websites.html">Voir l’offre complète{NE}</a>
</div>
<ul class="included__list included__list--simple stagger">{incl}</ul>
</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="faq-layout">
<div class="sec-head reveal">
<span class="eyebrow">/ Vos questions</span><h2 class="t-display-lg" data-split="words">Les réponses, simplement.</h2>
<p class="t-body faq-aside">Une autre question ? L’assistant en bas de page répond immédiatement, ou écrivez-nous sur WhatsApp.</p>
</div>
<div class="faq reveal">{faq}</div>
</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Aller plus loin</span><h2 class="t-display-lg" data-split="words">Les autres services.</h2>
</div>
<div class="sector-links reveal">{related}<a href="/websites.html" data-cursor="view"><span><small>Tout</small>L’offre complète</span><span aria-hidden="true">{NE}</span></a></div>
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
    return head + main + FOOT


for s in SERVICES:
    (ROOT / (s['slug'] + '.html')).write_text(page(s))
    print('wrote', s['slug'] + '.html')
