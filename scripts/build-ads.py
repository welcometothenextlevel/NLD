"""Generate the two advertising pages from the shared chrome of websites.html.

Run `python3 scripts/build-ads.py` after editing ADS.

These deliberately do NOT reuse build-services.py: that builder states the
service is "compris dans chaque site · sans frais récurrents", which is true of
the six craft services and false of advertising, where the ad budget is a
recurring cost paid to the platform. The distinction is made explicit on the
page rather than glossed over.
"""
from pathlib import Path
import html, json, re

ROOT = Path(__file__).resolve().parent.parent
BASE = (ROOT / 'websites.html').read_text()
HEAD = BASE[:BASE.index('<main id="main">') + len('<main id="main">')]
FOOT = BASE[BASE.index('</main>'):]
NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

TAGLINE = 'Des sites qui attirent des clients.<br><em>Construits pour les convertir.</em>'

# The positioning argument, shared by both pages: the same words the owner uses
# to separate the studio from agencies that stop at a good-looking site.
STANCE = [
    ('Un beau site ne suffit pas',
     'Un site peut être primé et ne rien rapporter. Le nôtre est jugé sur autre chose : est-ce qu’il amène des visiteurs, et est-ce qu’ils vous contactent ? C’est la seule question qui compte pour une PME.'),
    ('Conçu pour convertir, pas pour plaire',
     'Chaque page a un objectif : un appel, un message, une demande de devis. Les boutons, les preuves et les informations sont placés là où votre client les attend, pas là où c’est joli.'),
    ('La publicité en plus, quand elle sert',
     'Beaucoup d’agences livrent un site et s’arrêtent là. Nous savons aussi aller chercher le trafic : campagnes Meta et Google Ads, gérées par la personne qui a construit votre site.'),
]

ADS = [
    dict(slug='publicite-meta', nav='Publicité Meta', other='google-ads',
         logo='/assets/partners/meta.svg', logo_alt='Logo Meta', logo_w=300, logo_h=191,
         badge='Meta Business Partner',
         title='Publicité Facebook et Instagram en Suisse romande | Next Digital Level',
         desc='Campagnes Meta Ads gérées par un Meta Business Partner suisse : audiences locales, formulaires de contact et suivi des demandes. Pour les PME de Suisse romande.',
         eyebrow='/ Publicité Meta',
         h1='Publicité Facebook<br>et Instagram.<br><em>Pour des demandes, pas des likes.</em>',
         lead='Vos clients passent déjà du temps sur Facebook et Instagram. La question n’est pas d’y être présent, mais d’y apparaître devant les bonnes personnes, dans votre région, avec un message qui donne envie de vous écrire. C’est exactement ce que nous paramétrons.',
         intro_badge='Nous sommes Meta Business Partner : le programme partenaire officiel de Meta. Concrètement, nous travaillons avec les outils publicitaires de Facebook et Instagram au quotidien, pas une fois par an.',
         why=[('Une audience vraiment locale',
               'Nous ciblons par commune, par rayon autour de votre atelier ou de votre salon, par âge et par centres d’intérêt. Une campagne pour un salon de Nyon ne doit pas être vue à Zurich.'),
              ('Des formulaires qui remplissent votre agenda',
               'Les formulaires Meta s’ouvrent dans l’application, pré-remplis avec le nom et le numéro. Le prospect n’a presque rien à taper, ce qui multiplie les demandes reçues.'),
              ('Des chiffres que vous comprenez',
               'Pas de tableau de bord illisible : combien de personnes touchées, combien de demandes, et ce que chaque demande vous a coûté. En français, dans un message clair.')],
         steps=[('On définit l’objectif',
                 'Des appels ? Des demandes de devis ? Des réservations ? L’objectif détermine le format des annonces et la façon de mesurer. Nous le fixons avant de dépenser le moindre franc.'),
                ('On prépare les annonces',
                 'Visuels à partir de vos photos, textes courts et honnêtes, plusieurs variantes pour comparer. Vous validez tout avant la mise en ligne.'),
                ('On lance et on teste',
                 'Les premiers jours servent à apprendre : quelles audiences réagissent, quel visuel fonctionne. Nous coupons ce qui ne marche pas plutôt que de laisser tourner.'),
                ('On optimise et on vous rend compte',
                 'Ajustements réguliers et un point clair sur les résultats. Vous savez ce que la campagne a rapporté, pas seulement ce qu’elle a coûté.')],
         included=['Création du compte publicitaire à votre nom',
                   'Paramétrage du pixel et du suivi des demandes',
                   'Visuels et textes des annonces',
                   'Ciblage par commune et par centres d’intérêt',
                   'Formulaires de contact Meta',
                   'Suivi, optimisation et point sur les résultats'],
         faq=[('Le budget publicitaire est-il compris ?',
               'Non, et c’est important de le distinguer. La création de votre site est sans frais récurrents. Une campagne, elle, a un budget versé directement à Meta, que vous fixez et que vous pouvez arrêter quand vous voulez. Notre travail de gestion est séparé et annoncé à l’avance.'),
              ('À qui appartient le compte publicitaire ?',
               'À vous. Nous le créons à votre nom et vous en gardez l’accès complet. Si vous arrêtez de travailler avec nous, vous partez avec votre compte, son historique et ses audiences.'),
              ('Faut-il déjà avoir un site ?',
               'C’est fortement recommandé. Envoyer de la publicité vers une page qui ne convainc pas revient à payer pour des visiteurs qui repartent. C’est précisément pour cela que nous construisons d’abord des sites faits pour convertir.'),
              ('En combien de temps voit-on des résultats ?',
               'Les premières demandes arrivent souvent dans les premiers jours, mais il faut compter quelques semaines pour que la campagne se stabilise. Personne ne peut garantir un volume précis, et nous ne le ferons pas.')]),

    dict(slug='google-ads', nav='Google Ads', other='publicite-meta',
         logo='/assets/partners/google-ads.svg', logo_alt='Logo Google Ads', logo_w=256, logo_h=230,
         badge='Partenaire certifié Google Ads',
         badge_img=('/assets/partners/google-ads-certified-partner', 570, 200),
         title='Partenaire certifié Google Ads en Suisse romande | Next Digital Level',
         desc='Partenaire certifié Google Ads : campagnes de recherche locale pour les PME romandes, budget maîtrisé, compte à votre nom. Genève, Lausanne, Valais, Fribourg.',
         eyebrow='/ Google Ads',
         h1='Google Ads.<br><em>Être là quand on vous cherche.</em>',
         lead='Quelqu’un tape « plombier Fribourg » ou « institut de beauté Nyon » à l’instant même. Il a un besoin, tout de suite, et il appellera l’un des premiers résultats. Google Ads vous place là, en attendant que votre référencement naturel prenne le relais.',
         intro_badge='Nous sommes partenaire certifié Google Ads. Nous gérons des campagnes pour des PME romandes : recherche locale, budget serré, résultats mesurés. Pas de dépense à l’aveugle, pas de jargon dans les rapports.',
         why=[('Des clients qui cherchent déjà',
               'La différence avec les réseaux sociaux est fondamentale : ici, la personne exprime un besoin en le tapant. L’intention est là, il ne reste qu’à être visible au bon moment.'),
              ('Une zone que vous choisissez',
               'Vos annonces s’affichent dans un rayon autour de vous, ou sur les communes que vous servez réellement. Vous ne payez pas pour des clics venus de l’autre bout du pays.'),
              ('Un budget que vous maîtrisez',
               'Vous fixez un plafond quotidien, vous le changez quand vous voulez, vous coupez quand votre carnet est plein. Rien ne tourne sans que vous le sachiez.')],
         steps=[('On cherche les vrais mots',
                 'Ce que vos clients tapent n’est pas ce que vous diriez de votre métier. Nous partons de leurs mots, avec les villes que vous servez, et nous écartons les requêtes qui vous feraient perdre de l’argent.'),
                ('On écrit les annonces et on prépare la page',
                 'Une annonce efficace envoie vers une page qui tient sa promesse. Nous vérifions que la page d’arrivée répond exactement à la recherche, sinon nous la construisons.'),
                ('On lance en surveillant',
                 'Les premiers jours servent à exclure les recherches inutiles et à voir quelles annonces déclenchent des appels. C’est là que se joue la rentabilité.'),
                ('On ajuste et on rend compte',
                 'Optimisation régulière des mots-clés, des annonces et du budget, avec un point clair sur ce que la campagne a rapporté.')],
         included=['Création du compte Google Ads à votre nom',
                   'Recherche de mots-clés et de zone géographique',
                   'Rédaction des annonces et des extensions',
                   'Exclusion des requêtes non pertinentes',
                   'Suivi des appels et des demandes',
                   'Optimisation et point sur les résultats'],
         faq=[('Google Ads ou référencement naturel ?',
               'Les deux, à des moments différents. Le référencement naturel est plus durable mais met des mois à s’installer ; Google Ads donne de la visibilité immédiatement. Beaucoup de nos clients démarrent avec Ads, puis réduisent quand le naturel prend le relais.'),
              ('Le budget publicitaire est-il compris ?',
               'Non. La création de votre site est sans frais récurrents ; le budget Ads, lui, est versé directement à Google, fixé par vous et interrompable à tout moment. Notre travail de gestion est distinct et annoncé à l’avance.'),
              ('À qui appartient le compte ?',
               'À vous. Il est créé à votre nom, vous en gardez l’accès et tout l’historique, même si nous cessons de travailler ensemble.'),
              ('Pouvez-vous garantir la première place ?',
               'Personne ne le peut honnêtement. La position dépend de votre enchère, de la qualité de l’annonce et de la page d’arrivée. Nous travaillons ces deux derniers points, qui sont ceux que l’on maîtrise.')]),
]
BY_SLUG = {a['slug']: a for a in ADS}


def badge_visual(a):
    """An official partner badge is shown unaltered on a white plate (its own
    background); a plain platform mark is shown at icon size."""
    if a.get('badge_img'):
        base, w, h = a['badge_img']
        return ('<span class="badge-plate"><picture><source srcset="%s.webp" type="image/webp">'
                '<img class="badge-plate__img" src="%s.png" width="%d" height="%d" alt="Badge %s" decoding="async">'
                '</picture></span>') % (base, base, w, h, 'Google Ads Certified Partner')
    return '<img class="adbadge__logo" src="%s" width="%d" height="%d" alt="%s" decoding="async">' % (
        a['logo'], a['logo_w'], a['logo_h'], a['logo_alt'])


def page(a):
    other = BY_SLUG[a['other']]
    short = html.escape(a['title'].split(' | ')[0], quote=True)
    head = HEAD
    head = re.sub(r'<title>.*?</title>', '<title>' + html.escape(a['title']) + '</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">',
                  '<meta name="description" content="' + html.escape(a['desc'], quote=True) + '">', head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">',
                  '<link rel="canonical" href="https://nextdigitalevel.com/%s">' % a['slug'], head)
    for prop, attr in (('og:title', 'property'), ('twitter:title', 'name')):
        head = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, prop),
                      '<meta %s="%s" content="%s">' % (attr, prop, short), head)
    for prop, attr in (('og:description', 'property'), ('twitter:description', 'name')):
        head = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, prop),
                      '<meta %s="%s" content="%s">' % (attr, prop, html.escape(a['desc'], quote=True)), head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">',
                  '<meta property="og:url" content="https://nextdigitalevel.com/%s">' % a['slug'], head)

    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": t}} for q, t in a['faq']]}
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://nextdigitalevel.com/"},
        {"@type": "ListItem", "position": 2, "name": "Visibilité & publicité", "item": "https://nextdigitalevel.com/advertising"},
        {"@type": "ListItem", "position": 3, "name": a['nav'], "item": "https://nextdigitalevel.com/%s" % a['slug']}]}
    service_ld = {"@context": "https://schema.org", "@type": "Service", "serviceType": a['nav'],
                  "name": short,
                  "provider": {"@type": "ProfessionalService", "@id": "https://nextdigitalevel.com/#organization",
                               "name": "Next Digital Level", "url": "https://nextdigitalevel.com/", "telephone": "+41762632817"},
                  "areaServed": {"@type": "AdministrativeArea", "name": "Suisse romande",
                                 "containedInPlace": {"@type": "Country", "name": "Switzerland"}},
                  "url": "https://nextdigitalevel.com/%s" % a['slug']}
    head = head.replace('</head>', ''.join('<script type="application/ld+json">%s</script>\n'
                                           % json.dumps(o, ensure_ascii=False, indent=1)
                                           for o in (faq_ld, crumbs, service_ld)) + '</head>')

    stance = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span>'
                     '<h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b)
                     for i, (t, b) in enumerate(STANCE))
    cards = ''.join('<article class="card card--spot" data-spot><span class="card__num">%02d</span>'
                    '<h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b)
                    for i, (t, b) in enumerate(a['why']))
    steps = ''.join('<article class="tl__item"><span class="eyebrow">%02d</span>'
                    '<h3 class="t-display-sm">%s</h3><p class="t-body">%s</p></article>' % (i + 1, t, b)
                    for i, (t, b) in enumerate(a['steps']))
    incl = ''.join('<li><i></i><b>%s</b></li>' % t for t in a['included'])
    faq = ''.join('<details class="faq-detail"><summary>%s<span aria-hidden="true">+</span></summary>'
                  '<p class="t-body">%s</p></details>' % (q, t) for q, t in a['faq'])

    main = f'''
<section class="hero inner-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">{a['eyebrow']}</span><h1 class="t-display-xl hero__title">{a['h1']}</h1>
<p class="t-body-lg hero__lead">{a['lead']}</p>
<div class="hero__actions">
<a class="btn btn--primary btn--lg" href="/book">Parler de mes campagnes{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
</div>
<div class="adbadge{' adbadge--plate' if a.get('badge_img') else ''}">
{badge_visual(a)}
<span><b>{a['badge']}</b>{a['intro_badge']}</span>
</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="tagline reveal">
<span class="eyebrow">/ Notre position</span>
<p class="t-display-lg tagline__line">{TAGLINE}</p>
<p class="t-body-lg tagline__sub">C’est la promesse de tout ce que nous construisons. Un site est un outil commercial avant d’être un objet de décoration — et quand il faut aller chercher le trafic, nous savons aussi le faire.</p>
</div>
<div class="grid grid--3 stagger">{stance}</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Ce que cela change pour vous</span><h2 class="t-display-lg" data-split="words">Concrètement.</h2>
</div>
<div class="grid grid--3 stagger">{cards}</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Comment nous procédons</span><h2 class="t-display-lg" data-split="words">Quatre temps,<br>toujours avec vous.</h2>
</div>
<div class="tl stagger">{steps}</div>
</div>
</section>
<section class="section section--soft">
<div class="container">
<div class="included">
<div class="included__copy reveal">
<span class="eyebrow">/ Compris dans la gestion</span>
<h2 class="t-display-lg" data-split="words">Ce que nous prenons<br><em>en charge.</em></h2>
<p class="t-body-lg">Le budget publicitaire est versé directement à la plateforme et reste le vôtre. Notre travail de gestion est distinct, annoncé à l’avance, et le compte est créé à votre nom.</p>
<a class="btn btn--ghost btn--lg" href="/advertising">Visibilité &amp; publicité{NE}</a>
</div>
<ul class="included__list included__list--simple stagger">{incl}</ul>
</div>
</div>
</section>
<section class="section">
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
<section class="section section--soft">
<div class="container">
<div class="sec-head reveal">
<span class="eyebrow">/ Aller plus loin</span><h2 class="t-display-lg" data-split="words">Le reste de l’offre.</h2>
</div>
<div class="sector-links reveal">
<a href="/{other['slug']}" data-cursor="view"><span><small>Ads</small>{other['nav']}</span><span aria-hidden="true">{NE}</span></a>
<a href="/seo-local" data-cursor="view"><span><small>SEO</small>Référencement local</span><span aria-hidden="true">{NE}</span></a>
<a href="/websites" data-cursor="view"><span><small>Site</small>Sites sur mesure</span><span aria-hidden="true">{NE}</span></a>
</div>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Plus de visiteurs.<br><em>Et plus de clients.</em></h2>
<p class="t-body-lg">Parlez-nous de votre activité. Nous vous dirons franchement si la publicité est le bon levier pour vous — ou si votre site doit passer en premier.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    return head + main + FOOT


for a in ADS:
    (ROOT / (a['slug'] + '.html')).write_text(page(a))
    print('wrote', a['slug'])

# JSON-LD is owned by one script; run it so this output is never left stale.
import subprocess as _sp, sys as _sys
_sp.run([_sys.executable, str(ROOT / 'scripts' / 'structured_data.py')], check=True)
