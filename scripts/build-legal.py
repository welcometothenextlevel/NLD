"""Generate the privacy policy page from the shared chrome of websites.html.

Run `python3 scripts/build-legal.py` after editing the text below; the head,
header, drawer and footer are copied from websites.html so they stay in sync
with the rest of the site (same convention as build-services.py).

French typography: a non-breaking space precedes ':' and ';'.
"""
from pathlib import Path
import html, json, re

ROOT = Path(__file__).resolve().parent.parent
BASE = (ROOT / 'websites.html').read_text()
HEAD = BASE[:BASE.index('<main id="main">') + len('<main id="main">')]
FOOT = BASE[BASE.index('</main>'):]

SLUG = 'confidentialite'
TITLE = 'Politique de confidentialité · Next Digital Level'
DESC = ('Politique de confidentialité de Next Digital Level : quelles données nous collectons, '
        'pourquoi, avec qui elles sont partagées, combien de temps nous les conservons et comment '
        'exercer vos droits selon la LPD.')
UPDATED = '29 septembre 2026'

MAIL = '<a href="mailto:contact@nextdigitalevel.com">contact@nextdigitalevel.com</a>'
TEL = '<a href="tel:+41762632817">+41 76 263 28 17</a>'
EDOEB = '<a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener">www.edoeb.admin.ch</a>'

# Each section: (heading, body html). NB: &nbsp; before ':' and ';'.
SECTIONS = [
    ('Responsable du traitement',
     '<p class="t-body">Next Digital Level, Amin Hamdi<br>'
     'Rue de la Mouline 2, 1022 Chavannes-près-Renens, Suisse<br>'
     f'E-mail&nbsp;: {MAIL}<br>'
     f'Téléphone&nbsp;: {TEL}</p>'),

    ('Données que nous collectons',
     '<ul class="legal__list">'
     '<li>Lorsque vous remplissez un formulaire sur Facebook ou Instagram&nbsp;: votre nom, votre '
     'numéro de téléphone, votre adresse e-mail (facultative), la localité de votre entreprise et '
     'vos réponses aux questions du formulaire.</li>'
     '<li>Lorsque vous nous contactez par téléphone, WhatsApp, e-mail ou via ce site&nbsp;: les '
     'informations que vous nous transmettez.</li>'
     '<li>Lorsque vous visitez ce site&nbsp;: des données techniques (adresse IP, type de '
     'navigateur, pages consultées) traitées par notre hébergeur pour assurer le fonctionnement et '
     'la sécurité du site.</li>'
     '</ul>'),

    ('Pourquoi nous utilisons vos données',
     '<p class="t-body">Nous utilisons vos données uniquement pour&nbsp;:</p>'
     '<ul class="legal__list">'
     '<li>vous rappeler et répondre à votre demande&nbsp;;</li>'
     '<li>préparer une proposition de site internet et organiser un rendez-vous&nbsp;;</li>'
     '<li>établir un devis, une facture et réaliser le mandat&nbsp;;</li>'
     '<li>respecter nos obligations légales.</li>'
     '</ul>'
     '<p class="t-body">Nous ne vendons jamais vos données et ne les utilisons pas à d’autres '
     'fins.</p>'),

    ('Partage des données',
     '<p class="t-body">Vos données sont partagées uniquement avec les prestataires nécessaires à '
     'notre activité&nbsp;: Meta Platforms (formulaires Facebook et Instagram), GitHub '
     '(hébergement du site), Google Fonts (les polices de caractères de ce site sont chargées '
     'depuis les serveurs de Google, qui reçoit de ce fait votre adresse IP), ainsi que nos outils '
     'de communication (téléphone, WhatsApp, e-mail).</p>'
     '<p class="t-body">Dans la section «&nbsp;Réalisations&nbsp;», un aperçu du site d’un client '
     'peut être affiché dans un cadre intégré. Cet aperçu n’est chargé que si vous cliquez '
     'vous-même sur «&nbsp;Aperçu en direct&nbsp;»&nbsp;; le site concerné reçoit alors votre '
     'adresse IP, comme si vous l’aviez ouvert directement.</p>'
     '<p class="t-body">Certains de ces prestataires peuvent traiter des données en dehors de la '
     'Suisse, notamment aux États-Unis. Dans ce cas, le transfert repose sur des garanties '
     'appropriées, comme les clauses contractuelles types reconnues par le Préposé fédéral à la '
     'protection des données et à la transparence (PFPDT), ou sur le Swiss-US Data Privacy '
     'Framework lorsque le prestataire y est certifié.</p>'),

    ('Durée de conservation',
     '<ul class="legal__list">'
     '<li>Demandes sans suite&nbsp;: vos données sont supprimées au plus tard 12 mois après notre '
     'dernier échange.</li>'
     '<li>Clients&nbsp;: vos données sont conservées pendant la durée du mandat, et les documents '
     'comptables pendant 10 ans, comme l’exige la loi.</li>'
     '</ul>'),

    ('Vos droits',
     '<p class="t-body">Conformément à la loi fédérale sur la protection des données (LPD), vous '
     'pouvez à tout moment demander l’accès à vos données, leur rectification ou leur suppression, '
     'vous opposer à leur traitement ou retirer votre consentement. Il vous suffit d’écrire à '
     f'{MAIL}. Nous vous répondons dans un délai de 30 jours.</p>'
     f'<p class="t-body">Vous avez également le droit de déposer une plainte auprès du '
     f'PFPDT&nbsp;: {EDOEB}</p>'),

    ('Cookies',
     '<p class="t-body">Ce site n’utilise ni cookies publicitaires ni outils de suivi. Aucun '
     'cookie n’est déposé, et aucune statistique de fréquentation n’est collectée.</p>'
     '<p class="t-body">Votre navigateur conserve uniquement trois préférences techniques, stockées '
     'sur votre appareil et jamais transmises&nbsp;: le thème clair ou sombre, la langue choisie et, '
     'le temps de votre visite, la conversation avec l’assistant. Cet assistant fonctionne '
     'entièrement dans votre navigateur&nbsp;: vos messages ne sont envoyés à aucun serveur.</p>'),

    ('Modifications',
     '<p class="t-body">Nous pouvons mettre à jour cette politique. La date indiquée en haut de '
     'cette page correspond à la dernière version.</p>'),
]


def build():
    head = HEAD
    head = re.sub(r'<title>.*?</title>', '<title>' + html.escape(TITLE) + '</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">',
                  '<meta name="description" content="' + html.escape(DESC, quote=True) + '">', head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">',
                  '<link rel="canonical" href="https://nextdigitalevel.com/%s">' % SLUG, head)
    short = html.escape(TITLE.split(' · ')[0], quote=True)
    for prop in ('og:title', 'twitter:title'):
        attr = 'property' if prop.startswith('og') else 'name'
        head = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, prop),
                      '<meta %s="%s" content="%s">' % (attr, prop, short), head)
    for prop in ('og:description', 'twitter:description'):
        attr = 'property' if prop.startswith('og') else 'name'
        head = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, prop),
                      '<meta %s="%s" content="%s">' % (attr, prop, html.escape(DESC, quote=True)), head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">',
                  '<meta property="og:url" content="https://nextdigitalevel.com/%s">' % SLUG, head)
    # A legal notice should not compete with the marketing pages in search.
    head = head.replace('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
                        '<meta name="robots" content="index, follow, max-image-preview:none">')
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Politique de confidentialité",
         "item": "https://nextdigitalevel.com/%s" % SLUG}]}
    head = head.replace('</head>', '<script type="application/ld+json">\n%s\n</script>\n</head>'
                        % json.dumps(crumbs, ensure_ascii=False, indent=1))

    body = ''.join(
        f'<section class="legal__section">\n<h2 class="t-display-sm legal__h2">'
        f'<span class="legal__num" aria-hidden="true">{i}.</span>{heading}</h2>\n{content}\n</section>\n'
        for i, (heading, content) in enumerate(SECTIONS, 1))

    main = f'''
<section class="legal">
<div class="container legal__inner">
<header class="legal__head">
<span class="eyebrow">/ Informations légales</span>
<h1 class="t-display-lg legal__title">Politique de confidentialité</h1>
<p class="legal__updated">Dernière mise à jour&nbsp;: {UPDATED}</p>
</header>
<div class="legal__body">
{body}</div>
</div>
</section>
'''
    (ROOT / (SLUG + '.html')).write_text(head + main + FOOT)
    print('wrote', SLUG + '.html')


if __name__ == '__main__':
    build()
