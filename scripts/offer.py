"""The offer: one price, everything included. The one place it lives.

Fills `<!-- offer:full -->` (price card + agency comparison) and
`<!-- offer:note -->` (one line, booking page) on every root page and writes
the English strings into js/i18n.js between the /* offer */ markers.
Run by scripts/reviews.py, so every generator picks it up.

PRICE and the agency figures are the only amounts the site may show;
scripts/check-site.py refuses any other CHF amount.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
PRICE = '999'
AGENCY_PRICE, AGENCY_TIME = '3’000 à 8’000 CHF', '2 à 4 mois'
DOMAIN_COST = '15 à 20 CHF'

# Time-limited promotion. Elements marked data-promo show while it runs and
# data-promo-else elements replace them afterwards: the inline head script
# on every page adds .promo-over once PROMO_ENDS has passed, so the site
# falls back to PRICE on its own. Set PROMO_PRICE = None to remove it.
PROMO_PRICE = '799'
PROMO_UNTIL = '31 octobre'
PROMO_UNTIL_EN = '31 October'
PROMO_ENDS = '2026-11-01T00:00:00+01:00'   # also in the head script of every page

NE = '<svg class="ico" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
TICK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

INCLUDED = [
    ('Textes rédigés pour vous', 'Text written for you'),
    ('Images choisies pour votre activité', 'Images chosen for your business'),
    ('Design sur mesure, mobile et ordinateur', 'Custom design, mobile and desktop'),
    ('Formulaires de contact et de devis', 'Contact and quote forms'),
    ('Réservation en ligne', 'Online booking'),
    ('Paiement en ligne', 'Online payment'),
    ('SEO local et fiche Google', 'Local SEO and Google profile'),
    ('Hébergement et mise en ligne', 'Hosting and launch'),
    ('12 mois de suivi, 7 jours sur 7', '12 months of support, 7 days a week'),
]


def promo_ribbon():
    if not PROMO_PRICE:
        return ''
    return f'<p class="price-card__promo" data-promo>Offre d’octobre · jusqu’au {PROMO_UNTIL}</p>'


def price_block():
    if not PROMO_PRICE:
        return f'<div class="price"><b>{PRICE}</b><span>CHF</span></div>'
    return (f'<div class="price" data-promo><s aria-label="au lieu de {PRICE} CHF">{PRICE}</s><b>{PROMO_PRICE}</b><span>CHF</span></div>'
            f'<div class="price" data-promo-else><b>{PRICE}</b><span>CHF</span></div>')


def promo():
    """The pill under hero buttons; empty once the promotion is removed."""
    if not PROMO_PRICE:
        return ''
    return (f'<p class="promo-pill" data-promo><span class="promo-pill__tag">Offre d’octobre</span>'
            f'<span><s>{PRICE}</s> <b>{PROMO_PRICE} CHF</b> tout compris, jusqu’au {PROMO_UNTIL}</span></p>')


def us_price():
    if not PROMO_PRICE:
        return f'{PRICE} CHF'
    return f'<span data-promo>{PROMO_PRICE} CHF</span><span data-promo-else>{PRICE} CHF</span>'


def full():
    items = ''.join(f'<li>{TICK}<span>{fr}</span></li>' for fr, _ in INCLUDED)
    return f'''<section class="section offer-sec" id="offre">
<div class="container">
<div class="offer">
<div class="offer__copy reveal">
<span class="eyebrow">/ L’offre</span>
<h2 class="t-display-lg" data-split="words">Un prix. Tout compris.<br><em>Rien d’autre à payer.</em></h2>
<p class="t-body-lg">Une agence classique demande souvent {AGENCY_TIME} et {AGENCY_PRICE} pour un site. Nous livrons la même qualité en 48 heures, pour {PRICE} CHF payés une seule fois.</p>
<div class="vs">
<div class="vs__col"><span class="vs__who">Agence classique</span><b>{AGENCY_TIME}</b><b>{AGENCY_PRICE}</b><span class="vs__extra">Textes, photos et fonctionnalités souvent facturés en plus</span></div>
<div class="vs__col vs__col--us"><span class="vs__who">Next Digital Level</span><b>48 heures</b><b>{us_price()}</b><span class="vs__extra">Tout est compris, sans abonnement</span></div>
</div>
<p class="t-body">Aucun abonnement, aucuns frais annuels, aucun supplément caché. Vous voyez d’abord votre aperçu gratuit, et vous ne payez que s’il vous plaît.</p>
</div>
<div class="price-card reveal">
{promo_ribbon()}<div class="price-card__top"><span class="eyebrow">Création de site · paiement unique</span><span class="price-card__tag">Prêt en 48 heures</span></div>
{price_block()}
<p class="price__sub">Payé une seule fois, après validation de votre aperçu gratuit.</p>
<ul class="price__list">{items}</ul>
<p class="price__zero"><b>0 CHF</b> par mois <i aria-hidden="true">·</i> <b>0 CHF</b> par an</p>
<a class="btn btn--gold btn--lg" href="/book">Demander mon aperçu gratuit{NE}</a>
</div>
</div>
<p class="offer__fine">Les seuls frais qui ne viennent pas de nous : votre nom de domaine, acheté à votre nom (environ {DOMAIN_COST} par an), les commissions de votre prestataire de paiement sur vos ventes, et un budget publicitaire si vous choisissez d’en faire.</p>
</div>
</section>'''


def note():
    line = (f'<p class="offer-note-line"{{attr}}><b>{{price}} CHF tout compris</b>, payé une seule fois. '
            'Prêt en 48 heures. Aucun abonnement.</p>')
    if not PROMO_PRICE:
        return line.format(attr='', price=PRICE)
    return (f'<p class="offer-note-line" data-promo><b><s>{PRICE}</s> {PROMO_PRICE} CHF tout compris</b> jusqu’au {PROMO_UNTIL}, '
            'payé une seule fois. Prêt en 48 heures. Aucun abonnement.</p>'
            + line.format(attr=' data-promo-else', price=PRICE))


BLOCKS = {'full': full, 'note': note, 'promo': promo}
MARK = re.compile(r'<!-- offer:(\w+) -->.*?<!-- /offer:\1 -->', re.S)


def english():
    en = {
        '/ L’offre': '/ The offer',
        'Un prix. Tout compris.<br><em>Rien d’autre à payer.</em>': 'One price. Everything included.<br><em>Nothing else to pay.</em>',
        f'Une agence classique demande souvent {AGENCY_TIME} et {AGENCY_PRICE} pour un site. Nous livrons la même qualité en 48 heures, pour {PRICE} CHF payés une seule fois.':
            f'A traditional agency often takes 2 to 4 months and charges 3’000 to 8’000 CHF for a website. We deliver the same quality in 48 hours, for {PRICE} CHF paid once.',
        'Agence classique': 'Traditional agency', AGENCY_TIME: '2 to 4 months', AGENCY_PRICE: '3’000 to 8’000 CHF',
        'Textes, photos et fonctionnalités souvent facturés en plus': 'Text, photos and features often billed on top',
        '48 heures': '48 hours', 'Tout est compris, sans abonnement': 'Everything included, no subscription',
        'Aucun abonnement, aucuns frais annuels, aucun supplément caché. Vous voyez d’abord votre aperçu gratuit, et vous ne payez que s’il vous plaît.':
            'No subscription, no yearly fees, no hidden extras. You see your free preview first, and you only pay if you like it.',
        'Création de site · paiement unique': 'Website creation · one-time payment', 'Prêt en 48 heures': 'Ready in 48 hours',
        'Payé une seule fois, après validation de votre aperçu gratuit.': 'Paid once, after you approve your free preview.',
        '<b>0 CHF</b> par mois <i aria-hidden="true">·</i> <b>0 CHF</b> par an': '<b>0 CHF</b> per month <i aria-hidden="true">·</i> <b>0 CHF</b> per year',
        f'Les seuls frais qui ne viennent pas de nous : votre nom de domaine, acheté à votre nom (environ {DOMAIN_COST} par an), les commissions de votre prestataire de paiement sur vos ventes, et un budget publicitaire si vous choisissez d’en faire.':
            'The only costs that don’t come from us: your domain name, bought in your own name (about 15 to 20 CHF a year), your payment provider’s commission on your sales, and an advertising budget if you choose to advertise.',
        f'Offre d’octobre · jusqu’au {PROMO_UNTIL}': f'October offer · until {PROMO_UNTIL_EN}',
        'Offre d’octobre': 'October offer',
        f'<s>{PRICE}</s> <b>{PROMO_PRICE} CHF</b> tout compris, jusqu’au {PROMO_UNTIL}': f'<s>{PRICE}</s> <b>{PROMO_PRICE} CHF</b>, everything included, until {PROMO_UNTIL_EN}',
        f'<b><s>{PRICE}</s> {PROMO_PRICE} CHF tout compris</b> jusqu’au {PROMO_UNTIL}, payé une seule fois. Prêt en 48 heures. Aucun abonnement.':
            f'<b><s>{PRICE}</s> {PROMO_PRICE} CHF, everything included</b> until {PROMO_UNTIL_EN}, paid once. Ready in 48 hours. No subscription.',
        f'<b>{PRICE} CHF tout compris</b>, payé une seule fois. Prêt en 48 heures. Aucun abonnement.':
            f'<b>{PRICE} CHF, everything included</b>, paid once. Ready in 48 hours. No subscription.',
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
