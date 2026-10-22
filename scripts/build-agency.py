"""Performance-marketing landing pages: one per canton (main city) plus the
Suisse romande hub. They target "agence marketing <ville>", "agence Google Ads
<ville>", "génération de leads <ville>" and link down to the website pages
(creation-site-internet-*), which stay as the "site inclus" detail.

Run `python3 scripts/build-agency.py` after editing PAGES. Chrome (head,
header, footer) comes from websites.html; JSON-LD, reviews and the offer
blocks are filled by scripts/reviews.py, which this script runs at the end.
"""
from pathlib import Path
import html, re

ROOT = Path(__file__).resolve().parent.parent
BASE = (ROOT / 'websites.html').read_text()
HEAD = BASE[:BASE.index('<main id="main">') + len('<main id="main">')]
FOOT = BASE[BASE.index('</main>'):]
NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

GUARANTEE = ('Un volume d’appels, de demandes de devis ou de réservations garanti chaque mois, '
             'fixé avec vous après l’audit gratuit, si votre entreprise est éligible.')

PAGES = [
    dict(slug='agence-marketing-geneve', place='Genève', short='Genève', code='GE', site='creation-site-internet-geneve', img='geneve',
         title='Agence marketing à Genève : appels et devis garantis | Next Digital Level',
         desc='Agence marketing de performance à Genève : Google Ads, SEO local, recherche ChatGPT et Meta. Un volume d’appels et de devis garanti chaque mois. Audit gratuit.',
         h1='Agence marketing<br><em>à Genève.</em>',
         lead='Cliniques privées, régies, fiduciaires, entreprises du bâtiment, hôtellerie : à Genève, la concurrence en ligne est forte et chaque clic coûte cher. Nous transformons ce budget en appels et en demandes de devis, et nous garantissons le volume chaque mois.',
         sectors=[('Santé et cliniques privées', 'Consultations, bilans, interventions : des patients qui cherchent un spécialiste à Genève et réservent en ligne, sans plateforme intermédiaire.'),
                  ('Immobilier et régies', 'Mandats de vente, gérance, estimations : des propriétaires qualifiés de la rive gauche à la rive droite, pas des curieux.'),
                  ('Bâtiment et rénovation', 'Rénovations d’appartements, façades, installations techniques : des demandes de devis de clients particuliers et professionnels.')],
         local='Genève est un marché bilingue et international : une partie des recherches se fait en anglais, et les clients comparent vite. Nous travaillons les requêtes qui convertissent dans chaque commune — Carouge, Lancy, Vernier, Meyrin, Cologny, Chêne-Bougeries — et nous excluons le trafic qui coûte sans rapporter.',
         towns='Genève, Carouge, Lancy, Vernier, Meyrin, Onex, Thônex, Chêne-Bougeries, Cologny, Versoix, Plan-les-Ouates',
         faq=[('Les campagnes peuvent-elles être en anglais à Genève ?', 'Oui. Selon votre clientèle, nous menons des campagnes et des pages en français et en anglais, avec un suivi séparé des demandes.'),
              ('Le coût d’une campagne est-il plus élevé à Genève ?', 'La concurrence y est plus forte qu’ailleurs en Suisse romande. C’est pour cela que l’audit fixe le bon canal et le bon budget avant de commencer, budget publicitaire compris dans le prix sur Google Ads et Meta.'),
              ('Travaillez-vous aussi avec les entreprises de la région genevoise française ?', 'Notre service est pensé pour les entreprises établies en Suisse romande. Si vos clients viennent aussi de France voisine, nous l’intégrons au ciblage.')]),
    dict(slug='agence-marketing-lausanne', place='Lausanne et le canton de Vaud', short='Lausanne', code='VD', site='creation-site-internet-lausanne', img='port',
         title='Agence marketing à Lausanne et dans le canton de Vaud | Next Digital Level',
         desc='Agence marketing de performance à Lausanne : appels, devis et réservations garantis chaque mois pour les entreprises vaudoises. Google Ads, SEO, Meta. Audit gratuit.',
         h1='Agence marketing<br><em>à Lausanne et dans le canton de Vaud.</em>',
         lead='De Lausanne à la Riviera, de Morges à Yverdon, les entreprises vaudoises qui réussissent ne dépendent plus seulement du bouche-à-oreille. Nous leur amenons un flux régulier d’appels et de demandes, et nous garantissons le volume chaque mois.',
         sectors=[('Construction, rénovation et génie civil', 'Entreprises générales, sanitaire, chauffage, menuiserie : des demandes de devis pour des chantiers à Lausanne, dans l’Ouest lausannois et sur La Côte.'),
                  ('Immobilier, régies et promotion', 'Estimations, mandats, ventes sur plan : des propriétaires et des acheteurs qualifiés dans tout le canton.'),
                  ('Santé, hôtellerie et services', 'Cliniques, cabinets, hôtels de la Riviera, entreprises de services : des réservations et des rendez-vous qui remplissent l’agenda.')],
         local='Le canton de Vaud est vaste et les recherches sont très locales : « entreprise de rénovation Morges », « régie Vevey », « clinique Lausanne ». Nous construisons des campagnes et des pages par zone réellement servie, avec un suivi des appels par commune, pour investir là où la demande existe.',
         towns='Lausanne, Renens, Pully, Prilly, Morges, Nyon, Vevey, Montreux, Yverdon-les-Bains, Aigle, Gland',
         faq=[('Êtes-vous basés dans le canton de Vaud ?', 'Oui. Next Digital Level est une entreprise suisse établie à Chavannes-près-Renens, dans l’Ouest lausannois. Nous rencontrons volontiers nos clients vaudois sur place.'),
              ('Couvrez-vous tout le canton ?', 'Oui : Lausanne, La Côte, la Riviera, le Nord vaudois et le Chablais vaudois. Le ciblage suit les communes que vous servez réellement.'),
              ('Que se passe-t-il si mon entreprise n’est pas éligible ?', 'Nous vous le disons à l’issue de l’audit gratuit, avec les raisons et ce qu’il faudrait changer. Vous repartez avec un plan clair, sans engagement.')]),
    dict(slug='agence-marketing-fribourg', place='Fribourg', short='Fribourg', code='FR', site='creation-site-internet-fribourg', img='chantier',
         title='Agence marketing à Fribourg : appels et devis garantis | Next Digital Level',
         desc='Agence marketing de performance à Fribourg et en Gruyère : campagnes bilingues, appels et demandes de devis garantis chaque mois. Audit gratuit, sans engagement.',
         h1='Agence marketing<br><em>à Fribourg.</em>',
         lead='Canton bilingue, forte croissance, tissu industriel et artisanal solide : Fribourg demande des campagnes qui parlent aux deux communautés. Nous amenons aux entreprises fribourgeoises des appels et des demandes réguliers, avec un volume garanti chaque mois.',
         sectors=[('Construction et industrie', 'Entreprises générales, constructeurs bois, ateliers industriels : des demandes de devis de Fribourg à Bulle, de Morat à Romont.'),
                  ('Immobilier et promotion', 'Nouvelles promotions, mandats de vente, gérance : des acheteurs qualifiés dans un canton qui se construit vite.'),
                  ('Santé et services', 'Cabinets, centres de santé, services aux entreprises : des rendez-vous réservés en ligne, en français comme en allemand.')],
         local='À Fribourg, une partie de vos clients cherche en allemand. Nous menons les campagnes dans les deux langues quand c’est utile et nous suivons les demandes par langue et par district : Sarine, Gruyère, Lac, Singine, Broye, Glâne, Veveyse.',
         towns='Fribourg, Villars-sur-Glâne, Marly, Bulle, Morat, Romont, Estavayer, Düdingen, Châtel-Saint-Denis',
         faq=[('Faites-vous des campagnes en allemand ?', 'Oui, lorsque votre clientèle l’exige. Les annonces et la page sont alors préparées dans les deux langues, avec un suivi séparé.'),
              ('Travaillez-vous en Gruyère ?', 'Oui, dans tout le canton de Fribourg. Le ciblage suit les communes et les districts que vous servez.'),
              ('Combien de temps avant les premières demandes ?', 'Sur Google Ads, souvent dès les premiers jours ; le volume se stabilise en quelques semaines. Le volume garanti est fixé avec vous après l’audit.')]),
    dict(slug='agence-marketing-neuchatel', place='Neuchâtel', short='Neuchâtel', code='NE', site='creation-site-internet-neuchatel', img='industrie',
         title='Agence marketing à Neuchâtel : appels et devis garantis | Next Digital Level',
         desc='Agence marketing de performance à Neuchâtel et La Chaux-de-Fonds : Google Ads, SEO local et Meta, avec un volume d’appels et de devis garanti chaque mois.',
         h1='Agence marketing<br><em>à Neuchâtel.</em>',
         lead='Horlogerie, microtechnique, santé, construction : les entreprises neuchâteloises ont une culture de la précision. Nous appliquons la même exigence à leur acquisition de clients, avec un volume d’appels et de demandes garanti chaque mois.',
         sectors=[('Industrie et sous-traitance', 'Ateliers de précision, sous-traitants horlogers, mécanique : des demandes qualifiées de donneurs d’ordre, pas des prospects au hasard.'),
                  ('Construction et rénovation', 'Du Littoral aux Montagnes : des demandes de devis pour des chantiers à Neuchâtel, Boudry, La Chaux-de-Fonds et au Locle.'),
                  ('Santé et services', 'Cabinets, cliniques, fiduciaires : des rendez-vous et des mandats réservés en ligne.')],
         local='Le canton se partage entre le Littoral et les Montagnes, deux bassins aux recherches différentes. Nous construisons les campagnes par bassin, avec un suivi des appels et des demandes pour chacun, afin d’investir là où vos clients se trouvent.',
         towns='Neuchâtel, La Chaux-de-Fonds, Le Locle, Boudry, Peseux, Marin-Epagnier, Val-de-Ruz, Val-de-Travers',
         faq=[('Travaillez-vous avec les entreprises industrielles ?', 'Oui. Pour l’industrie, nous ciblons des recherches professionnelles précises et des pages qui parlent aux acheteurs, avec un suivi des demandes de devis.'),
              ('Couvrez-vous La Chaux-de-Fonds et Le Locle ?', 'Oui, tout le canton de Neuchâtel. Les Montagnes neuchâteloises ont leur propre ciblage.'),
              ('Le volume est-il vraiment garanti ?', 'Oui, pour les entreprises éligibles : nous fixons ensemble un volume mensuel après l’audit gratuit, selon votre métier, votre zone et votre capacité.')]),
    dict(slug='agence-marketing-valais', place='Valais', short='Sion', code='VS', site='creation-site-internet-valais', img='residence',
         title='Agence marketing en Valais : appels et réservations garantis | Next Digital Level',
         desc='Agence marketing de performance en Valais : Sion, Martigny, Sierre, stations. Appels, devis et réservations garantis chaque mois. Google Ads, SEO, Meta.',
         h1='Agence marketing<br><em>en Valais.</em>',
         lead='Tourisme, hôtellerie, immobilier de montagne, construction, caves : le Valais vit au rythme des saisons. Nous amenons aux entreprises valaisannes des réservations et des demandes régulières, et nous garantissons le volume chaque mois.',
         sectors=[('Hôtellerie et tourisme', 'Hôtels, chalets, activités : des réservations directes, sans commission de plateforme, avant et pendant la saison.'),
                  ('Immobilier de montagne et promotion', 'Résidences secondaires, promotions, gérance : des acheteurs suisses et étrangers qualifiés.'),
                  ('Construction et artisanat', 'Entreprises du bâtiment, menuiserie, rénovation de chalets : des demandes de devis à Sion, Martigny, Sierre et dans les stations.')],
         local='En Valais, la demande change avec la saison et une partie des clients cherche depuis l’extérieur du canton, en allemand ou en anglais. Nous ajustons les campagnes à la saison et aux marchés d’origine, et nous suivons chaque réservation jusqu’à sa source.',
         towns='Sion, Martigny, Sierre, Monthey, Conthey, Crans-Montana, Verbier, Nendaz, Champéry',
         faq=[('Gérez-vous la saisonnalité ?', 'Oui. Budget, annonces et pages suivent la saison ; le volume garanti est fixé en tenant compte de vos pics et de vos creux.'),
              ('Pouvez-vous cibler des clients hors du Valais ?', 'Oui. Pour le tourisme et l’immobilier, nous ciblons aussi la Suisse alémanique et l’étranger, selon votre clientèle.'),
              ('Travaillez-vous dans les stations ?', 'Oui : Crans-Montana, Verbier, Nendaz, Champéry et les autres stations du Valais romand.')]),
    dict(slug='agence-marketing-jura', place='Jura', short='Delémont', code='JU', site='creation-site-internet-jura', img='verre',
         title='Agence marketing dans le Jura : appels et devis garantis | Next Digital Level',
         desc='Agence marketing de performance dans le Jura et le Jura bernois : Delémont, Porrentruy, Moutier. Volume d’appels et de devis garanti chaque mois. Audit gratuit.',
         h1='Agence marketing<br><em>dans le Jura.</em>',
         lead='Microtechnique, industrie, construction, santé : les entreprises jurassiennes ont du savoir-faire et peu de visibilité en ligne. Nous leur amenons des appels et des demandes réguliers, avec un volume garanti chaque mois.',
         sectors=[('Industrie et microtechnique', 'Sous-traitance, usinage, assemblage : des demandes de donneurs d’ordre en Suisse et au-delà.'),
                  ('Construction et rénovation', 'Entreprises du bâtiment, menuiserie, énergie : des demandes de devis de Delémont à Porrentruy.'),
                  ('Santé et services', 'Cabinets, centres de santé, fiduciaires : des rendez-vous réservés en ligne.')],
         local='Dans le Jura, la concurrence en ligne est encore faible : c’est une opportunité. Une entreprise bien présente sur Google, sur Google Maps et dans les réponses de ChatGPT y prend rapidement l’avantage sur ses concurrents.',
         towns='Delémont, Porrentruy, Saignelégier, Bassecourt, Courrendlin, Moutier, Tavannes, Saint-Imier',
         faq=[('Couvrez-vous aussi le Jura bernois ?', 'Oui : Moutier, Tavannes, Saint-Imier et l’ensemble du Jura bernois francophone.'),
              ('Le Jura est-il un bon marché pour la publicité en ligne ?', 'Souvent, oui : la concurrence y est plus faible qu’à Genève ou Lausanne, ce qui rend chaque demande moins chère. L’audit gratuit vous le chiffre.'),
              ('Faut-il un nouveau site ?', 'Pas forcément. Si votre site convertit déjà, nous le gardons ; sinon la page est construite par nous et comprise dans le prix.')]),
]
HUB = dict(slug='agence-marketing-suisse-romande', place='Suisse romande', short='Suisse romande', code='CH', site='creation-site-internet-suisse-romande', img='tours',
           title='Agence marketing de performance en Suisse romande | Next Digital Level',
           desc='Agence marketing de performance en Suisse romande : un volume d’appels, de devis et de réservations garanti chaque mois. Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura.',
           h1='Agence marketing de performance<br><em>en Suisse romande.</em>',
           lead='Next Digital Level est une entreprise suisse. Nous aidons les entreprises établies de Suisse romande à grandir avec un flux régulier d’appels, de demandes de devis et de réservations, et nous garantissons le volume chaque mois aux entreprises éligibles.',
           sectors=[('Construction et immobilier', 'Entreprises générales, rénovation, régies, promotion : des demandes de devis et des mandats qualifiés.'),
                    ('Santé, hôtellerie et services', 'Cliniques, cabinets, hôtels, fiduciaires : des rendez-vous et des réservations en direct.'),
                    ('Industrie et B2B', 'Sous-traitance, microtechnique, services aux entreprises : des demandes de donneurs d’ordre.')],
           local='Chaque canton a ses recherches, ses langues et ses saisons. Nous construisons les campagnes par zone réellement servie et nous suivons chaque appel et chaque demande jusqu’à sa source, de Genève au Jura.',
           towns='Genève, Lausanne, Fribourg, Neuchâtel, Sion, Delémont et toutes les communes de Suisse romande',
           faq=[('Que garantissez-vous exactement ?', 'Un nombre fixe d’appels, de demandes de devis ou de réservations chaque mois. Nous le définissons avec vous après l’audit gratuit, selon votre métier, votre zone et votre capacité, pour les entreprises éligibles.'),
                ('Qu’est-ce qu’une agence marketing de performance ?', 'Une agence payée pour des résultats mesurables plutôt que pour de la visibilité : des appels, des demandes et des réservations. Chaque franc dépensé est rattaché aux demandes qu’il a produites.'),
                ('Quels canaux utilisez-vous ?', 'Google Ads, le référencement local et Google Maps, la recherche ChatGPT et la publicité Meta. Chaque canal est un service à part ; l’audit choisit celui qui vous rapportera le plus.')])
ALL = [HUB] + PAGES


def chrome(pg):
    head = HEAD
    head = re.sub(r'<title>.*?</title>', '<title>' + html.escape(pg['title']) + '</title>', head)
    short = html.escape(pg['title'].split(' | ')[0], quote=True)
    desc = html.escape(pg['desc'], quote=True)
    for pat, val in [(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">'),
                     (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="https://nextdigitalevel.com/{pg["slug"]}">'),
                     (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{short}">'),
                     (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">'),
                     (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="https://nextdigitalevel.com/{pg["slug"]}">'),
                     (r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{short}">'),
                     (r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{desc}">')]:
        head = re.sub(pat, val, head)
    return head


def page(pg):
    hub = pg is HUB
    cards = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span><h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b) for i, (t, b) in enumerate(pg['sectors']))
    faq = ''.join('<details class="faq-detail"><summary>%s<span aria-hidden="true">+</span></summary><p class="t-body">%s</p></details>' % (q, a) for q, a in pg['faq'])
    if hub:
        others = ''.join(f'<a href="/{o["slug"]}" data-cursor="view"><span><small>{o["code"]}</small>{o["place"]}</span><span aria-hidden="true">{NE}</span></a>' for o in PAGES)
        others_title = 'Votre canton.'
    else:
        others = ''.join(f'<a href="/{o["slug"]}" data-cursor="view"><span><small>{o["code"]}</small>{o["place"]}</span><span aria-hidden="true">{NE}</span></a>' for o in PAGES if o is not pg)
        others += f'<a href="/{HUB["slug"]}" data-cursor="view"><span><small>CH</small>Toute la Suisse romande</span><span aria-hidden="true">{NE}</span></a>'
        others_title = 'Ailleurs en Suisse romande.'
    crumbs_mid = '' if hub else f'''{{"@type": "ListItem", "position": 2, "name": "Suisse romande", "item": "https://nextdigitalevel.com/{HUB['slug']}"}},'''
    crumb_pos = 2 if hub else 3
    crumbs = f'''<script type="application/ld+json">{{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{{"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"}}, {crumbs_mid}{{"@type": "ListItem", "position": {crumb_pos}, "name": "{html.escape(pg['short'])}", "item": "https://nextdigitalevel.com/{pg['slug']}"}}]}}</script>\n'''
    main = f'''
<section class="hero inner-hero agency-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ Agence marketing de performance · {pg['place']}</span><h1 class="t-display-xl hero__title">{pg['h1']}</h1><p class="t-body-lg hero__lead">{pg['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book">Demander mon audit gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
</div>
<p class="hero__note">Entreprise suisse · sans intermédiaire · volume mensuel garanti · dès 1’200 CHF par mois · sans engagement</p>
</div>
</section>
<section class="section">
<div class="container">
<div class="included">
<div class="included__copy reveal">
<span class="eyebrow">/ Notre garantie</span>
<h2 class="t-display-lg" data-split="words">Un volume de demandes<br><em>garanti, chaque mois.</em></h2>
<p class="t-body-lg">{GUARANTEE}</p>
<a class="btn btn--ghost btn--lg" href="/websites">Voir l’offre complète{NE}</a>
</div>
<ul class="included__list included__list--simple stagger">
<li><i></i><b>Volume mensuel garanti</b><span>Appels, demandes de devis ou réservations</span></li>
<li><i></i><b>Demandes exclusives</b><span>Elles arrivent chez vous seul, jamais revendues</span></li>
<li><i></i><b>Le bon canal</b><span>Choisi par l’audit gratuit pour votre métier</span></li>
<li><i></i><b>Budget publicitaire inclus</b><span>Sur Google Ads et Meta, dans le prix mensuel</span></li>
<li><i></i><b>Rapport mensuel</b><span>Chaque appel rattaché à sa source</span></li>
<li><i></i><b>Sans engagement</b><span>Résiliable chaque mois</span></li>
</ul>
</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Pour qui à {pg['short']}</span><h2 class="t-display-lg" data-split="words">Les entreprises établies<br>de {pg['place']}.</h2>
<p class="t-body">Nous accompagnons les entreprises de {pg['towns']}.</p>
</div>
<div class="grid grid--3 stagger">{cards}</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="included">
<div class="included__copy reveal">
<span class="eyebrow">/ La demande locale</span>
<h2 class="t-display-lg" data-split="words">Là où vos clients<br><em>vous cherchent.</em></h2>
<p class="t-body-lg">{pg['local']}</p>
</div>
<div class="sector-links reveal">
<a href="/google-ads" data-cursor="view"><span><small>01</small>Google Ads</span><span aria-hidden="true">{NE}</span></a>
<a href="/seo-local" data-cursor="view"><span><small>02</small>Référencement local et Google Maps</span><span aria-hidden="true">{NE}</span></a>
<a href="/recherche-ia" data-cursor="view"><span><small>03</small>Recherche ChatGPT</span><span aria-hidden="true">{NE}</span></a>
<a href="/publicite-meta" data-cursor="view"><span><small>04</small>Publicité Meta</span><span aria-hidden="true">{NE}</span></a>
<a href="/{pg['site']}" data-cursor="view"><span><small>Site</small>Votre site à {pg['short']}, inclus</span><span aria-hidden="true">{NE}</span></a>
</div>
</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="faq-layout">
<div class="sec-head reveal">
<span class="eyebrow">/ Vos questions</span><h2 class="t-display-lg" data-split="words">Questions fréquentes<br>à {pg['short']}.</h2>
<p class="t-body faq-aside">Une autre question ? L’assistant en bas de page répond immédiatement, ou écrivez-nous sur WhatsApp.</p>
</div>
<div class="faq reveal">{faq}</div>
</div>
</div>
</section>
<!-- reviews:all --><!-- /reviews:all -->
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Suisse romande</span><h2 class="t-display-lg" data-split="words">{others_title}</h2>
</div>
<div class="sector-links reveal">{others}</div>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Des appels à {pg['short']}.<br><em>Commençons par l’audit.</em></h2><p class="t-body-lg">Parlez-nous de votre activité. Nous commençons par un audit gratuit de votre marché, sans engagement.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book">Demander mon audit gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    head = chrome(pg).replace('</head>', crumbs + '</head>')
    return head + main + FOOT


for pg in ALL:
    (ROOT / (pg['slug'] + '.html')).write_text(page(pg))
    print('wrote', pg['slug'])

import subprocess as _sp, sys as _sys
_sp.run([_sys.executable, str(ROOT / 'scripts' / 'reviews.py')], check=True)
