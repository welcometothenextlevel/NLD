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

TAGLINE = 'Des demandes exclusives.<br><em>Pas des clics.</em>'

# The positioning argument, shared by both pages: the same words the owner uses
# to separate the studio from agencies that stop at a good-looking site.
STANCE = [
    ('Des demandes, pas de la visibilité',
     'Des impressions et des clics ne paient pas vos factures. Nous mesurons une seule chose : combien d’appels, de demandes de devis et de réservations vous recevez, et d’où elles viennent.'),
    ('Exclusives, jamais partagées',
     'Chaque demande vient de vos propres campagnes et arrive chez vous seul. Rien n’est revendu à un concurrent, contrairement aux plateformes de leads.'),
    ('Un canal, un prix',
     'Chaque canal est un service à part, dès 1’200 CHF par mois et sans engagement. Sur Google Ads et Meta, le budget publicitaire est compris : pas de facture séparée.'),
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
         included=['Budget publicitaire inclus',
                   'Paramétrage du pixel et du suivi des demandes',
                   'Visuels et textes des annonces',
                   'Ciblage par commune et par centres d’intérêt',
                   'Formulaires de contact Meta',
                   'Suivi, optimisation et point sur les résultats'],
         faq=[('Le budget publicitaire est-il compris ?',
               'Oui. Ce que nous dépensons sur Facebook et Instagram pour vos campagnes fait partie du prix mensuel, dès 1’200 CHF. Vous n’avez pas de facture séparée de Meta.'),
              ('Les demandes sont-elles partagées avec d’autres entreprises ?',
               'Non. Les demandes viennent de vos propres annonces et de vos formulaires : elles arrivent chez vous seul et ne sont revendues à personne.'),
              ('Faut-il déjà avoir un site ?',
               'Non. Si votre site ne convertit pas, nous construisons une page ou un site fait pour transformer les visiteurs en demandes, et c’est inclus dans le prix.'),
              ('En combien de temps voit-on des résultats ?',
               'Les premières demandes arrivent souvent dans les premiers jours, mais il faut compter quelques semaines pour que la campagne se stabilise. Personne ne peut garantir un volume précis, et nous ne le ferons pas.')]),

    dict(slug='recherche-ia', nav='Recherche ChatGPT', other=None,
         icon=True, badge='Recherche ChatGPT et IA',
         title='Être recommandé par ChatGPT et la recherche IA | Next Digital Level',
         desc='Être cité par ChatGPT, Gemini et les résumés IA de Google quand un client cherche votre métier en Suisse romande. Inclus dans notre service de demandes de devis.',
         eyebrow='/ Recherche ChatGPT',
         h1='Recherche ChatGPT.<br><em>Faire partie de la réponse.</em>',
         lead='« Quel électricien recommandes-tu à Sion ? » De plus en plus de clients posent la question à ChatGPT plutôt qu’à Google. L’assistant ne donne pas dix liens : il cite deux ou trois entreprises. Nous travaillons pour que la vôtre en fasse partie.',
         intro_badge='ChatGPT, Gemini, Perplexity et les résumés IA de Google répondent déjà à la question « qui appeler ». C’est l’un de nos quatre canaux, proposé séparément, comme Google Ads, le référencement local et Meta.',
         why=[('Des clients qui demandent un nom',
               'Une question posée à un assistant IA est souvent la dernière étape avant l’appel. Être cité à ce moment-là vaut une recommandation.'),
              ('Des sources que l’IA croit',
               'Les assistants s’appuient sur votre site, votre fiche Google, vos avis et ce que d’autres sites disent de vous. Nous rendons ces informations claires, cohérentes et faciles à citer.'),
              ('Mesuré comme le reste',
               'Nous suivons les visites et les demandes qui viennent de ChatGPT et des autres assistants, dans le même rapport mensuel que vos campagnes.')],
         steps=[('On regarde ce que l’IA dit de vous',
                 'Nous posons aux assistants les questions de vos clients, dans votre région, et nous notons qui est cité et pourquoi.'),
                ('On corrige vos sources',
                 'Site, fiche Google, avis, annuaires : des informations exactes et identiques partout, et des pages qui répondent clairement aux questions de vos clients.'),
                ('On construit votre réputation en ligne',
                 'Avis clients, mentions sur des sites locaux et contenus utiles : ce qui fait qu’une entreprise est jugée fiable, par un assistant comme par un humain.'),
                ('On mesure et on ajuste',
                 'Chaque mois, nous vérifions à nouveau ce que disent les assistants et nous suivons les demandes qui en viennent.')],
         included=['Audit de ce que disent ChatGPT, Gemini et Google',
                   'Pages qui répondent aux questions de vos clients',
                   'Fiche Google et données structurées cohérentes',
                   'Stratégie d’avis clients',
                   'Suivi des visites venues des assistants IA',
                   'Un canal à part, sans engagement'],
         faq=[('Pouvez-vous garantir que ChatGPT me recommande ?',
               'Non, personne ne le peut : les assistants choisissent eux-mêmes leurs sources. Nous travaillons ce qui augmente vos chances d’être cité, et nous mesurons ce que cela rapporte.'),
              ('Est-ce différent du référencement Google ?',
               'Les bases sont proches : un site clair, une fiche Google complète, de bons avis. Mais les assistants citent des réponses, pas des pages : nous écrivons donc des contenus qui répondent directement aux questions de vos clients.'),
              ('Combien ça coûte ?',
               'C’est un canal à part entière, dès 1’200 CHF par mois et sans engagement. L’audit gratuit vous dit s’il est le plus rentable pour votre métier.'),
              ('Quels assistants sont concernés ?',
               'ChatGPT, Gemini, Perplexity, Copilot et les résumés IA qui apparaissent en haut des résultats Google.')]),

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
         included=['Budget publicitaire inclus',
                   'Recherche de mots-clés et de zone géographique',
                   'Rédaction des annonces et des extensions',
                   'Exclusion des requêtes non pertinentes',
                   'Suivi des appels et des demandes',
                   'Optimisation et point sur les résultats'],
         faq=[('Google Ads ou référencement naturel ?',
               'Les deux, à des moments différents. Le référencement naturel est plus durable mais met des mois à s’installer ; Google Ads donne de la visibilité immédiatement. Beaucoup de nos clients démarrent avec Ads, puis réduisent quand le naturel prend le relais.'),
              ('Le budget publicitaire est-il compris ?',
               'Oui. Ce que nous dépensons sur Google pour vos annonces fait partie du prix mensuel, dès 1’200 CHF. Vous n’avez pas de facture séparée de Google, et pas d’engagement.'),
              ('Les demandes sont-elles exclusives ?',
               'Oui. Elles viennent de vos propres annonces, vers votre propre page ou votre numéro. Elles arrivent chez vous seul.'),
              ('Pouvez-vous garantir la première place ?',
               'Personne ne le peut honnêtement. La position dépend de votre enchère, de la qualité de l’annonce et de la page d’arrivée. Nous travaillons ces deux derniers points, qui sont ceux que l’on maîtrise.')]),
]
BY_SLUG = {a['slug']: a for a in ADS}


def badge_visual(a):
    """An official partner badge is shown unaltered on a white plate (its own
    background); a plain platform mark is shown at icon size."""
    if a.get('icon'):
        return ('<span class="adbadge__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none">'
                '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
                '<path d="M8.5 8.5h7M8.5 11.5h4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>')
    if a.get('badge_img'):
        base, w, h = a['badge_img']
        return ('<span class="badge-plate"><picture><source srcset="%s.webp" type="image/webp">'
                '<img class="badge-plate__img" src="%s.png" width="%d" height="%d" alt="Badge %s" decoding="async">'
                '</picture></span>') % (base, base, w, h, 'Google Ads Certified Partner')
    return '<img class="adbadge__logo" src="%s" width="%d" height="%d" alt="%s" decoding="async">' % (
        a['logo'], a['logo_w'], a['logo_h'], a['logo_alt'])


def page(a):
    others = [o for o in ADS if o['slug'] != a['slug']]
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
        {"@type": "ListItem", "position": 2, "name": "Nos canaux", "item": "https://nextdigitalevel.com/advertising"},
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
<a class="btn btn--primary btn--lg" href="/book">Demander mon audit gratuit{NE}</a><a class="btn btn--ghost btn--lg" href="tel:+41762632817">Appeler le +41 76 263 28 17{NE}</a>
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
<p class="t-body-lg tagline__sub">Google Ads, recherche ChatGPT, référencement local et Meta ne sont que des moyens. Ce que nous vous livrons, ce sont des appels, demandes de devis et réservations, chaque mois.</p>
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
<span class="eyebrow">/ Compris dans votre mois</span>
<h2 class="t-display-lg" data-split="words">Ce que nous prenons<br><em>en charge.</em></h2>
<p class="t-body-lg">Chaque canal est un service à part, dès 1’200 CHF par mois. Sur Google Ads et Meta, le budget publicitaire est inclus. Sans engagement : vous restez parce que les appels arrivent.</p>
<a class="btn btn--ghost btn--lg" href="/websites">Voir l’offre complète{NE}</a>
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
<span class="eyebrow">/ Aller plus loin</span><h2 class="t-display-lg" data-split="words">Les autres canaux.</h2>
</div>
<div class="sector-links reveal">
{''.join(f'<a href="/{o["slug"]}" data-cursor="view"><span><small>Canal</small>{o["nav"]}</span><span aria-hidden="true">{NE}</span></a>' for o in others)}
<a href="/seo-local" data-cursor="view"><span><small>SEO</small>Référencement local</span><span aria-hidden="true">{NE}</span></a>
<a href="/websites" data-cursor="view"><span><small>Offre</small>L’offre complète</span><span aria-hidden="true">{NE}</span></a>
</div>
</div>
</section>
<!-- reviews:marketing --><!-- /reviews:marketing -->
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Plus d’appels.<br><em>Pour vous seul.</em></h2>
<p class="t-body-lg">Parlez-nous de votre activité. L’audit gratuit vous dit quel canal rapportera le plus pour votre métier, et ce qu’il est réaliste d’obtenir.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book">Demander mon audit gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
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
_sp.run([_sys.executable, str(ROOT / 'scripts' / 'reviews.py')], check=True)
