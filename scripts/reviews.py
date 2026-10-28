"""Client reviews: the one place they live.

Every review block on the site sits between markers such as
`<!-- reviews:home -->` and `<!-- /reviews:home -->`; this script rewrites
what is inside them on every root page, builds /avis, then runs
structured_data.py. The page generators emit empty markers and call this
script, so a new review only ever needs adding here.

    python3 scripts/reviews.py

Texts are copied word for word from the Google Business Profile and stay in
their original language (the EN toggle leaves them untouched). No Review or
AggregateRating markup: Google does not show stars for reviews a business
publishes about itself, and the counts below would go stale in schema.
"""
from pathlib import Path
import html, re

ROOT = Path(__file__).resolve().parent.parent

# Update these two when the profile changes. RATED counts every rating,
# including ones left without a comment (which have no card below).
RATING, RATED = '5,0', 12
SEE_URL = 'https://search.google.com/local/reviews?placeid=ChIJDxHjKQyWSAkRY9ludK1MBZE'
WRITE_URL = 'https://search.google.com/local/writereview?placeid=ChIJDxHjKQyWSAkRY9ludK1MBZE'

# Newest first. `tags` decide which page blocks quote the review.
# `show=False` keeps a review counted in RATED but off the site.
REVIEWS = [
    dict(name='Troy Petersen', date='octobre 2026', lang='en', tags={'speed', 'design'},
         text=['Excellent service. fast and prompt and would highly recommend to anyone looking for a website']),
    dict(name='Ahmet Hoti', date='octobre 2026', lang='fr', tags={'marketing', 'results'},
         text=['Très satisfait de son travail ! Il m’a créé mon site internet et fait de la publicité pour mon entreprise de dépannage sanitaire. Grâce à lui, j’ai gagné en visibilité et obtenu de nouveaux clients. Très professionnel, sérieux et efficace, je recommande à 100 % !']),
    # Char's Beauty Room, Melbourne (first card in the portfolio).
    dict(name='Charmayne Grech', date='octobre 2026', lang='en', tags={'design'}, company='Char’s Beauty Room · Melbourne', slug='charmayne-grech',
         text=['Next digital level, has been absoulty amazing, from the start designed a new website 2 weeks turnaround. One of best desinged websites I’ve had. Very proffessional service. Highy recommend thank you']),
    dict(name='Vaciraya Pechlak', date='octobre 2026', lang='en', tags={'marketing'},
         text=['I’m very satisfied with their digital marketing services. The team is professional, easy to communicate with, and committed to providing quality service. A great choice for businesses looking to improve their online presence!']),
    dict(name='Mehdi Meharga', date='octobre 2026', lang='fr', tags={'marketing'},
         text=['Très satisfait je recommande, site internet + service marketing au top']),
    dict(name='Kaelyb Douglas', date='octobre 2026', lang='fr', tags={'suivi'},
         text=['Je recommande personnel très professionnel et au petit soin avec ses clients']),
    dict(name='Melik Karatas', date='octobre 2026', lang='fr', tags={'lausanne', 'suivi'},
         text=['Meilleure agence de création de site sur Lausanne, y’a un suivi impeccable, réponse rapide, rien à dire !']),
    dict(name='Omar Silva', date='octobre 2026', lang='fr', tags={'lausanne', 'results'},
         text=['J’avais un autre site avant que j’ai payé une fortune qui s’affichait pas bien sur téléphone et sur 4 ans j’ai eu 3-4 appels provenant du site.',
               'L’équipe de next digital level a fait le site en moins d’une semaine et après 3 semaines j’ai déjà des clients provenant du site.',
               'C’est les meilleures en terme de création de site internet à Lausanne.',
               'Merci Amin']),
    dict(name='Osman Konut', date='octobre 2026', lang='fr', tags={'speed'},
         text=['La rapidité d’exécution et la qualité du travail m’ont vraiment agréablement surpris. Je recommande vraiment ce service! Merci beaucoup pour notre collaboration!!']),
    dict(name='Youssef Baraka', date='octobre 2026', lang='fr', tags={'lausanne', 'suivi', 'speed'},
         text=['La meilleure agence de création de site internet a lausanne !',
               'Ils sont disponibles du lundi au dimanche et le site a été bouclé en 5 jours ! Grand merci au fondateur']),
    # Shown on the profile as the signed-in owner's own review, so it stays
    # off the site until confirmed to be an independent client's.
    dict(name='Bruce', date='octobre 2026', lang='fr', tags=set(), show=False,
         text=['Travail exceptionnel, une équipe acharnée qui ne dort pas ! Chaque question préoccupation, ils sont là à toute heure pour répondre et aider. Les meilleurs créateurs de site internet de Lausanne, je ne peux que les recommander, spécialement Amin le fondateur ! Je le connais depuis ses débuts et rien ne lui fait froid aux yeux, même les sites les plus techniques ! J\'en suis pas à mon coup d\'essai avec eux. Vraiment des champions. Merci 1000 fois. Bruce C.']),
]
SHOWN = [r for r in REVIEWS if r.get('show', True)]

NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
STARS = '<span class="rv-stars" role="img" aria-label="5 étoiles sur 5">' + '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/></svg>' * 5 + '</span>'
G = ('<svg class="rv-g" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
     '<path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>'
     '<path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9h-4v3.1A12 12 0 0 0 12 24z"/>'
     '<path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8z"/>'
     '<path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/></svg>')
EXT = ' target="_blank" rel="noopener noreferrer"'


def card(r, anchor=False):
    body = ''.join('<p>%s</p>' % html.escape(p, quote=False) for p in r['text'])
    # /avis gives a card an id when something links to it (the portfolio does).
    ident = f' id="{r["slug"]}"' if anchor and r.get('slug') else ''
    return (f'<figure class="rv-card"{ident}>'
            f'<div class="rv-card__top">{STARS}{G}</div>'
            f'<blockquote class="rv-card__text" lang="{r["lang"]}">{body}</blockquote>'
            f'<figcaption><span class="rv-avatar" aria-hidden="true">{html.escape(r["name"][0])}</span>'
            f'<span class="rv-who"><b>{html.escape(r["name"])}</b>'
            + (f'<span class="rv-co">{html.escape(r["company"])}</span>' if r.get('company') else '')
            + f'<small>Avis Google · {r["date"]}</small></span></figcaption>'
            '</figure>')


def score(cls=''):
    return (f'<a class="rv-score {cls}" href="/avis">{STARS}<b>{RATING}</b>'
            f'<span>{RATED} avis Google</span></a>')


def buttons(all_link=True):
    out = '<div class="rv-actions">'
    if all_link:
        out += f'<a class="btn btn--primary" href="/avis">Lire tous nos avis{NE}</a>'
    out += f'<a class="btn btn--ghost" href="{SEE_URL}"{EXT}>Voir nos avis sur Google{NE}</a>'
    out += f'<a class="btn btn--ghost" href="{WRITE_URL}"{EXT}>Laisser un avis{NE}</a>'
    return out + '</div>'


PREV = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
NEXT = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def rail(items, label='Avis clients'):
    return (f'<div class="rv-viewport" data-reviews-rail tabindex="0" aria-label="{label}"><div class="rv-rail">'
            + ''.join(card(r) for r in items) + '</div></div>'
            f'<div class="rv-controls"><button class="rbtn" type="button" data-rv-prev aria-label="Avis précédent">{PREV}</button>'
            f'<button class="rbtn" type="button" data-rv-next aria-label="Avis suivant">{NEXT}</button>'
            '<span class="work__hint">Faites défiler les avis</span></div>')


def section(eyebrow, title, sub, items, soft=False, all_link=True, sid=''):
    return (f'<section class="section reviews{" section--soft" if soft else ""}"{f" id={chr(34)}{sid}{chr(34)}" if sid else ""}>\n'
            '<div class="container">\n'
            '<div class="reviews__head">\n'
            f'<div class="sec-head reveal"><span class="eyebrow">{eyebrow}</span><h2 class="t-display-lg" data-split="words">{title}</h2><p class="t-body">{sub}</p></div>\n'
            f'<div class="rv-summary reveal"><b class="rv-summary__n">{RATING}</b>{STARS}<span>{RATED} avis sur Google</span></div>\n'
            '</div>\n'
            f'{rail(items)}\n'
            f'{buttons(all_link)}\n'
            '</div>\n'
            '</section>')


def pick(*tags):
    return [r for r in SHOWN if r['tags'] & set(tags)] if tags else SHOWN


BLOCKS = {
    'score': lambda: score(),
    'home': lambda: section('/ Avis clients', 'Ce que disent<br><em>nos clients.</em>',
                            'Des avis laissés sur notre fiche Google, reproduits tels quels.', pick(), sid='avis-clients'),
    'websites': lambda: section('/ Avis clients', 'Ils recevaient peu de demandes.<br><em>Voici ce qu’ils en disent.</em>',
                                'Des avis laissés sur notre fiche Google, reproduits tels quels.', pick(), soft=True),
    'lausanne': lambda: section('/ Avis à Lausanne', 'Ils nous ont fait confiance<br><em>à Lausanne.</em>',
                                'Des avis laissés sur notre fiche Google, reproduits tels quels.', pick('lausanne', 'speed')),
    'marketing': lambda: section('/ Avis clients', 'Site et marketing,<br><em>du même côté.</em>',
                                 'Des avis laissés sur notre fiche Google, reproduits tels quels.', pick('marketing', 'results')),
    'all': lambda: section('/ Avis clients', 'Ce que disent<br><em>nos clients.</em>',
                           'Des avis laissés sur notre fiche Google, reproduits tels quels.', pick()),
    'book': lambda: section('/ Avis clients', 'Ils sont passés<br><em>par la même étape.</em>',
                            'L’audit, la page, puis les demandes. Voici ce qu’ils en disent sur Google.', pick()),
    'suivi': lambda: section('/ Avis clients', 'Disponibles,<br><em>et ça se remarque.</em>',
                             'Des avis laissés sur notre fiche Google, reproduits tels quels.', pick('suivi', 'speed')),
}


def avis_page():
    base = (ROOT / 'websites.html').read_text()
    head = base[:base.index('<main id="main">') + len('<main id="main">')]
    foot = base[base.index('</main>'):]
    title = 'Avis clients | Next Digital Level'
    desc = f'{RATING} sur 5 sur Google : les avis de nos clients sur la création de leur site internet et leur marketing en Suisse romande. Lisez-les ou laissez le vôtre.'
    head = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', head)
    for pat, val in [(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(desc, quote=True)}">'),
                     (r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://nextdigitalevel.com/avis">'),
                     (r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="Avis clients">'),
                     (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{html.escape(desc, quote=True)}">'),
                     (r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://nextdigitalevel.com/avis">'),
                     (r'<meta name="twitter:title" content="[^"]*">', '<meta name="twitter:title" content="Avis clients">'),
                     (r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{html.escape(desc, quote=True)}">')]:
        head = re.sub(pat, val, head)
    grid = ''.join(card(r, anchor=True) for r in SHOWN)
    main = f'''
<section class="hero inner-hero rv-hero">
<div class="hero__aura" aria-hidden="true"></div>
<div class="container hero__inner">
<span class="eyebrow">/ Avis clients</span><h1 class="t-display-xl hero__title">Nos clients<br><em>en parlent mieux que nous.</em></h1>
<p class="t-body-lg hero__lead">Beaucoup citent Amin, le fondateur : c’est lui qui vous répond, sans intermédiaire, du premier message à la mise en ligne.</p>
<p class="t-body hero__lead">Chaque avis ci-dessous a été laissé sur notre fiche Google par un client, et il est reproduit tel quel, dans sa langue d’origine. Vous pouvez tous les vérifier sur Google.</p>
<div class="rv-hero__score"><b class="rv-summary__n">{RATING}</b><div>{STARS}<span>{RATED} avis sur Google</span></div></div>
{buttons(all_link=False)}
</div>
</section>
<section class="section">
<div class="container">
<div class="rv-grid stagger">{grid}</div>
<p class="rv-note">Les notes laissées sans commentaire sont comptées dans la moyenne mais n’apparaissent pas ici.</p>
</div>
</section>
<section class="section section--soft">
<div class="container rv-ask reveal">
<span class="eyebrow">/ Vous êtes client ?</span>
<h2 class="t-display-lg" data-split="words">Votre avis compte<br><em>plus que notre publicité.</em></h2>
<p class="t-body-lg">Un avis de quelques lignes aide une autre PME de Suisse romande à choisir en confiance. Il ne prend qu’une minute et nous lisons chacun d’entre eux.</p>
<a class="btn btn--primary btn--lg" href="{WRITE_URL}"{EXT}>Laisser un avis sur Google{NE}</a>
</div>
</section>
<section class="cta-band" data-dots-region>
<canvas class="dot-canvas dot-canvas--dark" data-dots data-dots-theme="dark" aria-hidden="true"></canvas>
<div class="container cta-band__inner reveal">
<span class="eyebrow">/ On commence ?</span><h2 class="t-display-lg" data-split="words">Votre entreprise, le prochain avis.<br><em>Commençons par l’audit.</em></h2><p class="t-body-lg">Parlez-nous de votre activité. Nous commençons par un audit gratuit de votre marché, sans engagement.</p>
<div class="hero__actions">
<a class="btn btn--gold btn--lg" href="/book">Demander mon audit gratuit{NE}</a><a class="btn btn--onpanel btn--lg" href="https://wa.me/41762632817">Parlons-en sur WhatsApp{NE}</a>
</div>
</div>
</section>
'''
    (ROOT / 'avis.html').write_text(head + main + foot)


MARK = re.compile(r'<!-- reviews:(\w+) -->.*?<!-- /reviews:\1 -->', re.S)


def inject():
    for f in sorted(ROOT.glob('*.html')):
        src = f.read_text()
        out = MARK.sub(lambda m: f'<!-- reviews:{m[1]} -->{BLOCKS[m[1]]()}<!-- /reviews:{m[1]} -->', src)
        if out != src:
            f.write_text(out)


# English for every string the blocks above print, written into js/i18n.js
# between the /* reviews */ markers so the counts can never drift apart.
# Review texts themselves are deliberately absent: they stay as written.
def english():
    ico = '{ico}'
    en = {
        '/ Avis clients': '/ Client reviews', '/ Avis à Lausanne': '/ Reviews in Lausanne', '/ Vous êtes client ?': '/ Are you a client?',
        'Ce que disent<br><em>nos clients.</em>': 'What our clients<br><em>say.</em>',
        'Ils recevaient peu de demandes.<br><em>Voici ce qu’ils en disent.</em>': 'They weren’t getting many enquiries.<br><em>Here is what they say.</em>',
        'Ils nous ont fait confiance<br><em>à Lausanne.</em>': 'They trusted us<br><em>in Lausanne.</em>',
        'Site et marketing,<br><em>du même côté.</em>': 'Website and marketing,<br><em>on the same side.</em>',
        'Disponibles,<br><em>et ça se remarque.</em>': 'Available,<br><em>and it shows.</em>',
        'Des avis laissés sur notre fiche Google, reproduits tels quels.': 'Reviews left on our Google Business Profile, reproduced as written.',
        RATING: RATING.replace(',', '.'),
        f'{RATED} avis sur Google': f'{RATED} reviews on Google', f'{RATED} avis Google': f'{RATED} Google reviews',
        f'Lire tous nos avis{ico}': f'Read all our reviews{ico}', f'Voir nos avis sur Google{ico}': f'See our reviews on Google{ico}',
        f'Laisser un avis{ico}': f'Leave a review{ico}', f'Laisser un avis sur Google{ico}': f'Leave a review on Google{ico}',
        'Avis': 'Reviews', 'Avis clients': 'Client reviews', '<span>04</span> Avis clients': '<span>04</span> Client reviews',
        'Ils sont passés<br><em>par la même étape.</em>': 'They started<br><em>exactly where you are.</em>',
        'L’audit, la page, puis les demandes. Voici ce qu’ils en disent sur Google.': 'The audit, the page, then the enquiries. Here is what they say about it on Google.',
        'Faites défiler les avis': 'Scroll through the reviews',
        'Beaucoup citent Amin, le fondateur : c’est lui qui vous répond, sans intermédiaire, du premier message à la mise en ligne.': 'Many mention Amin, the founder: he is the one who answers you, with no middleman, from the first message to launch day.',
        'Nos clients<br><em>en parlent mieux que nous.</em>': 'Our clients<br><em>say it better than we do.</em>',
        'Chaque avis ci-dessous a été laissé sur notre fiche Google par un client, et il est reproduit tel quel, dans sa langue d’origine. Vous pouvez tous les vérifier sur Google.':
            'Every review below was left by a client on our Google Business Profile and is reproduced as written, in its original language. You can check each one on Google.',
        'Les notes laissées sans commentaire sont comptées dans la moyenne mais n’apparaissent pas ici.': 'Ratings left without a comment count towards the average but are not shown here.',
        'Votre avis compte<br><em>plus que notre publicité.</em>': 'Your review counts<br><em>more than our advertising.</em>',
        'Un avis de quelques lignes aide une autre PME de Suisse romande à choisir en confiance. Il ne prend qu’une minute et nous lisons chacun d’entre eux.':
            'A few lines help another small business in French-speaking Switzerland choose with confidence. It takes a minute, and we read every one.',
        'Votre entreprise, le prochain avis.<br><em>Commençons par l’audit.</em>': 'Your business, the next review.<br><em>Let’s start with the audit.</em>',
    }
    months = {'octobre': 'October', 'novembre': 'November', 'décembre': 'December', 'janvier': 'January', 'février': 'February', 'mars': 'March',
              'avril': 'April', 'mai': 'May', 'juin': 'June', 'juillet': 'July', 'août': 'August', 'septembre': 'September'}
    for r in SHOWN:
        m, y = r['date'].split()
        en[f'Avis Google · {r["date"]}'] = f'Google review · {months[m]} {y}'
    q = lambda s: "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"
    block = '    /* reviews */\n' + ''.join(f'    {q(k)}: {q(v)},\n' for k, v in en.items()) + '    /* /reviews */\n'
    p = ROOT / 'js' / 'i18n.js'
    src = p.read_text()
    if '/* reviews */' in src:
        src = re.sub(r'    /\* reviews \*/\n.*?    /\* /reviews \*/\n', lambda m: block, src, flags=re.S)
    else:
        src = src.replace('    /* chrome */\n', block + '    /* chrome */\n', 1)
    attrs = {'5 étoiles sur 5': '5 stars out of 5', 'Avis clients': 'Client reviews', 'Avis précédent': 'Previous review', 'Avis suivant': 'Next review'}
    for k, v in attrs.items():
        if f"    {q(k)}:" not in src.split('  const ATTR = {', 1)[1]:
            src = src.replace('  const ATTR = {\n', f'  const ATTR = {{\n    {q(k)}: {q(v)},\n', 1)
    if "'avis':" not in src:
        src = src.replace("  const TITLES = {\n", "  const TITLES = {\n    'avis': 'Client reviews | Next Digital Level',\n    'avis.html': 'Client reviews | Next Digital Level',\n", 1)
    p.write_text(src)


if __name__ == '__main__':
    avis_page()
    inject()
    english()
    sys_path = str(ROOT / 'scripts')
    import sys as _sys
    if sys_path not in _sys.path: _sys.path.insert(0, sys_path)
    import offer
    offer.run()
    import subprocess, sys
    subprocess.run([sys.executable, str(ROOT / 'scripts' / 'structured_data.py')], check=True)
