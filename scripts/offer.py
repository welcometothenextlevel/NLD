"""The offer: client acquisition, priced per month. The one place it lives.

Fills `<!-- offer:full -->` (who it is for, platforms vs us, price card) and
`<!-- offer:note -->` (one line, booking page) on every root page and writes
the English strings into js/i18n.js between the /* offer */ markers.
Run by scripts/reviews.py, so every generator picks it up.

PRICE is the only amount the site may show; scripts/check-site.py refuses
any other CHF amount.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
PRICE = '1’700'

NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
TICK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

INCLUDED = [
    ('Audit gratuit de votre marché', 'Free audit of your market'),
    ('Campagnes Google Ads', 'Google Ads campaigns'),
    ('Visibilité dans ChatGPT et la recherche IA', 'Visibility in ChatGPT and AI search'),
    ('SEO local et fiche Google', 'Local SEO and Google profile'),
    ('Publicité Meta (Facebook, Instagram)', 'Meta ads (Facebook, Instagram)'),
    ('Site ou page qui convertit, inclus', 'A website or page that converts, included'),
    ('Budget publicitaire inclus', 'Ad budget included'),
    ('Suivi des demandes, rapport mensuel', 'Lead tracking, monthly report'),
    ('Un interlocuteur, 7 jours sur 7', 'One contact, 7 days a week'),
]


def full():
    items = ''.join(f'<li>{TICK}<span>{fr}</span></li>' for fr, _ in INCLUDED)
    return f'''<section class="section offer-sec" id="offre">
<div class="container">
<div class="offer">
<div class="offer__copy reveal">
<span class="eyebrow">/ L’offre</span>
<h2 class="t-display-lg" data-split="words">Des demandes, pas des clics.<br><em>Et rien qu’à vous.</em></h2>
<p class="t-body-lg">Vous vivez du bouche-à-oreille, vos demandes arrivent par vagues, ou vous avez déjà payé pour des « leads » qui n’ont rien donné. Nous mettons en place ce qui vous amène des demandes régulières, et nous le pilotons chaque mois.</p>
<div class="vs">
<div class="vs__col"><span class="vs__who">Plateformes de leads</span><b>Demandes partagées</b><b>Contrat à l’année</b><span class="vs__extra">La même demande vendue à plusieurs concurrents</span></div>
<div class="vs__col vs__col--us"><span class="vs__who">Next Digital Level</span><b>Demandes exclusives</b><b>Sans engagement</b><span class="vs__extra">Chaque demande vient de vos campagnes, pour vous seul</span></div>
</div>
<p class="t-body">Tout commence par un audit gratuit : nous étudions votre métier, votre zone et vos concurrents, puis nous vous disons honnêtement ce qu’il est possible d’obtenir.</p>
</div>
<div class="price-card reveal">
<div class="price-card__top"><span class="eyebrow">Acquisition de clients · par mois</span><span class="price-card__tag">Sans engagement</span></div>
<div class="price"><small>dès</small><b>{PRICE}</b><span>CHF / mois</span></div>
<p class="price__sub">Budget publicitaire inclus. Résiliable chaque mois.</p>
<ul class="price__list">{items}</ul>
<p class="price__zero"><b>Demandes exclusives</b> <i aria-hidden="true">·</i> <b>0 engagement</b></p>
<a class="btn btn--gold btn--lg" href="/book">Demander mon audit gratuit{NE}</a>
</div>
</div>
<p class="offer__fine">Le prix dépend de votre métier et de votre zone : l’audit gratuit le fixe avant tout engagement. Nous ne promettons pas un nombre de demandes avant d’avoir étudié votre marché.</p>
</div>
</section>'''


def note():
    return (f'<p class="offer-note-line"><b>Audit gratuit</b>, puis dès {PRICE} CHF par mois, '
            'budget publicitaire inclus. Sans engagement.</p>')


BLOCKS = {'full': full, 'note': note, 'promo': lambda: ''}
MARK = re.compile(r'<!-- offer:(\w+) -->.*?<!-- /offer:\1 -->', re.S)


def english():
    en = {
        '/ L’offre': '/ The offer',
        'Des demandes, pas des clics.<br><em>Et rien qu’à vous.</em>': 'Enquiries, not clicks.<br><em>And yours alone.</em>',
        'Vous vivez du bouche-à-oreille, vos demandes arrivent par vagues, ou vous avez déjà payé pour des « leads » qui n’ont rien donné. Nous mettons en place ce qui vous amène des demandes régulières, et nous le pilotons chaque mois.':
            'You live on word of mouth, your enquiries come in waves, or you have already paid for “leads” that went nowhere. We set up what brings you steady enquiries, and we run it every month.',
        'Plateformes de leads': 'Lead platforms', 'Demandes partagées': 'Shared enquiries', 'Contrat à l’année': 'Yearly contract',
        'La même demande vendue à plusieurs concurrents': 'The same enquiry sold to several competitors',
        'Demandes exclusives': 'Exclusive enquiries', 'Sans engagement': 'No commitment',
        'Chaque demande vient de vos campagnes, pour vous seul': 'Every enquiry comes from your campaigns, for you alone',
        'Tout commence par un audit gratuit : nous étudions votre métier, votre zone et vos concurrents, puis nous vous disons honnêtement ce qu’il est possible d’obtenir.':
            'It all starts with a free audit: we study your trade, your area and your competitors, then tell you honestly what is achievable.',
        'Acquisition de clients · par mois': 'Client acquisition · per month',
        'Budget publicitaire inclus. Résiliable chaque mois.': 'Ad budget included. Cancel any month.',
        '<b>Demandes exclusives</b> <i aria-hidden="true">·</i> <b>0 engagement</b>': '<b>Exclusive enquiries</b> <i aria-hidden="true">·</i> <b>No commitment</b>',
        'Le prix dépend de votre métier et de votre zone : l’audit gratuit le fixe avant tout engagement. Nous ne promettons pas un nombre de demandes avant d’avoir étudié votre marché.':
            'The price depends on your trade and your area: the free audit sets it before you commit. We don’t promise a number of enquiries before we have studied your market.',
        f'<b>Audit gratuit</b>, puis dès {PRICE} CHF par mois, budget publicitaire inclus. Sans engagement.':
            f'<b>Free audit</b>, then from {PRICE} CHF a month, ad budget included. No commitment.',
        'dès': 'from', 'CHF / mois': 'CHF / month',
    }
    for fr, e in INCLUDED:
        en[f'{{ico}}<span>{fr}</span>'] = f'{{ico}}<span>{e}</span>'
        en[fr] = e
    q = lambda s: "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"
    block = '    /* offer */\n' + ''.join(f'    {q(k)}: {q(v)},\n' for k, v in en.items()) + '    /* /offer */\n'
    p = ROOT / 'js' / 'i18n.js'
    src = p.read_text()
    if '/* offer */' in src:
        src = re.sub(r'    /\* offer \*/\n.*?    /\* /offer \*/\n', lambda m: block, src, flags=re.S)
    else:
        src = src.replace('    /* chrome */\n', block + '    /* chrome */\n', 1)
    p.write_text(src)


def run():
    for f in sorted(ROOT.glob('*.html')):
        src = f.read_text()
        out = MARK.sub(lambda m: f'<!-- offer:{m[1]} -->{BLOCKS[m[1]]()}<!-- /offer:{m[1]} -->', src)
        if out != src:
            f.write_text(out)
    english()


if __name__ == '__main__':
    run()
